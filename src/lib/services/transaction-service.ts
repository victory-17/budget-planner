import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export type Transaction = {
  id?: string;
  user_id: string;
  account_id: string; // Make account_id required as per Supabase constraint
  amount: number;
  type: 'income' | 'expense';
  category: string;
  budget_id?: string; // Optional association with a specific budget
  description?: string | null;
  date: string;
  created_at?: string;
};

// Type with required id field for internal use
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

// Create a default account if none exists and return its ID
export const getUserDefaultAccount = async (userId: string): Promise<string> => {
  // First, try to get existing accounts from local storage
  const accounts = JSON.parse(localStorage.getItem('budget_tracker_accounts') || '[]');
  
  // Check if user already has an account
  const userAccount = accounts.find((a: any) => a.user_id === userId && a.is_default);
  
  if (userAccount) {
    return userAccount.id;
  }
  
  // If no account exists, create a default one
  const newAccountId = uuidv4();
  const newAccount = {
    id: newAccountId,
    user_id: userId,
    name: 'Default Account',
    type: 'checking',
    balance: 0,
    currency: 'USD',
    is_default: true,
    created_at: new Date().toISOString(),
  };
  
  accounts.push(newAccount);
  localStorage.setItem('budget_tracker_accounts', JSON.stringify(accounts));
  
  return newAccountId;
};

// Transaction filters interface
export interface TransactionFilters {
  type?: 'income' | 'expense';
  category?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  account_id?: string;
  budget_id?: string;
}

// Pagination options
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

// Export transactions as CSV
export const exportTransactionsAsCSV = (transactions: TransactionWithId[]) => {
  // Check if there are any transactions
  if (transactions.length === 0) {
    return '';
  }
  
  // Define CSV headers
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];
  
  // Map transactions to CSV rows
  const rows = transactions.map(t => [
    t.date,
    t.type,
    t.category,
    t.amount.toString(),
    t.description || ''
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
};

// The transaction service
export const transactionService = {
  // Get all transactions for a user
  async getTransactions(
    userId: string, 
    filters: TransactionFilters = {}, 
    pagination: PaginationOptions = {}
  ): Promise<TransactionWithId[]> {
    // MOCK: Use local storage as mock database
    return this.getLocalTransactions(userId, filters, pagination);
  },
  
  // Get transactions from local storage with filtering
  getLocalTransactions(
    userId: string, 
    filters: TransactionFilters = {}, 
    pagination: PaginationOptions = {}
  ): TransactionWithId[] {
    let transactions = getLocalTransactions()
      .filter(t => t.user_id === userId);
    
    // Apply filters
    if (filters.type) {
      transactions = transactions.filter(t => t.type === filters.type);
    }
    
    if (filters.category) {
      transactions = transactions.filter(t => t.category === filters.category);
    }
    
    if (filters.account_id) {
      transactions = transactions.filter(t => t.account_id === filters.account_id);
    }
    
    if (filters.budget_id) {
      transactions = transactions.filter(t => t.budget_id === filters.budget_id);
    }
    
    if (filters.startDate) {
      transactions = transactions.filter(t => t.date >= filters.startDate);
    }
    
    if (filters.endDate) {
      transactions = transactions.filter(t => t.date <= filters.endDate);
    }
    
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      transactions = transactions.filter(t => 
        (t.description && t.description.toLowerCase().includes(searchTerm)) ||
        t.category.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Apply pagination if specified
    if (pagination.page !== undefined && pagination.limit !== undefined) {
      const start = (pagination.page - 1) * pagination.limit;
      const end = start + pagination.limit;
      transactions = transactions.slice(start, end);
    } else if (pagination.limit !== undefined) {
      // Just apply limit without paging
      transactions = transactions.slice(0, pagination.limit);
    }
    
    return transactions;
  },
  
  // Get a single transaction by ID
  async getTransaction(id: string): Promise<TransactionWithId | null> {
    // MOCK: Use local storage as mock database
    return this.getLocalTransaction(id);
  },
  
  // Get a single transaction from local storage
  getLocalTransaction(id: string): TransactionWithId | null {
    const transactions = getLocalTransactions();
    return transactions.find(t => t.id === id) || null;
  },
  
  // Create a new transaction
  async createTransaction(transaction: Transaction): Promise<TransactionWithId> {
    // MOCK: Use local storage as mock database
    return this.createLocalTransaction(transaction);
  },
  
  // Create a transaction in local storage
  createLocalTransaction(transaction: Transaction): TransactionWithId {
    const transactions = getLocalTransactions();
    
    const newTransaction: TransactionWithId = {
      ...transaction,
      id: transaction.id || uuidv4(),
      created_at: new Date().toISOString()
    };
    
    transactions.push(newTransaction);
    saveLocalTransactions(transactions);
    
    return newTransaction;
  },
  
  // Update a transaction
  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<TransactionWithId> {
    // MOCK: Use local storage as mock database
    return this.updateLocalTransaction(id, updates);
  },
  
  // Update a transaction in local storage
  updateLocalTransaction(id: string, updates: Partial<Transaction>): TransactionWithId {
    const transactions = getLocalTransactions();
    const index = transactions.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error(`Transaction with ID ${id} not found`);
    }
    
    transactions[index] = {
      ...transactions[index],
      ...updates
    };
    
    saveLocalTransactions(transactions);
    
    return transactions[index];
  },
  
  // Delete a transaction
  async deleteTransaction(id: string): Promise<boolean> {
    // MOCK: Use local storage as mock database
    return this.deleteLocalTransaction(id);
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
  
  // Export transactions to CSV
  async exportTransactions(
    userId: string,
    filters: TransactionFilters = {}
  ): Promise<string> {
    const transactions = await this.getTransactions(userId, filters);
    return exportTransactionsAsCSV(transactions);
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
    
    // Group expenses by budget_id
    const expensesByBudget = transactions
      .filter(t => t.type === "expense" && t.budget_id)
      .reduce((acc, t) => {
        if (t.budget_id) {
          acc[t.budget_id] = (acc[t.budget_id] || 0) + t.amount;
        }
        return acc;
      }, {} as Record<string, number>);
    
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      expensesByCategory,
      expensesByBudget,
      transactions
    };
  }
}; 