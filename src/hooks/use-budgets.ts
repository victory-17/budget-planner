import { useState, useEffect } from "react";
import { Budget, BudgetWithId, budgetService } from "@/lib/services/budget-service";
import { useToast } from "@/hooks/use-toast";

export function useBudgets(userId: string, period: string = "month") {
  const [budgets, setBudgets] = useState<BudgetWithId[]>([]);
  const [budgetStatus, setBudgetStatus] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { toast } = useToast();

  // Fetch budgets
  const fetchBudgets = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const data = await budgetService.getBudgets(userId, period);
      setBudgets(data as BudgetWithId[]);
      
      // Get budget status with spending progress
      const status = await budgetService.getBudgetStatus(userId, period);
      setBudgetStatus(status);
      
      // Get budget alerts
      const alertData = await budgetService.getBudgetAlerts(userId, period);
      setAlerts(alertData);
      
    } catch (err: any) {
      setError(err);
      toast({
        title: "Error",
        description: `Failed to load budgets: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new budget
  const createBudget = async (budget: Budget) => {
    setLoading(true);
    try {
      const newBudget = await budgetService.createBudget({
        ...budget,
        user_id: userId,
        period: period
      });
      
      setBudgets(prev => [...prev, newBudget as BudgetWithId]);
      toast({
        title: "Success",
        description: "Budget created successfully",
      });
      
      // Refresh budget status
      fetchBudgets();
      
      return newBudget;
    } catch (err: any) {
      setError(err);
      toast({
        title: "Error",
        description: `Failed to create budget: ${err.message}`,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a budget
  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    setLoading(true);
    try {
      const updatedBudget = await budgetService.updateBudget(id, updates);
      
      setBudgets(prev => 
        prev.map(b => b.id === id ? updatedBudget as BudgetWithId : b)
      );
      
      toast({
        title: "Success",
        description: "Budget updated successfully",
      });
      
      // Refresh budget status
      fetchBudgets();
      
      return updatedBudget;
    } catch (err: any) {
      setError(err);
      toast({
        title: "Error",
        description: `Failed to update budget: ${err.message}`,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a budget
  const deleteBudget = async (id: string) => {
    setLoading(true);
    try {
      await budgetService.deleteBudget(id);
      
      setBudgets(prev => prev.filter(b => b.id !== id));
      
      toast({
        title: "Success",
        description: "Budget deleted successfully",
      });
      
      // Refresh budget status
      fetchBudgets();
      
      return true;
    } catch (err: any) {
      setError(err);
      toast({
        title: "Error",
        description: `Failed to delete budget: ${err.message}`,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Change period (month, year, etc.)
  const changePeriod = (newPeriod: string) => {
    // Update and trigger a refetch
    return period = newPeriod;
  };

  // Load budgets when period changes
  useEffect(() => {
    fetchBudgets();
  }, [userId, period]);

  return {
    budgets,
    budgetStatus,
    alerts,
    loading,
    error,
    period,
    actions: {
      createBudget,
      updateBudget,
      deleteBudget,
      changePeriod,
      refreshBudgets: fetchBudgets
    }
  };
} 