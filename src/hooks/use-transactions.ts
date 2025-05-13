import { useState, useEffect } from "react";
import { 
  transactionService, 
  Transaction, 
  TransactionWithId 
} from "@/lib/services/transaction-service";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UseTransactionsOptions {
  initialFilter?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    type?: string;
  };
  limit?: number;
}

export function useTransactions(userId: string, options: UseTransactionsOptions = {}) {
  const [transactions, setTransactions] = useState<TransactionWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState(options.initialFilter || {});
  const [pagination, setPagination] = useState({
    currentPage: 0,
    limit: options.limit || 10,
    total: 0
  });
  
  const { toast } = useToast();

  // Fetch transactions
  const fetchTransactions = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const data = await transactionService.getTransactions(userId, {
        ...filters,
        limit: pagination.limit,
        offset: pagination.currentPage * pagination.limit
      });
      
      setTransactions(data as TransactionWithId[]);
      
      // Get total count for pagination
      const { count } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      
      setPagination(prev => ({
        ...prev,
        total: count || 0
      }));
      
    } catch (err: any) {
      setError(err);
      toast({
        title: "Error",
        description: `Failed to load transactions: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new transaction
  const createTransaction = async (transaction: Transaction) => {
    setLoading(true);
    try {
      const newTransaction = await transactionService.createTransaction({
        ...transaction,
        user_id: userId
      });
      
      setTransactions(prev => [newTransaction as TransactionWithId, ...prev]);
      toast({
        title: "Success",
        description: "Transaction created successfully",
      });
      
      return newTransaction;
    } catch (err: any) {
      setError(err);
      toast({
        title: "Error",
        description: `Failed to create transaction: ${err.message}`,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a transaction
  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    setLoading(true);
    try {
      const updatedTransaction = await transactionService.updateTransaction(id, updates);
      
      setTransactions(prev => 
        prev.map(t => t.id === id ? updatedTransaction as TransactionWithId : t)
      );
      
      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });
      
      return updatedTransaction;
    } catch (err: any) {
      setError(err);
      toast({
        title: "Error",
        description: `Failed to update transaction: ${err.message}`,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a transaction
  const deleteTransaction = async (id: string) => {
    setLoading(true);
    try {
      await transactionService.deleteTransaction(id);
      
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
      
      return true;
    } catch (err: any) {
      setError(err);
      toast({
        title: "Error",
        description: `Failed to delete transaction: ${err.message}`,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPagination(prev => ({
      ...prev,
      currentPage: 0 // Reset to first page when filters change
    }));
  };

  // Change page
  const changePage = (page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  // Export transactions
  const exportTransactions = async (format: "csv" | "pdf" = "csv") => {
    try {
      if (format === "csv") {
        const csvContent = await transactionService.exportTransactionsCSV(userId, filters);
        
        // Create a download link
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        
        link.setAttribute("href", url);
        link.setAttribute("download", `transactions_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // PDF export would be implemented here
        toast({
          title: "Coming Soon",
          description: "PDF export will be available soon",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to export transactions: ${err.message}`,
        variant: "destructive"
      });
    }
  };

  // Load transactions when filters or pagination changes
  useEffect(() => {
    fetchTransactions();
  }, [userId, filters, pagination.currentPage, pagination.limit]);

  return {
    transactions,
    loading,
    error,
    filters,
    pagination: {
      ...pagination,
      pageCount: Math.ceil(pagination.total / pagination.limit)
    },
    actions: {
      createTransaction,
      updateTransaction,
      deleteTransaction,
      applyFilters,
      changePage,
      refreshTransactions: fetchTransactions,
      exportTransactions
    }
  };
} 