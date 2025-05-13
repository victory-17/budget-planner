import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IncomeExpenseChartProps {
  totalIncome: number;
  totalExpense: number;
  loading?: boolean;
  className?: string;
}

export function IncomeExpenseChart({ 
  totalIncome, 
  totalExpense, 
  loading = false, 
  className 
}: IncomeExpenseChartProps) {
  const COLORS = ['#4E60FF', '#FF6B6B'];
  
  // Calculate savings and percentages
  const savings = totalIncome - totalExpense;
  const totalAmount = totalIncome + totalExpense;
  const incomePercentage = totalAmount > 0 ? Math.round((totalIncome / totalAmount) * 100) : 0;
  const expensePercentage = totalAmount > 0 ? Math.round((totalExpense / totalAmount) * 100) : 0;
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Create data for pie chart
  const pieData = [
    { name: 'Income', value: totalIncome > 0 ? totalIncome : 0 },
    { name: 'Expenses', value: totalExpense > 0 ? totalExpense : 0 },
  ];
  
  // Create data for bar chart
  const barData = [
    { name: 'Income', amount: totalIncome },
    { name: 'Expenses', amount: totalExpense },
    { name: 'Savings', amount: savings > 0 ? savings : 0 },
  ];
  
  // Custom tooltip for pie chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-sm">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{formatCurrency(data.value)}</span>
            {' '}({data.name === 'Income' ? incomePercentage : expensePercentage}%)
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Custom tooltip for bar chart
  const BarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-sm">
          <p className="text-sm font-medium">{payload[0].payload.name}</p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{formatCurrency(payload[0].value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className={cn("rounded-xl border-[#E0E0E0] shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-[#212B36]">Income vs Expenses</CardTitle>
        <Button variant="outline" size="icon" className="ml-auto">
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4E60FF]"></div>
          </div>
        ) : (totalIncome === 0 && totalExpense === 0) ? (
          <div className="flex justify-center items-center h-[300px] text-center">
            <div>
              <p className="text-muted-foreground mb-2">No financial data available</p>
              <p className="text-sm text-muted-foreground">Add transactions to see your income and expenses</p>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-blue-700">Income</p>
                  <div className="p-1.5 bg-blue-100 rounded">
                    <DollarSign className="h-4 w-4 text-blue-700" />
                  </div>
                </div>
                <p className="text-xl font-semibold mt-2">{formatCurrency(totalIncome)}</p>
                <div className="flex items-center text-xs mt-1">
                  <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                  <span className="text-emerald-500">{incomePercentage}%</span>
                  <span className="text-gray-500 ml-1">of total</span>
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-red-700">Expenses</p>
                  <div className="p-1.5 bg-red-100 rounded">
                    <DollarSign className="h-4 w-4 text-red-700" />
                  </div>
                </div>
                <p className="text-xl font-semibold mt-2">{formatCurrency(totalExpense)}</p>
                <div className="flex items-center text-xs mt-1">
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-red-500">{expensePercentage}%</span>
                  <span className="text-gray-500 ml-1">of total</span>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-green-700">Savings</p>
                  <div className="p-1.5 bg-green-100 rounded">
                    <DollarSign className="h-4 w-4 text-green-700" />
                  </div>
                </div>
                <p className="text-xl font-semibold mt-2">{formatCurrency(savings)}</p>
                <div className="flex items-center text-xs mt-1">
                  {savings >= 0 ? (
                    <>
                      <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                      <span className="text-emerald-500">Positive</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                      <span className="text-red-500">Negative</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Charts */}
            <Tabs defaultValue="percentage" className="mt-4">
              <TabsList className="mb-4 grid w-full grid-cols-2">
                <TabsTrigger value="percentage">Percentage View</TabsTrigger>
                <TabsTrigger value="amount">Amount View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="percentage" className="mt-0">
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={110}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex justify-center gap-8 mt-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#4E60FF] mr-2"></div>
                    <span className="text-sm">Income</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#FF6B6B] mr-2"></div>
                    <span className="text-sm">Expenses</span>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="amount" className="mt-0">
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<BarTooltip />} />
                      <Bar 
                        dataKey="amount" 
                        name="Amount"
                        radius={[4, 4, 0, 0]}
                      >
                        {barData.map((entry, index) => {
                          let color = '#4E60FF';  // Default blue for income
                          if (entry.name === 'Expenses') color = '#FF6B6B';  // Red for expenses
                          if (entry.name === 'Savings') color = '#4CAF50';  // Green for savings
                          
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
} 