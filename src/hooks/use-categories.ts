import { useState, useEffect } from "react";
import { Category, categoryService } from "@/lib/services/category-service";
import { useToast } from "@/hooks/use-toast";

export function useCategories(userId: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { toast } = useToast();

  // Fetch categories
  const fetchCategories = async (type?: "income" | "expense") => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const data = await categoryService.getCategories(userId, type);
      setCategories(data);
    } catch (err: any) {
      setError(err);
      toast({
        title: "Error",
        description: `Failed to load categories: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new category
  const createCategory = async (category: Omit<Category, "is_default" | "user_id">) => {
    setLoading(true);
    try {
      const newCategory = await categoryService.createCategory({
        ...category,
        user_id: userId
      });
      
      setCategories(prev => [...prev, newCategory]);
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      
      return newCategory;
    } catch (err: any) {
      setError(err);
      toast({
        title: "Error",
        description: `Failed to create category: ${err.message}`,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a category
  const updateCategory = async (id: string, updates: Partial<Omit<Category, "is_default" | "user_id">>) => {
    setLoading(true);
    try {
      const updatedCategory = await categoryService.updateCategory(id, updates);
      
      setCategories(prev => 
        prev.map(c => c.id === id ? updatedCategory : c)
      );
      
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      
      return updatedCategory;
    } catch (err: any) {
      setError(err);
      toast({
        title: "Error",
        description: `Failed to update category: ${err.message}`,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a category
  const deleteCategory = async (id: string) => {
    setLoading(true);
    try {
      await categoryService.deleteCategory(id);
      
      setCategories(prev => prev.filter(c => c.id !== id));
      
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      
      return true;
    } catch (err: any) {
      setError(err);
      toast({
        title: "Error",
        description: `Failed to delete category: ${err.message}`,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get categories by type
  const getCategoriesByType = (type: "income" | "expense") => {
    return categories.filter(c => c.type === type);
  };

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, [userId]);

  return {
    categories,
    loading,
    error,
    expenseCategories: getCategoriesByType("expense"),
    incomeCategories: getCategoriesByType("income"),
    actions: {
      createCategory,
      updateCategory,
      deleteCategory,
      refreshCategories: fetchCategories,
      getCategoriesByType
    }
  };
} 