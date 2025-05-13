import { useState, useEffect } from "react";
import { TopNavigation } from "@/components/layout/top-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCard } from "@/components/budget/summary-card";
import { BudgetChart } from "@/components/budget/budget-chart";
import { BudgetCategoryTable } from "@/components/budget/budget-category-table";
import { SavingsBudget } from "@/components/budget/savings-budget";
import { RunningBudget } from "@/components/budget/running-budget";
import { IncomeExpenseChart } from "@/components/budget/income-expense-chart";
import { ShoppingBag, Coffee, Home, CreditCard, Wallet, Plus, TrendingUp, TrendingDown, AlertCircle, DollarSign, BriefcaseBusiness, Landmark, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimpleTransactionList } from "@/components/transactions/simple-transaction-list";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/hooks/use-transactions";
import { useBudgets } from "@/hooks/use-budgets";
import { Progress } from "@/components/ui/progress";
import { Transaction } from "@/lib/services/transaction-service";
import { useAuth } from "@/lib/providers/auth-provider";
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

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [showBudgetAlert, setShowBudgetAlert] = useState(false);
  const [budgetAlertData, setBudgetAlertData] = useState<{
    category: string;
    percentage: number;
    spent: number;
    budgeted: number;
  } | null>(null);
  const [editTransactionData, setEditTransactionData] = useState<{id: string, data: Transaction} | null>(null);

  // Get the current user ID from auth
  const { user } = useAuth();
  const userId = user?.id || 'guest-user';
  
  // Use our transactions hook with smaller limit
  const {
    transactions,
    loading: transactionsLoading,
    actions: { 
      createTransaction, 
      updateTransaction, 
      deleteTransaction, 
      refreshTransactions 
    }
  } = useTransactions(userId, { limit: 5 });
  
  // Use budgets hook
  const {
    budgetStatus,
    alerts,
    loading: budgetsLoading,
    actions: { refreshBudgets }
  } = useBudgets(userId);

  // Show budget alerts when they exist
  useEffect(() => {
    if (alerts && alerts.length > 0) {
      setBudgetAlertData(alerts[0]); // Show the first alert
      setShowBudgetAlert(true);
    }
  }, [alerts]);

  // Calculate expense summary data
  const calculateExpenseSummary = () => {
    // Group transactions by category
    const expensesByCategory = transactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
    
    // Calculate top spending categories
    const topCategories = Object.entries(expensesByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([category, amount]) => ({ category, amount }));
    
    // Map to summary cards format
    const categoryIcons: Record<string, JSX.Element> = {
      "groceries": <ShoppingBag className="h-5 w-5 text-white" />,
      "shopping": <CreditCard className="h-5 w-5 text-white" />,
      "home": <Home className="h-5 w-5 text-white" />,
      "dining": <Coffee className="h-5 w-5 text-white" />,
      // Default icon for other categories
      "default": <Wallet className="h-5 w-5 text-white" />
    };
    
    const categoryColors: Record<string, string> = {
      "groceries": "bg-[#4CAF50]",
      "shopping": "bg-[#2196F3]",
      "home": "bg-[#FFC107]",
      "dining": "bg-[#9C27B0]",
      // Default color for other categories
      "default": "bg-[#607D8B]"
    };
    
    return topCategories.map((item, index) => ({
      id: index + 1,
      title: item.category.charAt(0).toUpperCase() + item.category.slice(1),
      amount: item.amount,
      icon: categoryIcons[item.category] || categoryIcons.default,
      bgColor: categoryColors[item.category] || categoryColors.default,
      type: "expense"
    }));
  };
  
  // Calculate income summary data
  const calculateIncomeSummary = () => {
    // Group transactions by category
    const incomeByCategory = transactions
      .filter(t => t.type === "income")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
    
    // Calculate top income categories
    const topCategories = Object.entries(incomeByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([category, amount]) => ({ category, amount }));
    
    // Map to summary cards format
    const categoryIcons: Record<string, JSX.Element> = {
      "salary": <BriefcaseBusiness className="h-5 w-5 text-white" />,
      "freelance": <Zap className="h-5 w-5 text-white" />,
      "investments": <Landmark className="h-5 w-5 text-white" />,
      "gifts": <DollarSign className="h-5 w-5 text-white" />,
      // Default icon for other categories
      "default": <DollarSign className="h-5 w-5 text-white" />
    };
    
    const categoryColors: Record<string, string> = {
      "salary": "bg-[#4E60FF]",
      "freelance": "bg-[#00BFA5]",
      "investments": "bg-[#FF9800]",
      "gifts": "bg-[#8E24AA]",
      // Default color for other categories
      "default": "bg-[#4CAF50]"
    };
    
    return topCategories.map((item, index) => ({
      id: index + 1,
      title: item.category.charAt(0).toUpperCase() + item.category.slice(1),
      amount: item.amount,
      icon: categoryIcons[item.category] || categoryIcons.default,
      bgColor: categoryColors[item.category] || categoryColors.default,
      type: "income"
    }));
  };

  // Handler for adding a new transaction
  const handleAddTransaction = async (data: Transaction) => {
    await createTransaction(data);
    setAddTransactionOpen(false);
    
    // Refresh both transactions and budgets
    refreshTransactions();
    refreshBudgets();
  };

  // Handler for editing a transaction
  const handleEditTransaction = async (id: string, data: Transaction) => {
    await updateTransaction(id, data);
    setEditTransactionData(null);
    
    // Refresh both transactions and budgets
    refreshTransactions();
    refreshBudgets();
  };

  // Handler for deleting a transaction
  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
    
    // Refresh both transactions and budgets
    refreshTransactions();
    refreshBudgets();
  };

  // Use data from actual transactions if available, otherwise show empty state
  const expenseCategories = transactions.length > 0 
    ? calculateExpenseSummary()
    : [];
    
  const incomeCategories = transactions.length > 0 
    ? calculateIncomeSummary()
    : [];

  // Calculate income and expense totals with safety checks
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : 0), 0);
  
  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : 0), 0);

  // Show appropriate message if no transactions
  const NoTransactionsMessage = () => (
    <div className="text-center py-8">
      <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Wallet className="h-6 w-6 text-gray-500" />
      </div>
      <h3 className="text-lg font-medium mb-1">No transactions yet</h3>
      <p className="text-sm text-gray-500 mb-4">Add your first transaction to start tracking your finances</p>
      <Button 
        onClick={() => setAddTransactionOpen(true)}
        className="bg-[#4E60FF] hover:bg-[#4E60FF]/90 text-white"
      >
        <Plus className="mr-1 h-4 w-4" />
        Add Transaction
      </Button>
    </div>
  );

  return (
    <div>
      <TopNavigation 
        title="Dashboard" 
        subtitle="Track and manage your financial goals" 
        action={
          <Button 
            onClick={() => setAddTransactionOpen(true)}
            className="bg-[#4E60FF] hover:bg-[#4E60FF]/90 text-white"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Transaction
          </Button>
        }
      />
      
      <div className="container px-6 py-8 mx-auto">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {/* Income vs Expense Chart with integrated summary cards */}
            <div className="mb-6">
              <IncomeExpenseChart 
                totalIncome={totalIncome}
                totalExpense={totalExpense}
                loading={transactionsLoading}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="lg:col-span-2">
                <div className="grid gap-4">
                  {/* Expense Categories */}
                  <div>
                    <h2 className="text-lg font-semibold mb-3">Expense Categories</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {transactionsLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <Card key={i} className="border-[#E0E0E0] shadow-sm rounded-xl animate-pulse">
                            <CardContent className="p-4">
                              <div className="h-16 bg-gray-200 rounded-md"></div>
                            </CardContent>
                          </Card>
                        ))
                      ) : expenseCategories.length === 0 ? (
                        <Card className="border-[#E0E0E0] shadow-sm rounded-xl col-span-2">
                          <CardContent className="p-4 text-center">
                            <p className="text-muted-foreground">No expense data available</p>
                          </CardContent>
                        </Card>
                      ) : (
                        expenseCategories.map((category) => (
                          <SummaryCard
                            key={category.id}
                            title={category.title}
                            amount={category.amount}
                            icon={category.icon}
                            bgColor={category.bgColor}
                            className="rounded-xl border-[#E0E0E0] shadow-sm"
                          />
                        ))
                      )}
                    </div>
                  </div>
                  
                  {/* Income Sources */}
                  <div>
                    <h2 className="text-lg font-semibold mb-3">Income Sources</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {transactionsLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <Card key={i} className="border-[#E0E0E0] shadow-sm rounded-xl animate-pulse">
                            <CardContent className="p-4">
                              <div className="h-16 bg-gray-200 rounded-md"></div>
                            </CardContent>
                          </Card>
                        ))
                      ) : incomeCategories.length === 0 ? (
                        <Card className="border-[#E0E0E0] shadow-sm rounded-xl col-span-2">
                          <CardContent className="p-4 text-center">
                            <p className="text-muted-foreground">No income data available</p>
                          </CardContent>
                        </Card>
                      ) : (
                        incomeCategories.map((category) => (
                          <SummaryCard
                            key={category.id}
                            title={category.title}
                            amount={category.amount}
                            icon={category.icon}
                            bgColor={category.bgColor}
                            className="rounded-xl border-[#E0E0E0] shadow-sm"
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                {/* Running Budget */}
                <RunningBudget data={budgetStatus} loading={budgetsLoading} />
              </div>
            </div>
            
            {/* Savings Budget and Budget Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <SavingsBudget />
              <BudgetChart data={budgetStatus} loading={budgetsLoading} />
            </div>
          </TabsContent>
          
          <TabsContent value="transactions">
            {/* Transactions Tab Content */}
            <Card className="rounded-xl border-[#E0E0E0] shadow-sm overflow-hidden">
              <CardHeader className="px-6 py-4 border-b border-[#E0E0E0]">
                <CardTitle className="text-lg font-semibold text-[#212B36]">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {transactionsLoading ? (
                  <div className="p-8 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4E60FF]"></div>
                  </div>
                ) : transactions.length === 0 ? (
                  <NoTransactionsMessage />
                ) : (
                  <SimpleTransactionList 
                    transactions={transactions} 
                    onEdit={(id, data) => setEditTransactionData({ id, data })} 
                    onDelete={handleDeleteTransaction}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Transaction Dialog */}
      <Dialog open={addTransactionOpen} onOpenChange={setAddTransactionOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
            <DialogDescription>
              Record a new transaction to track your finances
            </DialogDescription>
          </DialogHeader>
          <TransactionForm onSave={handleAddTransaction} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Transaction Dialog */}
      <Dialog 
        open={editTransactionData !== null} 
        onOpenChange={(open) => !open && setEditTransactionData(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Update transaction details
            </DialogDescription>
          </DialogHeader>
          {editTransactionData && (
            <TransactionForm 
              initialData={editTransactionData.data} 
              onSave={(data) => handleEditTransaction(editTransactionData.id, data)} 
              onCancel={() => setEditTransactionData(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Budget Alert Dialog */}
      <AlertDialog open={showBudgetAlert} onOpenChange={setShowBudgetAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertCircle className="h-6 w-6 text-red-500 mb-2" />
            <AlertDialogTitle>Budget Alert</AlertDialogTitle>
            <AlertDialogDescription>
              {budgetAlertData && (
                <>
                  Your <strong>{budgetAlertData.category}</strong> budget is {budgetAlertData.percentage}% used.
                  <div className="mt-2">
                    <Progress value={budgetAlertData.percentage} className="h-2 mt-2" />
                    <div className="flex justify-between text-sm mt-1">
                      <span>Spent: ${budgetAlertData.spent}</span>
                      <span>Budget: ${budgetAlertData.budgeted}</span>
                    </div>
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Dismiss</AlertDialogCancel>
            <AlertDialogAction onClick={() => setActiveTab('transactions')}>
              See Transactions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
