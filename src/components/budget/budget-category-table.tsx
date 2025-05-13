import { useState, useEffect } from "react";
import { Edit, ArrowUpRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useBudgets } from "@/hooks/use-budgets";
import { BudgetForm } from "./budget-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock data for budget categories
const mockCategories = [
  {
    id: 1,
    name: "Entertainment",
    monthlyLimit: 48.00,
    spentToday: 28.00,
    remaining: 25.00,
    status: "On Track",
  },
  {
    id: 2,
    name: "Transportation",
    monthlyLimit: 25.00,
    spentToday: 15.00,
    remaining: 10.00,
    status: "Near Limit",
  },
  {
    id: 3,
    name: "Groceries",
    monthlyLimit: 150.00,
    spentToday: 67.50,
    remaining: 82.50,
    status: "On Track",
  },
  {
    id: 4,
    name: "Dining Out",
    monthlyLimit: 60.00,
    spentToday: 65.00,
    remaining: -5.00,
    status: "Over Budget",
  },
];

// TODO: Connect to backend endpoint: GET /api/budget/categories

interface BudgetCategoryTableProps {
  className?: string;
  userId?: string;
}

export function BudgetCategoryTable({ className, userId = "current-user-id" }: BudgetCategoryTableProps) {
  const [addBudgetOpen, setAddBudgetOpen] = useState(false);
  const [editBudgetId, setEditBudgetId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Use our budgets hook
  const {
    budgetStatus,
    loading,
    actions: { createBudget, updateBudget, refreshBudgets }
  } = useBudgets(userId);

  // Get budget status for status badge
  const getBudgetStatus = (progress: number) => {
    if (progress >= 100) return "Over Budget";
    if (progress >= 80) return "Near Limit";
    return "On Track";
  };

  // Get status badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "On Track":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Near Limit":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Over Budget":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  // Handle budget saving
  const handleSaveBudget = async (data: any) => {
    if (editBudgetId) {
      // Update existing budget
      await updateBudget(editBudgetId, data);
      setEditBudgetId(null);
    } else {
      // Create new budget
      await createBudget(data);
    }
    setAddBudgetOpen(false);
    refreshBudgets();
  };

  // Get budget by ID
  const getBudgetById = (id: string) => {
    return budgetStatus.find(budget => budget.id === id);
  };

  // Edit a budget
  const editBudget = (id: string) => {
    setEditBudgetId(id);
    setAddBudgetOpen(true);
  };

  return (
    <>
      <Card className={cn("rounded-xl border-[#E0E0E0] shadow-sm", className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-[#212B36]">Budget Categories</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 rounded-md text-[#637381]"
              onClick={() => setAddBudgetOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Budget
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4E60FF]"></div>
              </div>
            ) : budgetStatus.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't set any budget limits yet</p>
                <Button 
                  onClick={() => setAddBudgetOpen(true)}
                  className="bg-[#4E60FF] hover:bg-[#4E60FF]/90 text-white"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Create Your First Budget
                </Button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-left text-[#637381] border-b border-[#E0E0E0]">
                    <th className="font-medium py-3 px-2">Category</th>
                    <th className="font-medium py-3 px-2">Monthly Limit</th>
                    <th className="font-medium py-3 px-2">Spent</th>
                    <th className="font-medium py-3 px-2">Remaining</th>
                    <th className="font-medium py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetStatus.map((budget) => (
                    <tr 
                      key={budget.id} 
                      className="border-b border-[#E0E0E0] last:border-b-0 hover:bg-[#F9FAFB] cursor-pointer"
                      onClick={() => editBudget(budget.id)}
                    >
                      <td className="py-3 px-2 text-[#212B36] font-medium">{budget.category}</td>
                      <td className="py-3 px-2 text-[#212B36]">${budget.amount.toFixed(2)}</td>
                      <td className="py-3 px-2 text-[#212B36]">${budget.spent.toFixed(2)}</td>
                      <td className="py-3 px-2 text-[#212B36]">
                        ${Math.abs(budget.remaining).toFixed(2)}
                        {budget.remaining < 0 && <span className="text-red-500"> (overspent)</span>}
                      </td>
                      <td className="py-3 px-2">
                        <Badge 
                          variant="outline" 
                          className={getStatusBadgeVariant(getBudgetStatus(budget.progress))}
                        >
                          {getBudgetStatus(budget.progress)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Budget Dialog */}
      <Dialog 
        open={addBudgetOpen} 
        onOpenChange={(open) => {
          setAddBudgetOpen(open);
          if (!open) setEditBudgetId(null);
        }}
      >
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editBudgetId ? "Edit Budget" : "Add Budget"}</DialogTitle>
            <DialogDescription>
              {editBudgetId 
                ? "Update your monthly spending limit for this category" 
                : "Set a monthly spending limit for a category"}
            </DialogDescription>
          </DialogHeader>
          <BudgetForm 
            onSave={handleSaveBudget}
            onCancel={() => {
              setAddBudgetOpen(false);
              setEditBudgetId(null);
            }}
            initialValues={editBudgetId ? getBudgetById(editBudgetId) : undefined}
            userId={userId}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
