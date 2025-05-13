import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { transactionService } from "./transaction-service";

export type Budget = {
  id?: string;
  user_id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  created_at?: string;
  updated_at?: string | null;
};

export type BudgetWithId = Budget & { id: string };

// Local storage key for budgets
const BUDGETS_STORAGE_KEY = 'budget_tracker_budgets';

// Helper function to get budgets from local storage
const getLocalBudgets = (): BudgetWithId[] => {
  const storedBudgets = localStorage.getItem(BUDGETS_STORAGE_KEY);
  return storedBudgets ? JSON.parse(storedBudgets) : [];
};

// Helper function to save budgets to local storage
const saveLocalBudgets = (budgets: BudgetWithId[]) => {
  localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets));
};

export const budgetService = {
  // Get all budgets for a user
  async getBudgets(userId: string, period: string = "monthly"): Promise<BudgetWithId[]> {
    try {
      // First check if Supabase is available
      const { error: pingError } = await supabase.from("budgets").select("count").limit(1);
      
      // If ping fails, go directly to local storage
      if (pingError) {
        console.warn("Supabase unavailable, getting from local storage:", pingError.message);
        return this.getLocalBudgets(userId, period);
      }
      
      // Try to get from Supabase
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", userId)
        .eq("period", period);
      
      if (error) {
        console.warn("Falling back to local storage due to Supabase error:", error);
        // Fall back to local storage if Supabase fails
        return this.getLocalBudgets(userId, period);
      }
      
      return data as BudgetWithId[];
    } catch (err) {
      console.warn("Falling back to local storage due to exception:", err);
      // Fall back to local storage if Supabase is not available
      return this.getLocalBudgets(userId, period);
    }
  },

  // Get budgets from local storage with filtering
  getLocalBudgets(userId: string, period: string = "monthly"): BudgetWithId[] {
    return getLocalBudgets()
      .filter(b => b.user_id === userId && b.period === period);
  },

  // Create a new budget
  async createBudget(budget: Budget): Promise<BudgetWithId> {
    // Ensure the budget has an ID and created_at date
    const newBudget: BudgetWithId = {
      ...budget,
      id: budget.id || uuidv4(),
      created_at: budget.created_at || new Date().toISOString(),
      updated_at: budget.updated_at || null,
    };
    
    try {
      // First check if Supabase is available
      const { error: pingError } = await supabase.from("budgets").select("count").limit(1);
      
      // If ping fails, go directly to local storage
      if (pingError) {
        console.warn("Supabase unavailable, saving to local storage:", pingError.message);
        return this.createLocalBudget(newBudget);
      }
      
      // Try to save to Supabase
      const { data, error } = await supabase
        .from("budgets")
        .insert(newBudget)
        .select()
        .single();
      
      if (error) {
        console.warn("Saving to local storage due to Supabase error:", error);
        // Fall back to local storage
        return this.createLocalBudget(newBudget);
      }
      
      return data as BudgetWithId;
    } catch (err) {
      console.warn("Saving to local storage due to exception:", err);
      // Fall back to local storage
      return this.createLocalBudget(newBudget);
    }
  },

  // Create a budget in local storage
  createLocalBudget(budget: BudgetWithId): BudgetWithId {
    const budgets = getLocalBudgets();
    
    // Check if budget already exists for this category and period
    const existingIndex = budgets.findIndex(
      b => b.user_id === budget.user_id && 
           b.category === budget.category && 
           b.period === budget.period
    );
    
    // Update if it exists, otherwise add new
    if (existingIndex >= 0) {
      budgets[existingIndex] = {
        ...budgets[existingIndex],
        amount: budget.amount,
        updated_at: new Date().toISOString(),
      };
    } else {
      budgets.push(budget);
    }
    
    saveLocalBudgets(budgets);
    return budget;
  },

  // Update an existing budget
  async updateBudget(id: string, updates: Partial<Budget>): Promise<BudgetWithId> {
    try {
      // First check if Supabase is available
      const { error: pingError } = await supabase.from("budgets").select("count").limit(1);
      
      // If ping fails, go directly to local storage
      if (pingError) {
        console.warn("Supabase unavailable, updating in local storage:", pingError.message);
        return this.updateLocalBudget(id, updates);
      }
      
      // Add updated_at timestamp
      const updatesWithTimestamp = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      // Try to update in Supabase
      const { data, error } = await supabase
        .from("budgets")
        .update(updatesWithTimestamp)
        .eq("id", id)
        .select()
        .single();
      
      if (error) {
        console.warn("Updating in local storage due to Supabase error:", error);
        // Fall back to local storage
        return this.updateLocalBudget(id, updatesWithTimestamp);
      }
      
      return data as BudgetWithId;
    } catch (err) {
      console.warn("Updating in local storage due to exception:", err);
      // Fall back to local storage
      return this.updateLocalBudget(id, updates);
    }
  },

  // Update a budget in local storage
  updateLocalBudget(id: string, updates: Partial<Budget>): BudgetWithId {
    const budgets = getLocalBudgets();
    const index = budgets.findIndex(b => b.id === id);
    
    if (index === -1) {
      throw new Error(`Budget with ID ${id} not found`);
    }
    
    const updatedBudget = {
      ...budgets[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    budgets[index] = updatedBudget;
    saveLocalBudgets(budgets);
    
    return updatedBudget;
  },

  // Delete a budget
  async deleteBudget(id: string): Promise<boolean> {
    try {
      // First check if Supabase is available
      const { error: pingError } = await supabase.from("budgets").select("count").limit(1);
      
      // If ping fails, go directly to local storage
      if (pingError) {
        console.warn("Supabase unavailable, deleting from local storage:", pingError.message);
        return this.deleteLocalBudget(id);
      }
      
      // Try to delete from Supabase
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.warn("Deleting from local storage due to Supabase error:", error);
        // Fall back to local storage
        return this.deleteLocalBudget(id);
      }
      
      // Also delete from local storage to keep in sync
      this.deleteLocalBudget(id);
      return true;
    } catch (err) {
      console.warn("Deleting from local storage due to exception:", err);
      // Fall back to local storage
      return this.deleteLocalBudget(id);
    }
  },

  // Delete a budget from local storage
  deleteLocalBudget(id: string): boolean {
    const budgets = getLocalBudgets();
    const filteredBudgets = budgets.filter(b => b.id !== id);
    
    if (filteredBudgets.length === budgets.length) {
      return false; // Budget not found
    }
    
    saveLocalBudgets(filteredBudgets);
    return true;
  },

  // Get budget status with spending analysis
  async getBudgetStatus(userId: string, period: string = "monthly") {
    // Get the budgets
    const budgets = await this.getBudgets(userId, period);
    
    // Calculate date range based on period
    const now = new Date();
    let startDate: string;
    
    if (period === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    } else if (period === "quarterly") {
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1).toISOString().split("T")[0];
    } else if (period === "yearly") {
      startDate = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    }
    
    const endDate = now.toISOString().split("T")[0];
    
    // Get transactions for the period
    const transactions = await transactionService.getTransactions(userId, {
      startDate,
      endDate,
      type: "expense" // Only consider expenses for budget tracking
    });
    
    // Calculate spending by category
    const spendingByCategory = transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate budget status for each category
    const budgetStatus = budgets.map(budget => {
      const spent = spendingByCategory[budget.category] || 0;
      const remaining = budget.amount - spent;
      const progress = (spent / budget.amount) * 100;
      
      return {
        id: budget.id,
        category: budget.category,
        budgeted: budget.amount,
        spent,
        remaining,
        progress,
        status: progress >= 100 ? "exceeded" : progress >= 80 ? "warning" : "ok"
      };
    });
    
    // Add categories that have spending but no budget
    Object.entries(spendingByCategory).forEach(([category, amount]) => {
      if (!budgets.some(b => b.category === category)) {
        budgetStatus.push({
          id: uuidv4(),
          category,
          budgeted: 0,
          spent: amount,
          remaining: -amount,
          progress: 100,
          status: "unbugeted"
        });
      }
    });
    
    // Generate alerts for categories exceeding or approaching budget
    const alerts = budgetStatus
      .filter(b => b.status === "exceeded" || b.status === "warning")
      .map(b => ({
        id: uuidv4(),
        category: b.category,
        spent: b.spent,
        limit: b.budgeted,
        progress: b.progress,
        status: b.status,
        severity: b.status === "exceeded" ? "high" : "medium"
      }))
      .sort((a, b) => b.progress - a.progress); // Sort by highest percentage first
    
    return {
      budgets: budgetStatus,
      alerts,
      summary: {
        totalBudgeted: budgets.reduce((sum, b) => sum + b.amount, 0),
        totalSpent: Object.values(spendingByCategory).reduce((sum, amount) => sum + amount, 0)
      }
    };
  }
}; 