import { useState, useEffect } from "react";
import { TopNavigation } from "@/components/layout/top-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCard } from "@/components/budget/summary-card";
import { BudgetChart } from "@/components/budget/budget-chart";
import { BudgetCategoryTable } from "@/components/budget/budget-category-table";
import { SavingsBudget } from "@/components/budget/savings-budget";
import { RunningBudget } from "@/components/budget/running-budget";
import { ShoppingBag, Coffee, Home, CreditCard, Wallet, Plus, TrendingUp, TrendingDown, AlertCircle, DollarSign, BriefcaseBusiness, Landmark, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionList } from "@/components/transactions/transaction-list";
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
  const [budgetAlertData, setBudgetAlertData] = useState<any>(null);
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
        title="Dashboard & Budgets" 
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
            <TabsTrigger value="budgets">Budget Management</TabsTrigger>
            <TabsTrigger value="recent-transactions">Recent Transactions</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab (Dashboard) */}
          <TabsContent value="overview">
            {/* Income/Expense Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card className="rounded-xl border-[#E0E0E0] shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-[#212B36] flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                    Income
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${totalIncome.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Total income this month</p>
                </CardContent>
              </Card>
              
              <Card className="rounded-xl border-[#E0E0E0] shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-[#212B36] flex items-center">
                    <TrendingDown className="mr-2 h-5 w-5 text-red-500" />
                    Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    ${totalExpense.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Total expenses this month</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Expense Category Cards */}
            {expenseCategories.length > 0 ? (
              <>
                <h3 className="text-lg font-semibold text-[#212B36] mb-3">Expense Categories</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {expenseCategories.map((category) => (
                    <SummaryCard
                      key={category.id}
                      title={category.title}
                      amount={category.amount}
                      icon={category.icon}
                      iconBgColor={category.bgColor}
                      subtitle="Budget"
                    />
                  ))}
                </div>
              </>
            ) : (
              <Card className="mb-6 p-6">
                <NoTransactionsMessage />
              </Card>
            )}

            {/* Income Category Cards */}
            {incomeCategories.length > 0 ? (
              <>
                <h3 className="text-lg font-semibold text-[#212B36] mb-3">Income Sources</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {incomeCategories.map((category) => (
                    <SummaryCard
                      key={category.id}
                      title={category.title}
                      amount={category.amount}
                      icon={category.icon}
                      iconBgColor={category.bgColor}
                      subtitle="Revenue"
                    />
                  ))}
                </div>
              </>
            ) : null}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (2/3 width) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Budget Chart */}
                <BudgetChart data={budgetStatus} loading={budgetsLoading} />
                
                {/* Recent Transactions Preview */}
                <Card className="rounded-xl border-[#E0E0E0] shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-semibold text-[#212B36]">
                        Recent Transactions
                      </CardTitle>
                      <Button
                        variant="link"
                        onClick={() => setActiveTab("recent-transactions")}
                        className="text-[#4E60FF]"
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {transactionsLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4E60FF]"></div>
                      </div>
                    ) : transactions.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-xs text-muted-foreground font-medium border-b">
                              <th className="pb-2">Date</th>
                              <th className="pb-2">Category</th>
                              <th className="pb-2">Amount</th>
                              <th className="pb-2">Type</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map((transaction) => (
                              <tr key={transaction.id} className="border-b border-[#f5f5f5] last:border-0">
                                <td className="py-3 text-sm">
                                  {new Date(transaction.date).toLocaleDateString()}
                                </td>
                                <td className="py-3 text-sm capitalize">
                                  {transaction.category}
                                </td>
                                <td className="py-3 text-sm font-medium">
                                  <span className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
                                    ${transaction.amount.toFixed(2)}
                                  </span>
                                </td>
                                <td className="py-3 text-sm">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    transaction.type === "income" 
                                      ? "bg-green-100 text-green-800" 
                                      : "bg-red-100 text-red-800"
                                  }`}>
                                    {transaction.type}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <NoTransactionsMessage />
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Right Column (1/3 width) */}
              <div className="space-y-6">
                {/* Budget Status */}
                <Card className="rounded-xl border-[#E0E0E0] shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-[#212B36]">
                      Budget Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {budgetsLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4E60FF]"></div>
                      </div>
                    ) : budgetStatus.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No budgets set</p>
                        <Button 
                          variant="outline" 
                          onClick={() => setActiveTab("budgets")}
                          className="mt-2"
                        >
                          Create Budget
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {budgetStatus.slice(0, 4).map((budget) => (
                          <div key={budget.id} className="space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium">{budget.category}</span>
                              <span className="text-sm">
                                ${typeof budget.spent === 'number' ? budget.spent.toFixed(2) : '0.00'} / ${typeof budget.amount === 'number' ? budget.amount.toFixed(2) : '0.00'}
                              </span>
                            </div>
                            <Progress 
                              value={typeof budget.progress === 'number' ? budget.progress : 0} 
                              className="h-2"
                              indicatorClassName={budget.status === "exceeded" ? "bg-red-500" : ""}
                            />
                            {budget.status === "exceeded" && (
                              <p className="text-xs text-red-500 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Budget exceeded
                              </p>
                            )}
                          </div>
                        ))}
                        
                        {budgetStatus.length > 4 && (
                          <Button 
                            variant="ghost" 
                            onClick={() => setActiveTab("budgets")}
                            className="w-full text-[#4E60FF]"
                          >
                            View All Budgets
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Savings Budget */}
                <SavingsBudget data={budgetStatus} loading={budgetsLoading} />
                
                {/* Running Budget */}
                <RunningBudget data={budgetStatus} loading={budgetsLoading} />
              </div>
            </div>
          </TabsContent>
          
          {/* Budgets Tab */}
          <TabsContent value="budgets">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Column (3/4 width) */}
              <div className="lg:col-span-3 space-y-6">
                {/* Budget Categories Table */}
                <BudgetCategoryTable />
              </div>
              
              {/* Right Column (1/4 width) */}
              <div className="space-y-6">
                {/* Budget Summary */}
                <Card className="rounded-xl border-[#E0E0E0] shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-[#212B36]">
                      Budget Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Total Budget</span>
                          <span className="font-medium">$2,500.00</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Spent So Far</span>
                          <span className="font-medium">${typeof totalExpense === 'number' ? totalExpense.toFixed(2) : '0.00'}</span>
                        </div>
                        <Progress value={typeof totalExpense === 'number' ? (totalExpense / 2500 * 100) : 0} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Remaining</span>
                          <span className="font-medium">${typeof totalExpense === 'number' ? (2500 - totalExpense).toFixed(2) : '2500.00'}</span>
                        </div>
                        <Progress value={typeof totalExpense === 'number' ? ((2500 - totalExpense) / 2500 * 100) : 100} className="h-2" />
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          className="w-full bg-[#4E60FF] hover:bg-[#4E60FF]/90 text-white"
                        >
                          Adjust Budget
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Recent Transactions Tab */}
          <TabsContent value="recent-transactions">
            <TransactionList
              transactions={transactions}
              loading={transactionsLoading}
              onEdit={(id, data) => setEditTransactionData({ id, data })}
              onDelete={handleDeleteTransaction}
              onFilter={() => {}}
              onExport={() => {}}
              pagination={{ currentPage: 0, pageCount: 1, total: transactions.length }}
              onPageChange={() => {}}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add Transaction Dialog */}
      <Dialog open={addTransactionOpen} onOpenChange={setAddTransactionOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>
              Record a new income or expense transaction
            </DialogDescription>
          </DialogHeader>
          <TransactionForm 
            userId={userId}
            onSave={handleAddTransaction}
            onCancel={() => setAddTransactionOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Transaction Dialog */}
      <Dialog 
        open={editTransactionData !== null} 
        onOpenChange={(open) => !open && setEditTransactionData(null)}
      >
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Update this transaction's details
            </DialogDescription>
          </DialogHeader>
          {editTransactionData && (
            <TransactionForm 
              userId={userId}
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
            <AlertDialogTitle className="flex items-center text-amber-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Budget Alert
            </AlertDialogTitle>
            <AlertDialogDescription>
              {budgetAlertData && (
                <>
                  You have exceeded your {budgetAlertData.category} budget for this month.
                  <div className="mt-4 p-3 bg-amber-50 rounded-md">
                    <div className="flex justify-between mb-1">
                      <span>Budget:</span>
                      <span className="font-medium">
                        ${typeof budgetAlertData.limit === 'number' ? budgetAlertData.limit.toFixed(2) : '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Spent:</span>
                      <span className="font-medium text-red-600">
                        ${typeof budgetAlertData.spent === 'number' ? budgetAlertData.spent.toFixed(2) : '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overspent by:</span>
                      <span className="font-medium text-red-600">
                        ${typeof budgetAlertData.spent === 'number' && typeof budgetAlertData.limit === 'number' 
                          ? (budgetAlertData.spent - budgetAlertData.limit).toFixed(2) 
                          : '0.00'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>Dismiss</AlertDialogCancel>
            <AlertDialogAction className="bg-amber-600 hover:bg-amber-700">
              View Budget
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
