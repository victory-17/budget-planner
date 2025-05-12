# Frontend Integration with Backend API

This document outlines how the frontend React components should integrate with the backend API endpoints. It includes example code for each major feature area.

## API Client Setup

Use a service-based approach to interact with the API endpoints. Create an API client that handles authentication, error handling, and request/response formatting.

```typescript
// src/lib/api-client.ts
import axios from 'axios';

const BASE_URL = '/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('supabase.auth.token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized errors
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

## Authentication Integration

### Sign Up

```typescript
// src/lib/services/auth-service.ts
import apiClient from '../api-client';

export const authService = {
  async signUp(email: string, password: string, firstName?: string, lastName?: string) {
    try {
      const response = await apiClient.post('/auth/signup', {
        email,
        password,
        first_name: firstName,
        last_name: lastName
      });
      return response.data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },
  
  // Other auth methods...
};

// Usage in component
import { authService } from '@/lib/services/auth-service';
import { useState } from 'react';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.signUp(email, password, firstName);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };
  
  // Component JSX...
}
```

## Account Management Integration

### Fetching Accounts

```typescript
// src/lib/services/account-service.ts
import apiClient from '../api-client';
import { Account } from '@/types';

export const accountService = {
  async getAccounts() {
    try {
      const response = await apiClient.get('/accounts');
      return response.data as Account[];
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  },
  
  async createAccount(name: string, type: string, balance: number, currency: string) {
    try {
      const response = await apiClient.post('/accounts', {
        name,
        type,
        balance,
        currency
      });
      return response.data as Account;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  },
  
  // Other account methods...
};

// Usage with React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountService } from '@/lib/services/account-service';

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: accountService.getAccounts
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; type: string; balance: number; currency: string }) => 
      accountService.createAccount(data.name, data.type, data.balance, data.currency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    }
  });
}
```

## Transaction Management Integration

### Transaction List with Filtering

```typescript
// src/lib/services/transaction-service.ts
import apiClient from '../api-client';
import { Transaction } from '@/types';

export type TransactionFilters = {
  account_id?: string;
  start_date?: string;
  end_date?: string;
  type?: string;
  category?: string;
  limit?: number;
  offset?: number;
};

export const transactionService = {
  async getTransactions(filters: TransactionFilters = {}) {
    try {
      const response = await apiClient.get('/transactions', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },
  
  async createTransaction(data: {
    account_id: string;
    amount: number;
    type: string;
    category: string;
    description?: string;
    date: string;
  }) {
    try {
      const response = await apiClient.post('/transactions', data);
      return response.data as Transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },
  
  // Other transaction methods...
};

// Usage with React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService, TransactionFilters } from '@/lib/services/transaction-service';
import { useState } from 'react';

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionService.getTransactions(filters)
  });
}

export function TransactionList() {
  const [filters, setFilters] = useState<TransactionFilters>({
    limit: 20,
    offset: 0
  });
  
  const { data, isLoading, error } = useTransactions(filters);
  
  // Component JSX...
}
```

## Budget Management Integration

### Budget List and Creation

```typescript
// src/lib/services/budget-service.ts
import apiClient from '../api-client';
import { Budget } from '@/types';

export const budgetService = {
  async getBudgets(period?: string) {
    try {
      const response = await apiClient.get('/budgets', { 
        params: { period } 
      });
      return response.data as Budget[];
    } catch (error) {
      console.error('Error fetching budgets:', error);
      throw error;
    }
  },
  
  async createBudget(category: string, amount: number, period: string) {
    try {
      const response = await apiClient.post('/budgets', {
        category,
        amount,
        period
      });
      return response.data as Budget;
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  },
  
  async getBudgetSummary(period?: string) {
    try {
      const response = await apiClient.get('/budgets/summary', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching budget summary:', error);
      throw error;
    }
  },
  
  // Other budget methods...
};

// Usage with React Query
import { useQuery } from '@tanstack/react-query';
import { budgetService } from '@/lib/services/budget-service';

export function useBudgets(period = 'monthly') {
  return useQuery({
    queryKey: ['budgets', period],
    queryFn: () => budgetService.getBudgets(period)
  });
}

export function useBudgetSummary(period = 'monthly') {
  return useQuery({
    queryKey: ['budget-summary', period],
    queryFn: () => budgetService.getBudgetSummary(period)
  });
}
```

## Report Generation Integration

### Spending Reports

```typescript
// src/lib/services/report-service.ts
import apiClient from '../api-client';

export const reportService = {
  async getSpendingReport(startDate: string, endDate: string, groupBy?: string) {
    try {
      const response = await apiClient.get('/reports/spending', {
        params: {
          start_date: startDate,
          end_date: endDate,
          group_by: groupBy
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching spending report:', error);
      throw error;
    }
  },
  
  async getIncomeReport(startDate: string, endDate: string, groupBy?: string) {
    try {
      const response = await apiClient.get('/reports/income', {
        params: {
          start_date: startDate,
          end_date: endDate,
          group_by: groupBy
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching income report:', error);
      throw error;
    }
  },
  
  // Other report methods...
};

// Usage with React Query
import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/lib/services/report-service';
import { useState } from 'react';

export function SpendingReportChart() {
  const [dateRange, setDateRange] = useState({
    startDate: '2023-01-01',
    endDate: '2023-12-31'
  });
  
  const { data, isLoading } = useQuery({
    queryKey: ['spending-report', dateRange],
    queryFn: () => reportService.getSpendingReport(
      dateRange.startDate, 
      dateRange.endDate, 
      'month'
    )
  });
  
  // Component JSX with chart using data
}
```

## Error Handling

Implement consistent error handling across all API integrations:

```typescript
// src/lib/utils/api-error-handler.ts
import { toast } from '@/hooks/use-toast';

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
  }
}

export function handleApiError(error: unknown, fallbackMessage = 'An unexpected error occurred') {
  console.error('API Error:', error);
  
  // If it's an axios error with a response
  if (error && typeof error === 'object' && 'response' in error) {
    const errorResponse = error.response?.data as ApiError;
    
    if (errorResponse?.error?.message) {
      toast({
        title: 'Error',
        description: errorResponse.error.message,
        variant: 'destructive',
      });
      return;
    }
  }
  
  // Fallback error message
  toast({
    title: 'Error',
    description: fallbackMessage,
    variant: 'destructive',
  });
}

// Usage in a component
import { handleApiError } from '@/lib/utils/api-error-handler';

const handleSubmit = async () => {
  try {
    await accountService.createAccount(name, type, balance, currency);
    toast({
      title: 'Success',
      description: 'Account created successfully',
    });
  } catch (error) {
    handleApiError(error, 'Failed to create account');
  }
};
```

## Form Handling with API Integration

Use a form library like React Hook Form with API integration:

```typescript
// Example with React Hook Form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/lib/services/transaction-service';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { toast } from '@/hooks/use-toast';

const transactionSchema = z.object({
  account_id: z.string().min(1, 'Account is required'),
  amount: z.number().positive('Amount must be positive'),
  type: z.string().min(1, 'Type is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export function AddTransactionForm() {
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
    }
  });
  
  const mutation = useMutation({
    mutationFn: (data: TransactionFormValues) => transactionService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: 'Success',
        description: 'Transaction added successfully',
      });
      reset();
    },
    onError: (error) => {
      handleApiError(error, 'Failed to add transaction');
    }
  });
  
  const onSubmit = (data: TransactionFormValues) => {
    mutation.mutate(data);
  };
  
  // Form JSX...
}
```

## Server State Management with React Query

Organize React Query usage with custom hooks:

```typescript
// src/hooks/queries/use-accounts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountService } from '@/lib/services/account-service';
import { Account } from '@/types';

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: accountService.getAccounts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: ['account', id],
    queryFn: () => accountService.getAccount(id),
    enabled: !!id,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; type: string; balance: number; currency: string }) => 
      accountService.createAccount(data.name, data.type, data.balance, data.currency),
    onSuccess: (newAccount) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      
      // Optionally update the cache directly
      queryClient.setQueryData<Account[]>(['accounts'], (oldData) => {
        return oldData ? [...oldData, newAccount] : [newAccount];
      });
    }
  });
}

// Similar hooks for other entities...
```

## Optimistic Updates

Implement optimistic updates for better user experience:

```typescript
export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => transactionService.deleteTransaction(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      
      // Snapshot the previous value
      const previousTransactions = queryClient.getQueryData<{ transactions: Transaction[], count: number }>(['transactions']);
      
      // Optimistically update to the new value
      if (previousTransactions) {
        queryClient.setQueryData<{ transactions: Transaction[], count: number }>(['transactions'], {
          transactions: previousTransactions.transactions.filter(t => t.id !== id),
          count: previousTransactions.count - 1
        });
      }
      
      return { previousTransactions };
    },
    onError: (err, id, context) => {
      // If there was an error, restore the previous data
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions'], context.previousTransactions);
      }
      handleApiError(err, 'Failed to delete transaction');
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully',
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
```

## Lazy Loading and Pagination

Implement pagination for large datasets:

```typescript
export function useTransactionsList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['transactions', page, pageSize],
    queryFn: () => transactionService.getTransactions({
      offset: (page - 1) * pageSize,
      limit: pageSize
    }),
    keepPreviousData: true, // Keep the previous data while loading the next page
  });
  
  const totalPages = data ? Math.ceil(data.count / pageSize) : 0;
  
  return {
    transactions: data?.transactions || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    page,
    pageSize,
    totalPages,
    setPage,
    setPageSize,
  };
}

// Usage in a component
function TransactionTable() {
  const {
    transactions,
    totalCount,
    isLoading,
    page,
    totalPages,
    setPage
  } = useTransactionsList();
  
  // Component JSX with pagination controls
}
```

## Conclusion

This document outlines patterns for integrating React components with the backend API. Key approaches include:

1. Service-based API client for consistent API calls
2. React Query for server state management
3. Consistent error handling
4. Form integration with validation
5. Optimistic updates for better UX
6. Pagination for large datasets

These patterns ensure a consistent, maintainable approach to API integration across the application. 