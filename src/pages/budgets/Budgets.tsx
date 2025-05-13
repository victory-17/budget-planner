import { useState } from "react";
import { ShoppingCart, Home, Coffee, Car, Book, Utensils, DollarSign, Zap, Heart, Package, Monitor, Plus, BarChart3, Receipt } from "lucide-react";
import { TopNavigation } from "@/components/layout/top-navigation";
import { SummaryCard } from "@/components/budget/summary-card";
import { BudgetChart } from "@/components/budget/budget-chart";
import { BudgetCategoryTable } from "@/components/budget/budget-category-table";
import { SavingsBudget } from "@/components/budget/savings-budget";
import { RunningBudget } from "@/components/budget/running-budget";
import { useAuth } from "@/lib/providers/auth-provider";
import { useBudgets } from "@/hooks/use-budgets";
import { useTransactions } from "@/hooks/use-transactions";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BudgetTransactionList } from "@/components/budget/budget-transaction-list";

const Budgets = () => {
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  
  // Get the current user ID from auth
  const { user } = useAuth();
  const userId = user?.id || 'guest-user';

  // Use budgets hook
  const {
    budgetStatus,
    loading: budgetsLoading,
    actions: { refreshBudgets }
  } = useBudgets(userId);
  
  // Use transactions hook
  const {
    transactions,
    loading: transactionsLoading,
    actions: {
      createTransaction,
      refreshTransactions
    }
  } = useTransactions(userId, { limit: 10 });

  // Handle adding a transaction
  const handleAddTransaction = async (data: any) => {
    await createTransaction(data);
    setAddTransactionOpen(false);
    
    // Refresh both budgets and transactions
    refreshBudgets();
    refreshTransactions();
  };
  
  // Get top 3 budget categories for summary cards
  const topBudgetCategories = budgetStatus
    .sort((a, b) => (b.amount || 0) - (a.amount || 0))
    .slice(0, 3);

  // Map of category to icon and color
  const categoryIcons: Record<string, { icon: ReactNode, bgColor: string }> = {
    "groceries": { 
      icon: <ShoppingCart className="h-5 w-5 text-white" />, 
      bgColor: "bg-[#4CAF50]" 
    },
    "shopping": { 
      icon: <Package className="h-5 w-5 text-white" />, 
      bgColor: "bg-[#2196F3]" 
    },
    "home": { 
      icon: <Home className="h-5 w-5 text-white" />, 
      bgColor: "bg-[#FF9800]" 
    },
    "dining": { 
      icon: <Utensils className="h-5 w-5 text-white" />, 
      bgColor: "bg-[#9C27B0]" 
    },
    "transportation": { 
      icon: <Car className="h-5 w-5 text-white" />, 
      bgColor: "bg-[#F44336]" 
    },
    "entertainment": { 
      icon: <Monitor className="h-5 w-5 text-white" />, 
      bgColor: "bg-[#009688]" 
    },
    "health": { 
      icon: <Heart className="h-5 w-5 text-white" />, 
      bgColor: "bg-[#E91E63]" 
    },
    "education": { 
      icon: <Book className="h-5 w-5 text-white" />, 
      bgColor: "bg-[#673AB7]" 
    },
    "utilities": { 
      icon: <Zap className="h-5 w-5 text-white" />, 
      bgColor: "bg-[#00BCD4]" 
    },
    // Default for any other category
    "default": { 
      icon: <DollarSign className="h-5 w-5 text-white" />, 
      bgColor: "bg-[#607D8B]" 
    }
  };

  // Get the appropriate icon and color for a category
  const getCategoryDetails = (category: string) => {
    const normalizedCategory = category.toLowerCase();
    // Find a match or partial match
    const matchedKey = Object.keys(categoryIcons).find(key => 
      normalizedCategory === key || normalizedCategory.includes(key)
    );
    
    return matchedKey ? categoryIcons[matchedKey] : categoryIcons["default"];
  };

  return (
    <div>
      <TopNavigation 
        title="Budgets" 
        subtitle="Track your finances and achieve your financial goals" 
      />
      
      <div className="container px-6 py-8 mx-auto">
        {/* Action buttons */}
        <div className="flex justify-between items-center mb-6">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => setAddTransactionOpen(true)}
                  className="bg-[#4E60FF] hover:bg-[#4E60FF]/90 text-white"
                  size="sm"
                >
                  <Receipt className="h-4 w-4 mr-1" />
                  Add Transaction
                </Button>
              </div>
            </div>
          
            <TabsContent value="overview">
              {/* Budget Summary Cards - show top 3 budget categories */}
              {budgetsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : topBudgetCategories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {topBudgetCategories.map((budget, index) => {
                    const categoryName = budget.category || "Uncategorized";
                    const { icon, bgColor } = getCategoryDetails(categoryName);
                    
                    return (
                      <SummaryCard 
                        key={budget.id || index}
                        title={categoryName}
                        amount={budget.amount || 0}
                        icon={icon}
                        bgColor={bgColor}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-lg mb-6">
                  <p className="text-muted-foreground">No budget categories found. Create your first budget below.</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                  <BudgetChart data={budgetStatus} loading={budgetsLoading} />
                </div>
                <div>
                  <SavingsBudget data={budgetStatus} loading={budgetsLoading} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <BudgetCategoryTable />
                </div>
                <div>
                  <RunningBudget data={budgetStatus} loading={budgetsLoading} />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="transactions">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <BudgetTransactionList transactions={transactions} loading={transactionsLoading} />
                </div>
                <div>
                  <div className="grid grid-cols-1 gap-6">
                    <RunningBudget data={budgetStatus} loading={budgetsLoading} />
                    <SavingsBudget data={budgetStatus} loading={budgetsLoading} />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Add Transaction Dialog */}
      <Dialog open={addTransactionOpen} onOpenChange={setAddTransactionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>
              Record a new transaction to track your spending
            </DialogDescription>
          </DialogHeader>
          
          <TransactionForm
            onSave={handleAddTransaction}
            onCancel={() => setAddTransactionOpen(false)}
            userId={userId}
            preselectedBudgetId={selectedBudgetId || undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Budgets;
