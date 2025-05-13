import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
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
import { useCategories } from "@/hooks/use-categories";

// Form schema using zod
const budgetFormSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    {
      message: "Amount must be a positive number",
    }
  ),
  period: z.enum(["month", "year"]).default("month"),
});

// Type for the form data
type BudgetFormValues = z.infer<typeof budgetFormSchema>;

// Default values for the form
const defaultValues: Partial<BudgetFormValues> = {
  category: "",
  amount: "",
  period: "month",
};

interface BudgetFormProps {
  onSave: (data: BudgetFormValues) => void;
  onCancel: () => void;
  initialValues?: Partial<BudgetFormValues>;
  userId: string;
}

export function BudgetForm({ onSave, onCancel, initialValues, userId }: BudgetFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  // Initialize the form with initial values or defaults
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: initialValues || defaultValues,
  });
  
  // Get expense categories from the categories hook
  const { expenseCategories, loading } = useCategories(userId);
  
  // Update the form when initialValues change
  useEffect(() => {
    if (initialValues) {
      Object.entries(initialValues).forEach(([key, value]) => {
        form.setValue(key as keyof BudgetFormValues, value);
      });
      
      if (initialValues.category) {
        setSelectedCategory(initialValues.category);
      }
    }
  }, [form, initialValues]);

  // Submit handler
  function onSubmit(data: BudgetFormValues) {
    // Convert amount string to number for API
    const processedData = {
      ...data,
      amount: parseFloat(data.amount),
    };
    
    onSave(processedData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expense Category</FormLabel>
              <Select 
                disabled={loading}
                onValueChange={(value) => {
                  field.onChange(value);
                  setSelectedCategory(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>
                      Loading categories...
                    </SelectItem>
                  ) : expenseCategories.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No categories available
                    </SelectItem>
                  ) : (
                    expenseCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Limit</FormLabel>
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

        {/* Period */}
        <FormField
          control={form.control}
          name="period"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Period</FormLabel>
              <Select 
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a period" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-[#4E60FF] hover:bg-[#4E60FF]/90 text-white"
          >
            {initialValues ? "Update Budget" : "Set Budget"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 