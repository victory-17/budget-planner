import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

// Define colors for the most common categories
const COLORS: Record<string, string> = {
  groceries: "#4CAF50", // Softer green
  shopping: "#2196F3", // Softer blue
  home: "#FFC107", // Softer yellow/amber
  dining: "#9C27B0", // Softer purple
  transportation: "#FF5722", // Softer orange
  entertainment: "#795548", // Softer brown
  bills: "#607D8B", // Softer blue-gray
  health: "#E91E63", // Softer pink
  education: "#3F51B5", // Softer indigo
  other: "#9E9E9E", // Softer gray
};

// Get color for a category (use predefined or generate)
const getCategoryColor = (category: string): string => {
  return COLORS[category.toLowerCase()] || COLORS.other;
};

interface BudgetChartProps {
  data?: any[];
  loading?: boolean;
  className?: string;
}

export function BudgetChart({ data = [], loading = false, className }: BudgetChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Transform budget data for the chart
  useEffect(() => {
    if (data && data.length > 0) {
      // Create a single data point for the bar chart
      const chartItem: Record<string, any> = { name: "Budget vs Spent" };
      const usedCategories: string[] = [];
      
      // Add each budget category as a property
      data.forEach(budget => {
        const category = budget.category.toLowerCase();
        chartItem[`${category}_budget`] = budget.budgeted;
        chartItem[`${category}_spent`] = budget.spent;
        usedCategories.push(category);
      });
      
      setChartData([chartItem]);
      setCategories(usedCategories);
    }
  }, [data]);

  // Format tooltip values
  const formatTooltipValue = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  // Custom tooltip content
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataKey = payload[0].dataKey;
      const isSpent = dataKey.includes("_spent");
      const category = dataKey.replace("_spent", "").replace("_budget", "");
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-sm">
          <p className="text-sm font-medium capitalize mb-1">{category}</p>
          <p className="text-sm text-gray-600">
            {isSpent ? "Spent: " : "Budget: "}
            <span className={isSpent ? "text-red-600 font-semibold" : "text-blue-600 font-semibold"}>
              ${payload[0].value.toFixed(2)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={cn("rounded-xl border-[#E0E0E0] shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-[#212B36]">Budget Overview</CardTitle>
        <Button variant="outline" size="icon" className="ml-auto">
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-2">
        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4E60FF]"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex justify-center items-center h-[300px] text-center">
            <div>
              <p className="text-muted-foreground mb-2">No budget data available</p>
              <p className="text-sm text-muted-foreground">Create a budget to see your spending overview</p>
            </div>
          </div>
        ) : (
          <>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData} 
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E0E0E0" />
                  <XAxis 
                    type="number" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#637381' }} 
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#637381' }} 
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {categories.map(category => (
                    <Bar 
                      key={`${category}_budget`}
                      dataKey={`${category}_budget`} 
                      fill={getCategoryColor(category)} 
                      radius={[0, 4, 4, 0]} 
                      barSize={20}
                      opacity={0.8}
                      name={`${category} Budget`}
                    />
                  ))}
                  
                  {categories.map(category => (
                    <Bar 
                      key={`${category}_spent`}
                      dataKey={`${category}_spent`} 
                      fill={getCategoryColor(category)} 
                      radius={[0, 4, 4, 0]} 
                      barSize={20}
                      name={`${category} Spent`}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-4">
              {categories.map(category => (
                <div key={category} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getCategoryColor(category) }}></div>
                  <span className="text-sm text-[#637381] capitalize">{category}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
