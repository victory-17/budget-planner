
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface RunningBudgetProps {
  className?: string;
}

export function RunningBudget({ className }: RunningBudgetProps) {
  const [timeframe, setTimeframe] = useState("today");
  
  // Mock data
  const budgetAmount = 350.0;
  const totalSpent = 35.0;
  const totalIncome = 60.0;
  const percentage = Math.min(100, Math.round((totalSpent / budgetAmount) * 100));
  
  const categories = [
    {
      name: "Eating & Drinking",
      spent: 45.0,
      total: 55.0,
      percentage: 82,
    },
    {
      name: "Education",
      spent: 95.0,
      total: 120.0,
      percentage: 79,
    },
    {
      name: "Transportation",
      spent: 25.0,
      total: 40.0,
      percentage: 63,
    },
  ];

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Running Budget</CardTitle>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-4">
          <div className="relative flex items-center justify-center w-48 h-48">
            <div className="w-full h-full absolute">
              <svg viewBox="0 0 100 100" className="w-full h-full transform rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-gray-100 dark:text-gray-800"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${percentage * 2.83} ${283 - percentage * 2.83}`}
                  className="text-budget-blue"
                />
              </svg>
            </div>
            <div className="text-center">
              <div className="text-xs uppercase font-medium text-muted-foreground mb-1">
                {percentage < 75 ? "Still Safe" : "Near Limit"}
              </div>
              <div className="text-3xl font-bold">${budgetAmount.toFixed(3)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                The amount that can be spent
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between text-sm mb-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary"></span>
            <span>Budget</span>
            <span className="font-medium">${budgetAmount.toFixed(3)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-budget-yellow"></span>
            <span>Expenditure</span>
            <span className="font-medium">${totalSpent.toFixed(3)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-budget-green"></span>
            <span>Income</span>
            <span className="font-medium">${totalIncome.toFixed(3)}</span>
          </div>
        </div>

        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <div>{category.name}</div>
                <div className="font-medium">${category.spent.toFixed(3)}</div>
              </div>
              <Progress value={category.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
