import { useState } from "react";
import { TopNavigation } from "@/components/layout/top-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCard } from "@/components/budget/summary-card";
import { BudgetChart } from "@/components/budget/budget-chart";
import { BudgetCategoryTable } from "@/components/budget/budget-category-table";
import { SavingsBudget } from "@/components/budget/savings-budget";
import { RunningBudget } from "@/components/budget/running-budget";
import { ShoppingBag, Coffee, Home, CreditCard, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  // This will be replaced with actual API data fetching
  // GET /api/summary/categories
  const summaryCategories = [
    { 
      id: 1, 
      title: "Groceries", 
      amount: 358.00, 
      icon: <ShoppingBag className="h-5 w-5 text-white" />,
      bgColor: "bg-[#00C896]" // Vibrant green
    },
    { 
      id: 2, 
      title: "Shopping", 
      amount: 246.00, 
      icon: <CreditCard className="h-5 w-5 text-white" />,
      bgColor: "bg-[#4E60FF]" // Vibrant blue
    },
    { 
      id: 3, 
      title: "Home", 
      amount: 136.00, 
      icon: <Home className="h-5 w-5 text-white" />,
      bgColor: "bg-[#FF8F00]" // Vibrant amber/orange
    },
    { 
      id: 4, 
      title: "Dining", 
      amount: 187.00, 
      icon: <Coffee className="h-5 w-5 text-white" />,
      bgColor: "bg-[#E91E63]" // Vibrant pink
    }
  ];

  return (
    <div>
      <TopNavigation 
        title="Dashboard & Budgets" 
        subtitle="Track and manage your financial goals" 
      />
      
      <div className="container px-6 py-8 mx-auto">
        <Tabs defaultValue="overview" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="budgets">Budget Management</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab (Original Dashboard) */}
          <TabsContent value="overview">
            {/* Summary Cards */}
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
                {/* Allocation Budget Bar Chart */}
                <BudgetChart />
                
                {/* Budget Category Table */}
                <BudgetCategoryTable />
              </div>
              
              {/* Right Column (1/3 width) */}
              <div className="space-y-6">
                {/* Savings Summary Cards */}
                <SavingsBudget />
                
                {/* Running Budget Overview */}
                <RunningBudget />
              </div>
            </div>
          </TabsContent>
          
          {/* Budgets Tab (From Budgets page) */}
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
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
