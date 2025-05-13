import { useState, useEffect } from "react";
import { TopNavigation } from "@/components/layout/top-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PieChart, Pie, Cell, 
  LineChart, Line, 
  BarChart, Bar, 
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from "recharts";
import { Download, BarChart2, PieChart as PieChartIcon, LineChart as LineChartIcon, Calendar } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransactions } from "@/hooks/use-transactions";
import { useAuth } from "@/lib/providers/auth-provider";
import { cn } from "@/lib/utils";

// Define colors for different categories and chart elements
const COLORS = {
  income: "#4CAF50",
  expense: "#F44336",
  savings: "#2196F3",
  pieColors: [
    "#4E60FF", "#2196F3", "#00BFA5", "#FFC107", "#FF5722", 
    "#9C27B0", "#673AB7", "#3F51B5", "#E91E63", "#795548"
  ],
  lineColors: {
    income: "#4CAF50",
    expense: "#F44336",
    savings: "#2196F3"
  }
};

const Reports = () => {
  const [timePeriod, setTimePeriod] = useState("month");
  const [chartType, setChartType] = useState("overview");
  
  // Get the current user ID from auth
  const { user } = useAuth();
  const userId = user?.id || 'guest-user';
  
  // Use our transactions hook to get all transactions
  const {
    transactions,
    loading,
    actions: { refreshTransactions }
  } = useTransactions(userId, { limit: 1000 }); // Get a large number of transactions for reports
  
  // Data for various charts
  const [incomeVsExpenseData, setIncomeVsExpenseData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyTrendsData, setMonthlyTrendsData] = useState<any[]>([]);
  const [savingsData, setSavingsData] = useState<any[]>([]);
  
  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  };
  
  // Helper function to format month
  const formatMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };
  
  // Generate data for charts based on transactions
  useEffect(() => {
    if (transactions.length === 0) return;
    
    // Filter transactions based on selected time period
    const now = new Date();
    let startDate: Date;
    
    switch (timePeriod) {
      case "week":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarter":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    const filteredTransactions = transactions.filter(t => 
      new Date(t.date) >= startDate && new Date(t.date) <= now
    );
    
    // 1. Income vs Expense Data
    const incomeTotal = filteredTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenseTotal = filteredTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    setIncomeVsExpenseData([
      { name: "Income", value: incomeTotal },
      { name: "Expenses", value: expenseTotal }
    ]);
    
    // 2. Category Data for Pie Chart
    const expensesByCategory = filteredTransactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => {
        const category = t.category.charAt(0).toUpperCase() + t.category.slice(1);
        acc[category] = (acc[category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
    
    setCategoryData(
      Object.entries(expensesByCategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    );
    
    // 3. Monthly Trends Data
    // Group transactions by month and type
    const monthlyData: Record<string, { month: string, income: number, expense: number, savings: number }> = {};
    
    filteredTransactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { 
          month: monthName, 
          income: 0, 
          expense: 0, 
          savings: 0 
        };
      }
      
      if (t.type === "income") {
        monthlyData[monthKey].income += t.amount;
      } else if (t.type === "expense") {
        monthlyData[monthKey].expense += t.amount;
      }
      
      // Calculate savings (income - expense)
      monthlyData[monthKey].savings = monthlyData[monthKey].income - monthlyData[monthKey].expense;
    });
    
    // Convert to array and sort by month
    const monthlyTrends = Object.values(monthlyData);
    
    // Sort by date (assuming month names are in chronological order)
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    monthlyTrends.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
    
    setMonthlyTrendsData(monthlyTrends);
    
    // 4. Savings Trend (Cumulative)
    let runningSavings = 0;
    const savingsTrend = monthlyTrends.map(item => {
      runningSavings += item.savings;
      return {
        month: item.month,
        savings: runningSavings
      };
    });
    
    setSavingsData(savingsTrend);
    
  }, [transactions, timePeriod]);
  
  // Custom tooltip for the Income vs Expense chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-sm">
          <p className="text-sm font-medium">{payload[0].name}</p>
          <p className="text-sm">
            <span className={payload[0].name === "Income" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              ${payload[0].value.toFixed(2)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Format large numbers for readability
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Render loading or empty state
  if (loading) {
    return (
      <div>
        <TopNavigation 
          title="Financial Reports" 
          subtitle="Analyze your income, expenses, and savings trends" 
        />
        <div className="container px-6 py-8 mx-auto">
          <div className="grid place-items-center h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4E60FF]"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render empty state if no transactions
  if (transactions.length === 0) {
    return (
      <div>
        <TopNavigation 
          title="Financial Reports" 
          subtitle="Analyze your income, expenses, and savings trends" 
        />
        <div className="container px-6 py-8 mx-auto">
          <div className="grid place-items-center h-[400px]">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">No Transaction Data</h2>
              <p className="text-muted-foreground mb-4">
                Add some transactions to generate financial reports
              </p>
              <Button 
                onClick={() => refreshTransactions()}
                className="bg-[#4E60FF] hover:bg-[#4E60FF]/90 text-white"
              >
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <TopNavigation 
        title="Financial Reports" 
        subtitle="Analyze your income, expenses, and savings trends" 
      />
      
      <div className="container px-6 py-8 mx-auto">
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <Tabs value={chartType} onValueChange={setChartType} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="overview">
                <BarChart2 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="categories">
                <PieChartIcon className="h-4 w-4 mr-2" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="trends">
                <LineChartIcon className="h-4 w-4 mr-2" />
                Trends
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Past Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">Past 3 Months</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Charts section with Tabs component wrapping all TabsContent */}
        <Tabs value={chartType} onValueChange={setChartType}>
          {/* Overview Tab */}
          <TabsContent value="overview">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="rounded-xl border-[#E0E0E0] shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-[#212B36]">Total Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(incomeVsExpenseData[0]?.value || 0)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">For the selected period</p>
                </CardContent>
              </Card>
              
              <Card className="rounded-xl border-[#E0E0E0] shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-[#212B36]">Total Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(incomeVsExpenseData[1]?.value || 0)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">For the selected period</p>
                </CardContent>
              </Card>
              
              <Card className="rounded-xl border-[#E0E0E0] shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-[#212B36]">Net Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "text-2xl font-bold",
                    ((incomeVsExpenseData[0]?.value || 0) - (incomeVsExpenseData[1]?.value || 0)) >= 0 
                      ? "text-blue-600" 
                      : "text-red-600"
                  )}>
                    {formatCurrency((incomeVsExpenseData[0]?.value || 0) - (incomeVsExpenseData[1]?.value || 0))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Income minus expenses</p>
                </CardContent>
              </Card>
            </div>
              
            {/* Income vs Expense Chart */}
            <Card className="rounded-xl border-[#E0E0E0] shadow-sm mb-6">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold text-[#212B36]">Income vs Expenses</CardTitle>
                <Button variant="outline" size="icon" className="ml-auto">
                  <Download className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={incomeVsExpenseData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                      <XAxis dataKey="name" tick={{ fill: '#637381' }} />
                      <YAxis tick={{ fill: '#637381' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar 
                        dataKey="value" 
                        name="Amount" 
                        fill="#8884d8" 
                        radius={[4, 4, 0, 0]}
                        barSize={60}
                      >
                        {incomeVsExpenseData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.name === "Income" ? COLORS.income : COLORS.expense} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Monthly Trends Chart */}
            <Card className="rounded-xl border-[#E0E0E0] shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold text-[#212B36]">Monthly Trends</CardTitle>
                <Button variant="outline" size="icon" className="ml-auto">
                  <Download className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyTrendsData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                      <XAxis dataKey="month" tick={{ fill: '#637381' }} />
                      <YAxis tick={{ fill: '#637381' }} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="income" 
                        name="Income" 
                        stroke={COLORS.lineColors.income} 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="expense" 
                        name="Expense" 
                        stroke={COLORS.lineColors.expense} 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="savings" 
                        name="Savings" 
                        stroke={COLORS.lineColors.savings} 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Categories Tab */}
          <TabsContent value="categories">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expense Categories Pie Chart */}
              <Card className="rounded-xl border-[#E0E0E0] shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold text-[#212B36]">Expense Categories</CardTitle>
                  <Button variant="outline" size="icon" className="ml-auto">
                    <Download className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-[380px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS.pieColors[index % COLORS.pieColors.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center mt-4">
                    {categoryData.map((category, index) => (
                      <div key={category.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS.pieColors[index % COLORS.pieColors.length] }}
                        ></div>
                        <span className="text-sm text-[#637381]">{category.name}: ${category.value.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Category Comparison Bar Chart */}
              <Card className="rounded-xl border-[#E0E0E0] shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold text-[#212B36]">Category Comparison</CardTitle>
                  <Button variant="outline" size="icon" className="ml-auto">
                    <Download className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-[380px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryData}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#E0E0E0" />
                        <XAxis type="number" tick={{ fill: '#637381' }} />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          tick={{ fill: '#637381' }} 
                          width={60}
                        />
                        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                        <Bar 
                          dataKey="value" 
                          name="Amount" 
                          radius={[0, 4, 4, 0]}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS.pieColors[index % COLORS.pieColors.length]} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Trends Tab */}
          <TabsContent value="trends">
            <div className="grid grid-cols-1 gap-6">
              {/* Income & Expense Trend */}
              <Card className="rounded-xl border-[#E0E0E0] shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold text-[#212B36]">Income & Expense Trend</CardTitle>
                  <Button variant="outline" size="icon" className="ml-auto">
                    <Download className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={monthlyTrendsData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                        <XAxis dataKey="month" tick={{ fill: '#637381' }} />
                        <YAxis tick={{ fill: '#637381' }} />
                        <Tooltip />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="income" 
                          name="Income" 
                          stroke={COLORS.lineColors.income} 
                          fill={COLORS.lineColors.income} 
                          fillOpacity={0.3}
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="expense" 
                          name="Expense" 
                          stroke={COLORS.lineColors.expense} 
                          fill={COLORS.lineColors.expense} 
                          fillOpacity={0.3}
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Savings Growth */}
              <Card className="rounded-xl border-[#E0E0E0] shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold text-[#212B36]">Savings Growth</CardTitle>
                  <Button variant="outline" size="icon" className="ml-auto">
                    <Download className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={savingsData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                        <XAxis dataKey="month" tick={{ fill: '#637381' }} />
                        <YAxis tick={{ fill: '#637381' }} />
                        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                        <Area 
                          type="monotone" 
                          dataKey="savings" 
                          name="Cumulative Savings" 
                          stroke={COLORS.lineColors.savings} 
                          fill={COLORS.lineColors.savings} 
                          fillOpacity={0.6}
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;
