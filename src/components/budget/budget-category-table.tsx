import { useState } from "react";
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Plus,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Receipt
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
import { TransactionForm } from "@/components/transactions/transaction-form";
import { useTransactions } from "@/hooks/use-transactions";

export function BudgetCategoryTable() {
  const [addBudgetOpen, setAddBudgetOpen] = useState(false);
  const [editBudgetOpen, setEditBudgetOpen] = useState(false);
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState<string | null>(null);
  const [deleteBudgetId, setDeleteBudgetId] = useState<string | null>(null);
  
  // Get the current user ID from auth
  const { user } = useAuth();
  const userId = user?.id || 'guest-user';
  
  // Use budgets hook
  const {
    budgetStatus,
    loading,
    actions: {
      createBudget,
      updateBudget,
      deleteBudget,
      refreshBudgets
    }
  } = useBudgets(userId);
  
  // Use transactions hook for adding transactions
  const { 
    actions: { 
      createTransaction,
      refreshTransactions
    } 
  } = useTransactions(userId);
  
  // Handler for saving a new budget
  const handleSaveBudget = async (data: any) => {
    await createBudget({
      category: data.category,
      amount: parseFloat(data.amount),
      period: data.period,
      user_id: userId
    });
    setAddBudgetOpen(false);
  };
  
  // Handler for editing a budget
  const handleEditBudget = async (data: any) => {
    if (selectedBudgetId) {
      await updateBudget(selectedBudgetId, {
        category: data.category,
        amount: parseFloat(data.amount),
        period: data.period,
      });
      setEditBudgetOpen(false);
      setSelectedBudgetId(null);
    }
  };
  
  // Handler for opening the edit dialog
  const handleOpenEditBudget = (id: string) => {
    setSelectedBudgetId(id);
    setEditBudgetOpen(true);
  };
  
  // Handler for deleting a budget
  const handleDeleteBudget = async () => {
    if (deleteBudgetId) {
      await deleteBudget(deleteBudgetId);
      setDeleteBudgetId(null);
    }
  };
  
  // Handler for adding a transaction to a budget
  const handleAddTransaction = async (data: any) => {
    await createTransaction(data);
    setAddTransactionOpen(false);
    setSelectedBudgetId(null);
    setSelectedBudgetCategory(null);
    
    // Refresh both budgets and transactions
    refreshBudgets();
    refreshTransactions();
  };
  
  // Open add transaction dialog for a specific budget
  const handleOpenAddTransaction = (id: string, category: string) => {
    setSelectedBudgetId(id);
    setSelectedBudgetCategory(category);
    setAddTransactionOpen(true);
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
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-md mb-2"></div>
            ))}
          </div>
        ) : budgetStatus.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No budget categories found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first budget by clicking the "Add Budget" button above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {budgetStatus.map((budget) => {
              // Calculate status icon and color
              let statusIcon;
              let statusColor;
              
              if (budget.status === "exceeded") {
                statusIcon = <AlertCircle className="h-4 w-4 text-red-500" />;
                statusColor = "text-red-500";
              } else if (budget.status === "warning") {
                statusIcon = <AlertTriangle className="h-4 w-4 text-amber-500" />;
                statusColor = "text-amber-500";
              } else {
                statusIcon = <CheckCircle2 className="h-4 w-4 text-green-500" />;
                statusColor = "text-green-500";
              }
              
              return (
                <div key={budget.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-[#212B36]">{budget.category}</span>
                      <span className={`text-xs ${statusColor} flex items-center`}>
                        {statusIcon}
                        <span className="ml-1">
                          {budget.status === "exceeded" 
                            ? "Exceeded" 
                            : budget.status === "warning"
                              ? "Warning"
                              : "Good"
                          }
                        </span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenAddTransaction(budget.id, budget.category)}
                        className="h-8 w-8 p-0"
                      >
                        <Receipt className="h-4 w-4" />
                        <span className="sr-only">Add Transaction</span>
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleOpenEditBudget(budget.id)}>
                            <Edit2 className="h-4 w-4 mr-2" /> Edit Budget
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenAddTransaction(budget.id, budget.category)}>
                            <Receipt className="h-4 w-4 mr-2" /> Add Transaction
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeleteBudgetId(budget.id)}
                            className="text-red-500"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Budget
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Budget: ${budget.budgeted}</span>
                      <span className="text-muted-foreground">Spent: ${budget.spent}</span>
                    </div>
                    <Progress
                      value={budget.progress}
                      className="h-2 bg-[#F5F5F5]"
                      indicatorClassName={
                        budget.progress >= 100
                          ? "bg-red-500"
                          : budget.progress >= 80
                            ? "bg-amber-500"
                            : "bg-green-500"
                      }
                    />
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Remaining: <span className={budget.remaining < 0 ? "text-red-500" : ""}>${budget.remaining.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      
      {/* Add Budget Dialog */}
      <Dialog open={addBudgetOpen} onOpenChange={setAddBudgetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Budget</DialogTitle>
            <DialogDescription>
              Set a budget for a spending category
            </DialogDescription>
          </DialogHeader>
          
          <BudgetForm
            onSave={handleSaveBudget}
            onCancel={() => setAddBudgetOpen(false)}
            userId={userId}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Budget Dialog */}
      <Dialog open={editBudgetOpen} onOpenChange={setEditBudgetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
            <DialogDescription>
              Update your budget settings
            </DialogDescription>
          </DialogHeader>
          
          {selectedBudgetId && (
            <BudgetForm
              onSave={handleEditBudget}
              onCancel={() => setEditBudgetOpen(false)}
              initialValues={getBudgetToEdit(selectedBudgetId)}
              userId={userId}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add Transaction Dialog */}
      <Dialog open={addTransactionOpen} onOpenChange={setAddTransactionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction to {selectedBudgetCategory}</DialogTitle>
            <DialogDescription>
              Record a transaction that will count towards this budget
            </DialogDescription>
          </DialogHeader>
          
          <TransactionForm
            onSave={handleAddTransaction}
            onCancel={() => setAddTransactionOpen(false)}
            userId={userId}
            preselectedBudgetId={selectedBudgetId || undefined}
            preselectedCategory={selectedBudgetCategory || undefined}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteBudgetId} onOpenChange={(open) => !open && setDeleteBudgetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this budget and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBudget} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
