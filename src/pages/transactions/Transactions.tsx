import { useState } from "react";
import { TopNavigation } from "@/components/layout/top-navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { Transaction } from "@/lib/services/transaction-service";
import { useTransactions } from "@/hooks/use-transactions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Transactions = () => {
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  
  // Mock user ID for now - in real app this would come from authentication
  const userId = "current-user-id";
  
  // Use our transactions hook
  const {
    transactions,
    loading,
    filters,
    pagination,
    actions: {
      createTransaction,
      updateTransaction,
      deleteTransaction,
      applyFilters,
      changePage,
      exportTransactions
    }
  } = useTransactions(userId);

  // Handler for adding a new transaction
  const handleAddTransaction = async (data: Transaction) => {
    await createTransaction(data);
    setAddTransactionOpen(false);
  };

  // Handler for editing a transaction
  const handleEditTransaction = async (id: string, data: Transaction) => {
    await updateTransaction(id, data);
  };

  // Handler for deleting a transaction
  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
  };

  return (
    <div>
      <TopNavigation 
        title="Transactions" 
        subtitle="View and manage your financial transactions" 
        action={
          <Button 
            onClick={() => setAddTransactionOpen(true)}
            className="bg-[#4E60FF] hover:bg-[#4E60FF]/90 text-white"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Transaction
          </Button>
        }
      />
      
      <div className="container px-6 py-8 mx-auto">
        {/* Transaction List */}
        <TransactionList
          transactions={transactions}
          loading={loading}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          onFilter={applyFilters}
          onExport={exportTransactions}
          pagination={pagination}
          onPageChange={changePage}
        />
      </div>

      {/* Add Transaction Dialog */}
      <Dialog open={addTransactionOpen} onOpenChange={setAddTransactionOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>
              Record a new income or expense transaction
            </DialogDescription>
          </DialogHeader>
          <TransactionForm 
            onSave={handleAddTransaction}
            onCancel={() => setAddTransactionOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
