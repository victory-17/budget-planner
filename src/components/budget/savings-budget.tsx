import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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

// TODO: Connect to backend endpoint: GET /api/savings

interface SavingsBudgetProps {
  className?: string;
}

export function SavingsBudget({ className }: SavingsBudgetProps) {
  return (
    <Card className={cn("rounded-xl border-[#E0E0E0] shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-[#212B36]">Savings Budget</CardTitle>
        <Button variant="ghost" size="icon" className="hover:bg-[#F9FAFB]">
          <Plus className="h-4 w-4 text-[#4E60FF]" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {mockSavings.map((saving) => (
          <div key={saving.id} className="flex items-center justify-between p-4 border border-[#E0E0E0] rounded-lg hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 bg-[#4E60FF]/10">
                <AvatarFallback className="bg-[#4E60FF]/10 text-[#4E60FF]">{saving.bankName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-[#212B36]">{saving.bankName}</p>
                <p className="text-xs text-[#637381]">{saving.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-[#00C896]">+${saving.amount.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
