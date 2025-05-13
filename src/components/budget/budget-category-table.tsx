import { useState } from "react";
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Plus,
  CheckCircle2,
  AlertTriangle,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBudgets } from "@/hooks/use-budgets";
import { BudgetForm } from "@/components/budget/budget-form";
import { useAuth } from "@/lib/providers/auth-provider";

export function BudgetCategoryTable() {
  const [addBudgetOpen, setAddBudgetOpen] = useState(false);
  const [editBudgetData, setEditBudgetData] = useState<any>(null);
  const [deleteBudgetId, setDeleteBudgetId] = useState<string | null>(null);
  
  // Get the current user ID from auth
  const { user } = useAuth();
  const userId = user?.id || 'guest-user';
  
  // Use our budgets hook to manage budgets
  const {
    budgetStatus,
    loading,
    actions: { createBudget, updateBudget, deleteBudget }
  } = useBudgets(userId);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Helper to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'exceeded':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircle2 className="h-5 w-5 text-gray-300" />;
    }
  };
  
  // Helper to get progress color
  const getProgressColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'bg-green-500';
      case 'warning':
        return 'bg-amber-500';
      case 'exceeded':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Handler for adding a new budget
  const handleAddBudget = async (data: any) => {
    await createBudget(data);
    setAddBudgetOpen(false);
  };
  
  // Handler for editing a budget
  const handleEditBudget = async (data: any) => {
    if (editBudgetData) {
      await updateBudget(editBudgetData.id, data);
      setEditBudgetData(null);
    }
  };
  
  // Handler for deleting a budget
  const handleDeleteBudget = async () => {
    if (deleteBudgetId) {
      await deleteBudget(deleteBudgetId);
      setDeleteBudgetId(null);
    }
  };
  
  // Get the budget to edit by ID
  const getBudgetToEdit = (id: string) => {
    const budget = budgetStatus.find(b => b.id === id);
    return budget ? {
      category: budget.category,
      amount: budget.budgeted.toString(),
      period: budget.period || 'monthly'
    } : null;
  };

  return (
    <Card className="rounded-xl border-[#E0E0E0] shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-[#212B36]">
          Budget Categories
        </CardTitle>
        <Button 
          onClick={() => setAddBudgetOpen(true)}
          className="bg-[#4E60FF] hover:bg-[#4E60FF]/90 text-white"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Budget
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4E60FF]"></div>
          </div>
        ) : budgetStatus.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No budgets set yet</p>
            <Button 
              onClick={() => setAddBudgetOpen(true)}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Your First Budget
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {budgetStatus.map((budget) => (
              <div key={budget.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(budget.status)}
                      <h3 className="text-md font-medium capitalize">{budget.category}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Budget: {formatCurrency(budget.budgeted)}
                    </p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setEditBudgetData({ id: budget.id, ...getBudgetToEdit(budget.id) })}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit Budget
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeleteBudgetId(budget.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Budget
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Spent: {formatCurrency(budget.spent)}</span>
                    <span>Remaining: {formatCurrency(budget.remaining)}</span>
                  </div>
                  <Progress 
                    value={Math.min(budget.progress, 100)} 
                    className="h-2"
                    indicatorClassName={getProgressColor(budget.status)} 
                  />
                  <div className="text-right text-xs mt-1 text-muted-foreground">
                    {budget.progress.toFixed(0)}% of budget
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Add Budget Dialog */}
      <Dialog open={addBudgetOpen} onOpenChange={setAddBudgetOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add Budget</DialogTitle>
            <DialogDescription>
              Set a spending limit for a category
            </DialogDescription>
          </DialogHeader>
          <BudgetForm 
            onSave={handleAddBudget}
            onCancel={() => setAddBudgetOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Budget Dialog */}
      <Dialog 
        open={editBudgetData !== null} 
        onOpenChange={(open) => !open && setEditBudgetData(null)}
      >
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
            <DialogDescription>
              Update your budget for this category
            </DialogDescription>
          </DialogHeader>
          {editBudgetData && (
            <BudgetForm 
              initialValues={editBudgetData}
              onSave={handleEditBudget}
              onCancel={() => setEditBudgetData(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteBudgetId !== null}
        onOpenChange={(open) => !open && setDeleteBudgetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this budget? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteBudget}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
