// This simulates a microservice for category management
// In a real application, this would call a separate API endpoint

import { supabase } from "@/integrations/supabase/client";

// Default categories
const DEFAULT_EXPENSE_CATEGORIES = [
  { id: "groceries", name: "Groceries", type: "expense", icon: "shopping-bag" },
  { id: "shopping", name: "Shopping", type: "expense", icon: "shopping-cart" },
  { id: "dining", name: "Dining", type: "expense", icon: "coffee" },
  { id: "transportation", name: "Transportation", type: "expense", icon: "car" },
  { id: "home", name: "Home", type: "expense", icon: "home" },
  { id: "entertainment", name: "Entertainment", type: "expense", icon: "film" },
  { id: "bills", name: "Bills & Utilities", type: "expense", icon: "file-text" },
  { id: "health", name: "Health", type: "expense", icon: "activity" },
  { id: "education", name: "Education", type: "expense", icon: "book" },
  { id: "other", name: "Other", type: "expense", icon: "more-horizontal" },
];

const DEFAULT_INCOME_CATEGORIES = [
  { id: "salary", name: "Salary", type: "income", icon: "briefcase" },
  { id: "freelance", name: "Freelance", type: "income", icon: "edit-3" },
  { id: "investments", name: "Investments", type: "income", icon: "trending-up" },
  { id: "gifts", name: "Gifts", type: "income", icon: "gift" },
  { id: "refunds", name: "Refunds", type: "income", icon: "corner-up-left" },
  { id: "other", name: "Other", type: "income", icon: "more-horizontal" },
];

// Type definitions
export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  user_id?: string;
  is_default?: boolean;
}

// Storage key for categories
const CATEGORIES_TABLE = "categories";

export const categoryService = {
  // Initialize default categories for a new user
  async initializeDefaultCategories(userId: string) {
    // Check if user already has categories
    const { data: existingCategories } = await supabase
      .from(CATEGORIES_TABLE)
      .select("*")
      .eq("user_id", userId);
    
    // If user already has categories, return them
    if (existingCategories && existingCategories.length > 0) {
      return existingCategories;
    }
    
    // Otherwise, create default categories for the user
    const defaultCategories = [
      ...DEFAULT_EXPENSE_CATEGORIES,
      ...DEFAULT_INCOME_CATEGORIES
    ].map(category => ({
      ...category,
      user_id: userId,
      is_default: true
    }));
    
    const { data, error } = await supabase
      .from(CATEGORIES_TABLE)
      .insert(defaultCategories)
      .select();
    
    if (error) {
      console.error("Error initializing default categories:", error);
      throw error;
    }
    
    return data;
  },

  // Get all categories for a user
  async getCategories(userId: string, type?: "income" | "expense") {
    let query = supabase
      .from(CATEGORIES_TABLE)
      .select("*")
      .eq("user_id", userId);
    
    // Filter by type if provided
    if (type) {
      query = query.eq("type", type);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
    
    // If no categories found, initialize defaults
    if (!data || data.length === 0) {
      return this.initializeDefaultCategories(userId);
    }
    
    return data;
  },

  // Create a new custom category
  async createCategory(category: Omit<Category, "is_default">) {
    const { data, error } = await supabase
      .from(CATEGORIES_TABLE)
      .insert({
        ...category,
        is_default: false
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating category:", error);
      throw error;
    }
    
    return data;
  },

  // Update a category (only custom categories can be updated)
  async updateCategory(id: string, updates: Partial<Omit<Category, "is_default" | "user_id">>) {
    // Check if this is a default category
    const { data: category } = await supabase
      .from(CATEGORIES_TABLE)
      .select("is_default")
      .eq("id", id)
      .single();
    
    if (category && category.is_default) {
      throw new Error("Default categories cannot be modified");
    }
    
    const { data, error } = await supabase
      .from(CATEGORIES_TABLE)
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating category:", error);
      throw error;
    }
    
    return data;
  },

  // Delete a category (only custom categories can be deleted)
  async deleteCategory(id: string) {
    // Check if this is a default category
    const { data: category } = await supabase
      .from(CATEGORIES_TABLE)
      .select("is_default")
      .eq("id", id)
      .single();
    
    if (category && category.is_default) {
      throw new Error("Default categories cannot be deleted");
    }
    
    const { error } = await supabase
      .from(CATEGORIES_TABLE)
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
    
    return true;
  }
}; 