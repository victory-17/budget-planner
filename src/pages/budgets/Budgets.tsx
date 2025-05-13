import { ShoppingCart, Package, HomeIcon } from "lucide-react";
import { TopNavigation } from "@/components/layout/top-navigation";
import { SummaryCard } from "@/components/budget/summary-card";
import { BudgetChart } from "@/components/budget/budget-chart";
import { BudgetCategoryTable } from "@/components/budget/budget-category-table";
import { SavingsBudget } from "@/components/budget/savings-budget";
import { RunningBudget } from "@/components/budget/running-budget";
import { useAuth } from "@/lib/providers/auth-provider";
import { useBudgets } from "@/hooks/use-budgets";

const Budgets = () => {
  // Get the current user ID from auth
  const { user } = useAuth();
  const userId = user?.id || 'guest-user';

  // Use budgets hook
  const {
    budgetStatus,
    loading: budgetsLoading
  } = useBudgets(userId);

  // Get top 3 budget categories for summary cards
  const topBudgetCategories = budgetStatus
    .sort((a, b) => (b.amount || 0) - (a.amount || 0))
    .slice(0, 3);

  return (
    <div>
      <TopNavigation 
        title="Budgets" 
        subtitle="Track your finances and achieve your financial goals" 
      />
      
      <div className="container px-6 py-8 mx-auto">
        {/* Budget Summary Cards - show top 3 budget categories */}
        {budgetsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : topBudgetCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {topBudgetCategories.map((budget, index) => (
              <SummaryCard 
                key={budget.id || index}
                title={budget.category || "Uncategorized"}
                amount={budget.amount || 0}
                icon={<ShoppingCart className="h-5 w-5 text-primary" />}
              />
            ))}
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
      </div>
    </div>
  );
};

export default Budgets;
