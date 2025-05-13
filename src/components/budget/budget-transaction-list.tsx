import { useState, useEffect } from "react";
import { 
  MoreHorizontal, 
  Plus, 
  Edit2, 
  Trash2,
  ArrowUp,
  ArrowDown,
  Receipt,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/providers/auth-provider";
import { useBudgets } from "@/hooks/use-budgets";
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
import { Transaction } from "@/lib/services/transaction-service";
import { useTransactions } from "@/hooks/use-transactions";

interface BudgetTransactionListProps {
  transactions: Transaction[];
  loading: boolean;
}

export function BudgetTransactionList({ transactions: initialTransactions, loading }: BudgetTransactionListProps) {
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | undefined>();
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  
  // Get the current user ID from auth
  const { user } = useAuth();
  const userId = user?.id || 'guest-user';
  
  // Use our budgets hook
  const { 
    budgets,
    loading: budgetsLoading,
    actions: { refreshBudgets }
  } = useBudgets(userId);
  
  // Use our transactions hook for actions
  const { 
    actions: { 
      deleteTransaction,
      refreshTransactions 
    } 
  } = useTransactions(userId);
  
  // Update filtered transactions when budget filter or transactions change
  useEffect(() => {
    if (selectedBudgetId) {
      setFilteredTransactions(initialTransactions.filter(t => t.budget_id === selectedBudgetId));
    } else {
      // When no budget is selected, show all transactions that have a budget_id
      setFilteredTransactions(initialTransactions.filter(t => t.budget_id));
    }
  }, [selectedBudgetId, initialTransactions]);
  
  // Handle transaction deletion
  const handleDeleteTransaction = async () => {
    if (deleteTransactionId) {
      await deleteTransaction(deleteTransactionId);
      setDeleteTransactionId(null);
      
      // Refresh both transactions and budgets
      refreshTransactions();
      refreshBudgets();
    }
  };
  
  return (
    <Card className="rounded-xl border-[#E0E0E0] shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-[#212B36]">
          Budget Transactions
        </CardTitle>
        
        <div className="flex items-center space-x-2">
          <Select
            value={selectedBudgetId}
            onValueChange={setSelectedBudgetId}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Budgeted Transactions</SelectItem>
              {budgetsLoading ? (
                <SelectItem value="loading" disabled>Loading budgets...</SelectItem>
              ) : budgets.length === 0 ? (
                <SelectItem value="none" disabled>No budgets available</SelectItem>
              ) : (
                budgets.map(budget => (
                  <SelectItem 
                    key={budget.id as string} 
                    value={budget.id as string}
                  >
                    {budget.category}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-md"></div>
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Receipt className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No transactions found</h3>
            {selectedBudgetId ? (
              <p className="mt-1 text-sm text-gray-500">
                No transactions are associated with this budget yet.
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                You haven't associated any transactions with budgets yet.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => {
              // Find the budget this transaction is associated with
              const budget = budgets.find(b => b.id === transaction.budget_id);
              
              return (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${transaction.type === 'expense' ? 'bg-red-100' : 'bg-green-100'}`}>
                      {transaction.type === 'expense' ? (
                        <ArrowDown className="h-5 w-5 text-red-500" />
                      ) : (
                        <ArrowUp className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    
                    <div>
                      <div className="font-medium">{transaction.category}</div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.description || "No description"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(transaction.date), "MMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`font-medium ${transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                        {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
                      </div>
                      {budget && (
                        <Badge variant="outline" className="text-xs">
                          Budget: {budget.category}
                        </Badge>
                      )}
                    </div>
                    
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
                        <DropdownMenuItem 
                          onClick={() => setDeleteTransactionId(transaction.id)}
                          className="text-red-500"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Transaction
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTransactionId}
        onOpenChange={(open) => !open && setDeleteTransactionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this transaction and remove it from budget calculations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTransaction}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
} 