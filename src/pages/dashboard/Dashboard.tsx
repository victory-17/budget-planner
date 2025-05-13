import { useState, useEffect } from "react";
import { TopNavigation } from "@/components/layout/top-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCard } from "@/components/budget/summary-card";
import { BudgetChart } from "@/components/budget/budget-chart";
import { BudgetCategoryTable } from "@/components/budget/budget-category-table";
import { SavingsBudget } from "@/components/budget/savings-budget";
import { RunningBudget } from "@/components/budget/running-budget";
import { ShoppingBag, Coffee, Home, CreditCard, Wallet, Plus, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/hooks/use-transactions";
import { useBudgets } from "@/hooks/use-budgets";
import { Progress } from "@/components/ui/progress";
import { Transaction } from "@/lib/services/transaction-service";
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

  // Mock user ID for now - in real app this would come from authentication
  const userId = "current-user-id";
  
  // Use our transactions hook with smaller limit
  const {
    transactions,
    loading: transactionsLoading,
    actions: { createTransaction, refreshTransactions }
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

  // Calculate summary data
  const calculateSummary = () => {
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
      bgColor: categoryColors[item.category] || categoryColors.default
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

  // Use data from transactions if available, otherwise use default
  const summaryCategories = transactions.length > 0 
    ? calculateSummary()
    : [
        { 
          id: 1, 
          title: "Groceries", 
          amount: 358.00, 
          icon: <ShoppingBag className="h-5 w-5 text-white" />,
          bgColor: "bg-[#4CAF50]" // Softer green
        },
        { 
          id: 2, 
          title: "Shopping", 
          amount: 246.00, 
          icon: <CreditCard className="h-5 w-5 text-white" />,
          bgColor: "bg-[#2196F3]" // Softer blue
        },
        { 
          id: 3, 
          title: "Home", 
          amount: 136.00, 
          icon: <Home className="h-5 w-5 text-white" />,
          bgColor: "bg-[#FFC107]" // Softer yellow/amber
        },
        { 
          id: 4, 
          title: "Dining", 
          amount: 187.00, 
          icon: <Coffee className="h-5 w-5 text-white" />,
          bgColor: "bg-[#9C27B0]" // Softer purple
        }
      ];

  // Calculate income and expense totals
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

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
            
            {/* Category Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {summaryCategories.map((category) => (
                <SummaryCard
                  key={category.id}
                  title={category.title}
                  amount={category.amount}
                  icon={category.icon}
                  iconBgColor={category.bgColor}
                />
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (2/3 width) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Budget Chart */}
                <BudgetChart />
                
                {/* Recent Transactions Preview */}
                <Card className="rounded-xl border-[#E0E0E0] shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-semibold text-[#212B36]">
                        Recent Transactions
                      </CardTitle>
                      <Button 
                        variant="ghost" 
                        onClick={() => setActiveTab("recent-transactions")}
                        className="text-[#4E60FF] hover:text-[#4E60FF]/90 hover:bg-[#4E60FF]/10"
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
                    ) : transactions.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No transactions found</p>
                        <Button 
                          variant="outline" 
                          onClick={() => setAddTransactionOpen(true)}
                          className="mt-2"
                        >
                          Add Your First Transaction
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {transactions.slice(0, 5).map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                                transaction.type === "income" ? "bg-green-100" : "bg-blue-100"
                              }`}>
                                {transaction.type === "income" ? (
                                  <TrendingUp className="h-5 w-5 text-green-600" />
                                ) : (
                                  <CreditCard className="h-5 w-5 text-blue-600" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{transaction.category}</div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(transaction.date).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className={`font-semibold ${
                              transaction.type === "income" ? "text-green-600" : "text-red-600"
                            }`}>
                              {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
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
                                ${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                              </span>
                            </div>
                            <Progress 
                              value={budget.progress} 
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
                <SavingsBudget />
                
                {/* Running Budget */}
                <RunningBudget />
              </div>
            </div>
          </TabsContent>
          
          {/* Budgets Tab */}
          <TabsContent value="budgets">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="lg:col-span-3 rounded-xl border-[#E0E0E0] shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[#212B36]">Budget Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#637381]">
                    Manage your budget categories, set spending limits, and track your progress. 
                    This view helps you keep a close eye on your financial goals and adjust your budget as needed.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <BudgetChart />
                <BudgetCategoryTable />
              </div>
              <div className="space-y-6">
                <SavingsBudget />
                <RunningBudget />
              </div>
            </div>
          </TabsContent>
          
          {/* Recent Transactions Tab */}
          <TabsContent value="recent-transactions">
            <TransactionList
              transactions={transactions}
              loading={transactionsLoading}
              onEdit={() => {}}
              onDelete={() => {}}
              onFilter={() => {}}
              onExport={() => {}}
              pagination={{
                currentPage: 0,
                pageCount: 1,
                total: transactions.length
              }}
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
            onSave={handleAddTransaction}
            onCancel={() => setAddTransactionOpen(false)}
          />
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
                <div className="py-2">
                  <p>
                    Your spending in <strong>{budgetAlertData.category}</strong> has 
                    {budgetAlertData.status === "exceeded" ? " exceeded " : " reached "}
                    {budgetAlertData.rawProgress.toFixed(0)}% of your monthly budget.
                  </p>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Current: ${budgetAlertData.spent.toFixed(2)}</span>
                      <span>Budget: ${budgetAlertData.amount.toFixed(2)}</span>
                    </div>
                    <Progress 
                      value={budgetAlertData.progress} 
                      className="h-2 mt-1"
                      indicatorClassName={budgetAlertData.severity === "high" ? "bg-red-500" : "bg-amber-500"}
                    />
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Acknowledge</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
