import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

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
  
  // TODO: Connect to backend endpoint: GET /api/budget/summary
  
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
  
  // TODO: Connect to backend endpoint: GET /api/budget/categories?summary=true

  const getSafetyLabel = (percent: number) => {
    if (percent < 60) return { text: "Still Safe", color: "#00C896" };
    if (percent < 85) return { text: "Good Standing", color: "#4E60FF" };
    return { text: "Near Limit", color: "#FFC300" };
  };

  const safety = getSafetyLabel(percentage);

  return (
    <Card className={cn("rounded-xl border-[#E0E0E0] shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-[#212B36]">Running Budget</CardTitle>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[120px] text-sm rounded-md">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent className="rounded-md">
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-6">
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
                  className="text-[#F5F5F5]"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${percentage * 2.83} ${283 - percentage * 2.83}`}
                  className="text-[#4E60FF]"
                />
              </svg>
            </div>
            <div className="text-center">
              <div 
                className="text-xs uppercase font-medium mb-1" 
                style={{ color: safety.color }}
              >
                {safety.text}
              </div>
              <div className="text-3xl font-bold text-[#212B36]">${budgetAmount.toFixed(2)}</div>
              <div className="text-xs text-[#637381] mt-1">
                The amount that can be spent
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between text-sm mb-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#4E60FF]"></span>
            <span className="text-[#637381]">Budget</span>
            <span className="font-medium text-[#212B36]">${budgetAmount.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FFC300]"></span>
            <span className="text-[#637381]">Expenditure</span>
            <span className="font-medium text-[#212B36]">${totalSpent.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#00C896]"></span>
            <span className="text-[#637381]">Income</span>
            <span className="font-medium text-[#212B36]">${totalIncome.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <div className="text-[#212B36]">{category.name}</div>
                <div className="font-medium text-[#212B36]">${category.spent.toFixed(2)}</div>
              </div>
              <Progress 
                value={category.percentage} 
                className="h-2 bg-[#F5F5F5]" 
                indicatorClassName={`${category.percentage > 80 ? 'bg-[#FFC300]' : 'bg-[#4E60FF]'}`}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
