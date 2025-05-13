import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PiggyBank } from "lucide-react";

interface SavingsBudgetProps {
  data?: any[];
  loading?: boolean;
}

export function SavingsBudget({ data = [], loading = false }: SavingsBudgetProps) {
  // Calculate totals with safety checks
  const totalBudgeted = data.reduce((sum, budget) => 
    sum + (budget && typeof budget.budgeted === 'number' ? budget.budgeted : 0), 0);
  
  const totalSpent = data.reduce((sum, budget) => 
    sum + (budget && typeof budget.spent === 'number' ? budget.spent : 0), 0);
  
  const remaining = totalBudgeted - totalSpent;
  const progress = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card className="rounded-xl border-[#E0E0E0] shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-[#212B36] flex items-center">
          <PiggyBank className="mr-2 h-5 w-5 text-[#4E60FF]" />
          Budget Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-24 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4E60FF]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-xl font-bold text-[#212B36]">{formatCurrency(totalBudgeted)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Spent</p>
                <p className="text-xl font-bold text-red-500">{formatCurrency(totalSpent)}</p>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Remaining: {formatCurrency(remaining)}</span>
                <span>{progress.toFixed(0)}% used</span>
              </div>
              <Progress 
                value={Math.min(progress, 100)} 
                className="h-2"
                indicatorClassName={progress >= 100 ? "bg-red-500" : progress >= 80 ? "bg-amber-500" : "bg-green-500"}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
