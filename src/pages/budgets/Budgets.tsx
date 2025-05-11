
import { ShoppingCart, Package, HomeIcon } from "lucide-react";
import { TopNavigation } from "@/components/layout/top-navigation";
import { SummaryCard } from "@/components/budget/summary-card";
import { BudgetChart } from "@/components/budget/budget-chart";
import { BudgetCategoryTable } from "@/components/budget/budget-category-table";
import { SavingsBudget } from "@/components/budget/savings-budget";
import { RunningBudget } from "@/components/budget/running-budget";

const Budgets = () => {
  return (
    <div>
      <TopNavigation 
        title="Budgets" 
        subtitle="Track your finances and achieve your financial goals" 
      />
      
      <div className="container px-6 py-8 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <SummaryCard 
            title="Groceries" 
            amount={358.00} 
            icon={<ShoppingCart className="h-5 w-5 text-primary" />} 
          />
          <SummaryCard 
            title="Shopping" 
            amount={246.00} 
            icon={<Package className="h-5 w-5 text-primary" />} 
          />
          <SummaryCard 
            title="Home Needs" 
            amount={136.00} 
            icon={<HomeIcon className="h-5 w-5 text-primary" />} 
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <BudgetChart />
          </div>
          <div>
            <SavingsBudget />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BudgetCategoryTable />
          </div>
          <div>
            <RunningBudget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Budgets;
