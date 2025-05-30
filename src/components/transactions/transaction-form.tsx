import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Plus, Minus } from "lucide-react";
import { format } from "date-fns";
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from "@/lib/providers/auth-provider";
import { useBudgets } from "@/hooks/use-budgets";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Transaction, getUserDefaultAccount } from "@/lib/services/transaction-service";

// Form schema using zod
const transactionFormSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.string().min(1, "Amount is required"),
  category: z.string().min(1, "Category is required"),
  budget_id: z.string().optional(),
  date: z.date({
    required_error: "Date is required",
  }),
  description: z.string().optional(),
  apply_to_budget: z.boolean().default(true)
});

// Type for the form data
type TransactionFormValues = z.infer<typeof transactionFormSchema>;

// Default values for the form
const defaultValues: Partial<TransactionFormValues> = {
  type: "expense",
  amount: "",
  category: "",
  budget_id: "",
  date: new Date(),
  description: "",
  apply_to_budget: true
};

// Category options based on type
const categoryOptions = {
  expense: [
    { value: "groceries", label: "Groceries" },
    { value: "shopping", label: "Shopping" },
    { value: "home", label: "Home" },
    { value: "dining", label: "Dining" },
    { value: "transportation", label: "Transportation" },
    { value: "entertainment", label: "Entertainment" },
    { value: "bills", label: "Bills & Utilities" },
    { value: "health", label: "Health" },
    { value: "education", label: "Education" },
    { value: "other", label: "Other" },
  ],
  income: [
    { value: "salary", label: "Salary" },
    { value: "freelance", label: "Freelance" },
    { value: "investments", label: "Investments" },
    { value: "gifts", label: "Gifts" },
    { value: "refunds", label: "Refunds" },
    { value: "other", label: "Other" },
  ],
};

interface TransactionFormProps {
  onSubmit?: (data: Transaction) => void;
  onSave?: (data: Transaction) => void;
  onCancel?: () => void;
  initialData?: Partial<Transaction>;
  userId?: string;
  preselectedBudgetId?: string;
  preselectedCategory?: string;
}

export function TransactionForm({ 
  onSubmit, 
  onSave,
  onCancel,
  initialData,
  userId: providedUserId, 
  preselectedBudgetId,
  preselectedCategory
}: TransactionFormProps) {
  const { user } = useAuth();
  const userId = providedUserId || user?.id || 'guest-user';
  const [defaultAccountId, setDefaultAccountId] = useState<string | null>(null);
  
  // Fetch user's budgets for selection
  const { budgets, loading: budgetsLoading } = useBudgets(userId);
  
  // Fetch user's default account ID
  useEffect(() => {
    const fetchAccountId = async () => {
      const accountId = await getUserDefaultAccount(userId);
      setDefaultAccountId(accountId);
    };
    
    fetchAccountId();
  }, [userId]);
  
  // Initialize the form with initial values
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: initialData?.type as "income" | "expense" || defaultValues.type,
      amount: initialData?.amount ? String(initialData.amount) : defaultValues.amount,
      category: initialData?.category || preselectedCategory || defaultValues.category,
      budget_id: initialData?.budget_id || preselectedBudgetId || defaultValues.budget_id,
      date: initialData?.date ? new Date(initialData.date) : defaultValues.date,
      description: initialData?.description || defaultValues.description,
      apply_to_budget: initialData?.budget_id ? true : defaultValues.apply_to_budget
    },
  });

  // Get the current transaction type to update category options
  const transactionType = form.watch("type");
  const selectedCategory = form.watch("category");
  const applyToBudget = form.watch("apply_to_budget");
  
  // Auto-select budget based on category if available
  useEffect(() => {
    if (selectedCategory && applyToBudget && !form.getValues("budget_id")) {
      const matchingBudget = budgets.find(b => b.category === selectedCategory);
      if (matchingBudget) {
        form.setValue("budget_id", matchingBudget.id as string);
      }
    }
  }, [selectedCategory, budgets, applyToBudget, form]);

  // Submit handler
  function handleSubmit(data: TransactionFormValues) {
    // Convert amount string to number for API
    const transaction: Transaction = {
      user_id: userId,
      type: data.type,
      amount: parseFloat(data.amount),
      category: data.category,
      budget_id: data.apply_to_budget ? data.budget_id : undefined,
      date: data.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      description: data.description || null,
      account_id: defaultAccountId || uuidv4(), // Use the fetched account ID or generate a UUID
    };
    
    console.log("Submitting transaction:", transaction);
    // Use onSave if provided, otherwise fall back to onSubmit
    if (onSave) {
      onSave(transaction);
    } else if (onSubmit) {
      onSubmit(transaction);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Transaction Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Transaction Type</FormLabel>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex"
              >
                <div className="flex items-center space-x-2 mr-4">
                  <RadioGroupItem value="expense" id="expense" />
                  <label htmlFor="expense" className="flex items-center gap-1 cursor-pointer text-sm font-medium">
                    <Minus className="h-4 w-4 text-red-500" />
                    Expense
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <label htmlFor="income" className="flex items-center gap-1 cursor-pointer text-sm font-medium">
                    <Plus className="h-4 w-4 text-green-500" />
                    Income
                  </label>
                </div>
              </RadioGroup>
            </FormItem>
          )}
        />

        {/* Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input 
                    placeholder="0.00" 
                    className="pl-8" 
                    {...field} 
                    type="number"
                    step="0.01"
                    min="0"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categoryOptions[transactionType].map((category) => (
                    <SelectItem 
                      key={category.value} 
                      value={category.value}
                    >
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Apply to Budget Checkbox */}
        {transactionType === "expense" && (
          <FormField
            control={form.control}
            name="apply_to_budget"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Apply to Budget
                  </FormLabel>
                  <FormDescription>
                    Track this expense against a budget category
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        )}

        {/* Budget Selection - Only show if apply_to_budget is checked */}
        {transactionType === "expense" && applyToBudget && (
          <FormField
            control={form.control}
            name="budget_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Budget</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a budget" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {budgetsLoading ? (
                      <SelectItem value="loading">Loading budgets...</SelectItem>
                    ) : budgets.length === 0 ? (
                      <SelectItem value="none">No budgets found</SelectItem>
                    ) : (
                      budgets.map((budget) => (
                        <SelectItem 
                          key={budget.id} 
                          value={budget.id as string}
                        >
                          {budget.category} (${budget.amount})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a brief description"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" className="bg-[#4E60FF] hover:bg-[#4E60FF]/90 text-white">
            Save Transaction
          </Button>
        </div>
      </form>
    </Form>
  );
} 