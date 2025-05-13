import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export type Transaction = {
  id?: string;
  user_id: string;
  account_id: string; // Make account_id required as per Supabase constraint
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string | null;
  date: string;
  created_at?: string;
};

export type TransactionWithId = Transaction & { id: string };

// Local storage key for transactions
const TRANSACTIONS_STORAGE_KEY = 'budget_tracker_transactions';

// Helper function to get transactions from local storage
const getLocalTransactions = (): TransactionWithId[] => {
  const storedTransactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
  return storedTransactions ? JSON.parse(storedTransactions) : [];
};

// Helper function to save transactions to local storage
const saveLocalTransactions = (transactions: TransactionWithId[]) => {
  localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
};

// Helper function to get user's default account
export const getUserDefaultAccount = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from("accounts")
      .select("id")
      .eq("user_id", userId)
      .limit(1)
      .single();
    
    if (error || !data) {
      console.warn("Could not retrieve default account:", error);
      // If no account exists, create one
      const { data: newAccount, error: createError } = await supabase
        .from("accounts")
        .insert({
          user_id: userId,
          name: "Main Account",
          type: "checking",
          balance: 0,
          currency: "USD"
        })
        .select()
        .single();
      
      if (createError || !newAccount) {
        console.error("Failed to create default account:", createError);
        return null;
      }
      
      return newAccount.id;
    }
    
    return data.id;
  } catch (err) {
    console.warn("Error retrieving default account:", err);
    return null;
  }
};

export const transactionService = {
  // Get all transactions for a user
  async getTransactions(userId: string, options?: { 
    startDate?: string; 
    endDate?: string;
    category?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<TransactionWithId[]> {
    try {
      // First check if Supabase is available
      const { error: pingError } = await supabase.from("transactions").select("count").limit(1);
      
      // If ping fails, go directly to local storage
      if (pingError) {
        console.warn("Supabase unavailable, getting from local storage:", pingError.message);
        return this.getLocalTransactions(userId, options);
      }
      
      // Try to get from Supabase
      let query = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      // Apply filters if provided
      if (options?.startDate) {
        query = query.gte("date", options.startDate);
      }
      if (options?.endDate) {
        query = query.lte("date", options.endDate);
      }
      if (options?.category) {
        query = query.eq("category", options.category);
      }
      if (options?.type) {
        query = query.eq("type", options.type);
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;
      
      if (error) {
        console.warn("Falling back to local storage due to Supabase error:", error);
        // Fall back to local storage if Supabase fails
        return this.getLocalTransactions(userId, options);
      }
      
      return data as TransactionWithId[];
    } catch (err) {
      console.warn("Falling back to local storage due to exception:", err);
      // Fall back to local storage if Supabase is not available
      return this.getLocalTransactions(userId, options);
    }
  },

  // Get transactions from local storage with filtering
  getLocalTransactions(userId: string, options?: { 
    startDate?: string; 
    endDate?: string;
    category?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }): TransactionWithId[] {
    let transactions = getLocalTransactions().filter(t => t.user_id === userId);
    
    // Apply filters
    if (options?.startDate) {
      transactions = transactions.filter(t => t.date >= options.startDate!);
    }
    if (options?.endDate) {
      transactions = transactions.filter(t => t.date <= options.endDate!);
    }
    if (options?.category) {
      transactions = transactions.filter(t => t.category === options.category);
    }
    if (options?.type) {
      transactions = transactions.filter(t => t.type === options.type);
    }
    
    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Apply pagination if needed
    if (options?.offset !== undefined && options?.limit) {
      transactions = transactions.slice(options.offset, options.offset + options.limit);
    } else if (options?.limit) {
      transactions = transactions.slice(0, options.limit);
    }
    
    return transactions;
  },

  // Get a single transaction by ID
  async getTransaction(id: string): Promise<TransactionWithId | null> {
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) {
        // Fall back to local storage
        const transaction = getLocalTransactions().find(t => t.id === id);
        return transaction || null;
      }
      
      return data as TransactionWithId;
    } catch (err) {
      // Fall back to local storage
      const transaction = getLocalTransactions().find(t => t.id === id);
      return transaction || null;
    }
  },

  // Create a new transaction
  async createTransaction(transaction: Transaction): Promise<TransactionWithId> {
    // Ensure the transaction has an ID and created_at date
    const newTransaction: TransactionWithId = {
      ...transaction,
      id: transaction.id || uuidv4(),
      created_at: transaction.created_at || new Date().toISOString(),
    };
    
    try {
      // Get or create account for this user
      const accountId = await getUserDefaultAccount(newTransaction.user_id);
      
      if (!accountId) {
        throw new Error("Could not get or create account for user");
      }
      
      // Set the account ID for the transaction
      newTransaction.account_id = accountId;
      
      // Try to save to Supabase only
      const { data, error } = await supabase
        .from("transactions")
        .insert(newTransaction)
        .select()
        .single();
      
      if (error) {
        console.error("Error saving transaction to Supabase:", error);
        throw error;
      }
      
      return data as TransactionWithId;
    } catch (err) {
      console.error("Failed to create transaction:", err);
      throw err;
    }
  },

  // Create a transaction in local storage
  createLocalTransaction(transaction: TransactionWithId): TransactionWithId {
    const transactions = getLocalTransactions();
    transactions.push(transaction);
    saveLocalTransactions(transactions);
    return transaction;
  },

  // Update an existing transaction
  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<TransactionWithId> {
    try {
      // First check if Supabase is available
      const { error: pingError } = await supabase.from("transactions").select("count").limit(1);
      
      // If ping fails, go directly to local storage
      if (pingError) {
        console.warn("Supabase unavailable, updating in local storage:", pingError.message);
        return this.updateLocalTransaction(id, updates);
      }
      
      // Get the original transaction to preserve account_id if it's not in the updates
      if (!updates.account_id) {
        const original = await this.getTransaction(id);
        if (original && original.account_id) {
          updates.account_id = original.account_id;
        } else {
          // If for some reason we can't get the original account_id, try to get the default one
          const accountId = await getUserDefaultAccount(updates.user_id || '');
          if (accountId) {
            updates.account_id = accountId;
          } else {
            // As a last resort, generate a valid UUID
            updates.account_id = uuidv4();
          }
        }
      } else if (updates.account_id === 'default') {
        // If it's set to 'default', replace with an actual account ID
        const accountId = updates.user_id ? 
          await getUserDefaultAccount(updates.user_id) : null;
        
        if (accountId) {
          updates.account_id = accountId;
        } else {
          // As a last resort, generate a valid UUID
          updates.account_id = uuidv4();
        }
      }
      
      // Try to update in Supabase
      const { data, error } = await supabase
        .from("transactions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) {
        console.warn("Updating in local storage due to Supabase error:", error);
        // Fall back to local storage
        return this.updateLocalTransaction(id, updates);
      }
      
      return data as TransactionWithId;
    } catch (err) {
      console.warn("Updating in local storage due to exception:", err);
      // Fall back to local storage
      return this.updateLocalTransaction(id, updates);
    }
  },

  // Update a transaction in local storage
  updateLocalTransaction(id: string, updates: Partial<Transaction>): TransactionWithId {
    const transactions = getLocalTransactions();
    const index = transactions.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error(`Transaction with ID ${id} not found`);
    }
    
    const updatedTransaction = {
      ...transactions[index],
      ...updates,
    };
    
    transactions[index] = updatedTransaction;
    saveLocalTransactions(transactions);
    
    return updatedTransaction;
  },

  // Delete a transaction
  async deleteTransaction(id: string): Promise<boolean> {
    try {
      // First check if Supabase is available
      const { error: pingError } = await supabase.from("transactions").select("count").limit(1);
      
      // If ping fails, go directly to local storage
      if (pingError) {
        console.warn("Supabase unavailable, deleting from local storage:", pingError.message);
        return this.deleteLocalTransaction(id);
      }
      
      // Try to delete from Supabase
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.warn("Deleting from local storage due to Supabase error:", error);
        // Fall back to local storage
        return this.deleteLocalTransaction(id);
      }
      
      // Also delete from local storage to keep in sync
      this.deleteLocalTransaction(id);
      return true;
    } catch (err) {
      console.warn("Deleting from local storage due to exception:", err);
      // Fall back to local storage
      return this.deleteLocalTransaction(id);
    }
  },

  // Delete a transaction from local storage
  deleteLocalTransaction(id: string): boolean {
    const transactions = getLocalTransactions();
    const filteredTransactions = transactions.filter(t => t.id !== id);
    
    if (filteredTransactions.length === transactions.length) {
      return false; // Transaction not found
    }
    
    saveLocalTransactions(filteredTransactions);
    return true;
  },

  // Get transaction summary (for dashboard)
  async getTransactionSummary(userId: string, period: string = "month") {
    const now = new Date();
    let startDate: string;
    
    // Calculate start date based on period
    if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    } else if (period === "week") {
      const day = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day).toISOString().split("T")[0];
    } else if (period === "year") {
      startDate = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    }
    
    const endDate = now.toISOString().split("T")[0];
    
    // Get all transactions for the period
    const transactions = await this.getTransactions(userId, {
      startDate,
      endDate
    });
    
    // Calculate totals
    const totalIncome = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Group expenses by category
    const expensesByCategory = transactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
    
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      expensesByCategory,
      transactions
    };
  },

  // Export transactions to CSV format
  async exportTransactionsCSV(userId: string, options?: { 
    startDate?: string; 
    endDate?: string;
    category?: string;
    type?: string;
  }) {
    const transactions = await this.getTransactions(userId, options);
    
    // Create CSV headers
    const headers = ["Date", "Type", "Category", "Amount", "Description"];
    
    // Create CSV rows
    const rows = transactions.map(t => [
      t.date,
      t.type,
      t.category,
      t.amount.toString(),
      t.description || ""
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    return csvContent;
  }
}; 