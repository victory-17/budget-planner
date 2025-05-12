import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SavingEntry {
  id: string;
  bankName: string;
  date: string;
  amount: number;
}

const mockSavings: SavingEntry[] = [
  {
    id: "1",
    bankName: "Bank Jago",
    date: "12 Mar 2024",
    amount: 645.00
  },
  {
    id: "2",
    bankName: "Jenius",
    date: "13 Mar 2024",
    amount: 445.00
  }
];

// GET /api/savings

interface SavingsBudgetProps {
  className?: string;
}

export function SavingsBudget({ className }: SavingsBudgetProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Savings Budget</CardTitle>
        <Button variant="ghost" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {mockSavings.map((saving) => (
          <div key={saving.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 bg-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary">{saving.bankName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{saving.bankName}</p>
                <p className="text-xs text-muted-foreground">{saving.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-green-600">+${saving.amount.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
