import { supabase } from "@/integrations/supabase/client";
import { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Transaction = TablesInsert<"transactions">;
export type TransactionWithId = Transaction & { id: string };

export const transactionService = {
  // Get all transactions for a user
  async getTransactions(userId: string, options?: { 
    startDate?: string; 
    endDate?: string;
    category?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }) {
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
      console.error("Error fetching transactions:", error);
      throw error;
    }
    
    return data;
  },

  // Get a single transaction by ID
  async getTransaction(id: string) {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      console.error("Error fetching transaction:", error);
      throw error;
    }
    
    return data;
  },

  // Create a new transaction
  async createTransaction(transaction: Transaction) {
    const { data, error } = await supabase
      .from("transactions")
      .insert(transaction)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
    
    return data;
  },

  // Update an existing transaction
  async updateTransaction(id: string, updates: TablesUpdate<"transactions">) {
    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
    
    return data;
  },

  // Delete a transaction
  async deleteTransaction(id: string) {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
    
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