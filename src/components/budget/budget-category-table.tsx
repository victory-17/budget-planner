import { useState } from "react";
import { Edit, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock data for budget categories
const mockCategories = [
  {
    id: 1,
    name: "Entertainment",
    monthlyLimit: 48.00,
    spentToday: 28.00,
    remaining: 25.00,
    status: "On Track",
  },
  {
    id: 2,
    name: "Transportation",
    monthlyLimit: 25.00,
    spentToday: 15.00,
    remaining: 10.00,
    status: "Near Limit",
  },
  {
    id: 3,
    name: "Groceries",
    monthlyLimit: 150.00,
    spentToday: 67.50,
    remaining: 82.50,
    status: "On Track",
  },
  {
    id: 4,
    name: "Dining Out",
    monthlyLimit: 60.00,
    spentToday: 65.00,
    remaining: -5.00,
    status: "Over Budget",
  },
];

// GET /api/budget/categories

interface BudgetCategoryTableProps {
  className?: string;
}

export function BudgetCategoryTable({ className }: BudgetCategoryTableProps) {
  const [categories] = useState(mockCategories);
  const navigate = useNavigate();

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "On Track":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Near Limit":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Over Budget":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const viewAllCategories = () => {
    navigate("/budgets/categories");
  };

  const editCategory = (id: number) => {
    navigate(`/budgets/categories/${id}`);
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Budget Category</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => {}}>
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="gap-1" onClick={viewAllCategories}>
            See All
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-left text-muted-foreground border-b">
                <th className="font-medium py-3 px-2">Category</th>
                <th className="font-medium py-3 px-2">Monthly Limit</th>
                <th className="font-medium py-3 px-2">Spent Today</th>
                <th className="font-medium py-3 px-2">Remaining</th>
                <th className="font-medium py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr 
                  key={category.id} 
                  className="border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                  onClick={() => editCategory(category.id)}
                >
                  <td className="py-3 px-2">{category.name}</td>
                  <td className="py-3 px-2">${category.monthlyLimit.toFixed(2)}</td>
                  <td className="py-3 px-2">${category.spentToday.toFixed(2)}</td>
                  <td className="py-3 px-2">
                    ${Math.abs(category.remaining).toFixed(2)}
                    {category.remaining < 0 && <span className="text-red-500"> (overspent)</span>}
                  </td>
                  <td className="py-3 px-2">
                    <Badge variant="outline" className={getStatusBadgeVariant(category.status)}>
                      {category.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
