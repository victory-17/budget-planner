import { supabase } from "@/integrations/supabase/client";
import { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { transactionService } from "./transaction-service";

export type Budget = TablesInsert<"budgets">;
export type BudgetWithId = Budget & { id: string };

export const budgetService = {
  // Get all budgets for a user
  async getBudgets(userId: string, period: string = "month") {
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", userId)
      .eq("period", period);
    
    if (error) {
      console.error("Error fetching budgets:", error);
      throw error;
    }
    
    return data;
  },

  // Create a new budget
  async createBudget(budget: Budget) {
    const { data, error } = await supabase
      .from("budgets")
      .insert(budget)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating budget:", error);
      throw error;
    }
    
    return data;
  },

  // Update an existing budget
  async updateBudget(id: string, updates: TablesUpdate<"budgets">) {
    const { data, error } = await supabase
      .from("budgets")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating budget:", error);
      throw error;
    }
    
    return data;
  },

  // Delete a budget
  async deleteBudget(id: string) {
    const { error } = await supabase
      .from("budgets")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting budget:", error);
      throw error;
    }
    
    return true;
  },

  // Get budget status (with spending progress)
  async getBudgetStatus(userId: string, period: string = "month") {
    // Get all budgets for the user and period
    const budgets = await this.getBudgets(userId, period);
    
    // Get transaction summary for the same period
    const { expensesByCategory } = await transactionService.getTransactionSummary(userId, period);
    
    // Calculate budget progress for each category
    const budgetsWithProgress = budgets.map(budget => {
      const spent = expensesByCategory[budget.category] || 0;
      const progress = (spent / budget.amount) * 100;
      const remaining = Math.max(0, budget.amount - spent);
      const status = progress >= 100 ? "exceeded" : "within";
      
      return {
        ...budget,
        spent,
        remaining,
        progress: Math.min(progress, 100), // Cap at 100% for UI purposes
        rawProgress: progress, // Original value for alerts
        status
      };
    });
    
    return budgetsWithProgress;
  },

  // Get categories that exceed budget
  async getBudgetAlerts(userId: string, period: string = "month") {
    const budgetStatus = await this.getBudgetStatus(userId, period);
    
    // Filter for categories that exceed or are close to budget
    const alerts = budgetStatus.filter(budget => {
      if (budget.status === "exceeded") return true;
      if (budget.rawProgress >= 80) return true; // Alert when at 80% or more
      return false;
    });
    
    return alerts.map(alert => ({
      ...alert,
      severity: alert.rawProgress >= 100 ? "high" : "medium"
    }));
  }
}; 