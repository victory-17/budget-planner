# Budget Planner API Endpoints

This document outlines all the API endpoints required for the Budget Planner application's backend. The API is organized around the main resources in the application: authentication, user profiles, accounts, transactions, and budgets.

## Base URL

All API endpoints should be prefixed with:

```
/api/v1
```

## Authentication Endpoints

### User Registration and Authentication

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/auth/signup` | POST | Register new user | `{ email, password, first_name?, last_name? }` | `{ user, session }` |
| `/auth/signin` | POST | Sign in existing user | `{ email, password }` | `{ user, session }` |
| `/auth/signout` | POST | Sign out current user | None | `{ success: true }` |
| `/auth/user` | GET | Get current user info | None | `{ user, profile }` |
| `/auth/refresh` | POST | Refresh JWT token | None | `{ token }` |
| `/auth/reset-password` | POST | Request password reset | `{ email }` | `{ success: true }` |
| `/auth/reset-password/confirm` | POST | Confirm password reset | `{ token, password }` | `{ success: true }` |

## Profile Endpoints

### User Profile Management

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/profiles` | GET | Get current user profile | None | `Profile` |
| `/profiles` | PUT | Update user profile | `{ first_name?, last_name?, avatar_url? }` | `Profile` |

## Account Endpoints

### Financial Accounts Management

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/accounts` | GET | List all accounts for user | None | `Account[]` |
| `/accounts` | POST | Create new account | `{ name, type, balance, currency }` | `Account` |
| `/accounts/:id` | GET | Get single account details | None | `Account` |
| `/accounts/:id` | PUT | Update account details | `{ name?, type?, balance?, currency? }` | `Account` |
| `/accounts/:id` | DELETE | Delete an account | None | `{ success: true }` |
| `/accounts/summary` | GET | Get account summary statistics | None | `{ total_balance, accounts_count, currencies }` |

## Transaction Endpoints

### Financial Transactions Management

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/transactions` | GET | List all transactions | Query params: `{ account_id?, start_date?, end_date?, type?, category?, limit?, offset? }` | `{ transactions: Transaction[], count: number }` |
| `/transactions` | POST | Create new transaction | `{ account_id, amount, type, category, description?, date }` | `Transaction` |
| `/transactions/:id` | GET | Get single transaction | None | `Transaction` |
| `/transactions/:id` | PUT | Update transaction | `{ account_id?, amount?, type?, category?, description?, date? }` | `Transaction` |
| `/transactions/:id` | DELETE | Delete transaction | None | `{ success: true }` |
| `/transactions/summary` | GET | Get transaction summary stats | Query params: `{ start_date?, end_date? }` | `{ income_total, expense_total, net, categories: { category, amount }[] }` |
| `/transactions/categories` | GET | Get all transaction categories | None | `{ income: string[], expense: string[] }` |

## Budget Endpoints

### Budget Management

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/budgets` | GET | List all budgets | Query params: `{ period? }` | `Budget[]` |
| `/budgets` | POST | Create new budget | `{ category, amount, period }` | `Budget` |
| `/budgets/:id` | GET | Get single budget | None | `Budget` |
| `/budgets/:id` | PUT | Update budget | `{ category?, amount?, period? }` | `Budget` |
| `/budgets/:id` | DELETE | Delete budget | None | `{ success: true }` |
| `/budgets/summary` | GET | Get budget summary | Query params: `{ period? }` | `{ total_budget, total_spent, remaining, categories: { category, budget, spent, remaining }[] }` |
| `/budgets/categories` | GET | Get all budget categories | None | `string[]` |

## Report Endpoints

### Financial Reports

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/reports/spending` | GET | Get spending report | Query params: `{ start_date, end_date, group_by? }` | `{ categories: { name, amount }[], timeline: { date, amount }[] }` |
| `/reports/income` | GET | Get income report | Query params: `{ start_date, end_date, group_by? }` | `{ categories: { name, amount }[], timeline: { date, amount }[] }` |
| `/reports/budget-performance` | GET | Get budget performance | Query params: `{ period? }` | `{ categories: { name, budget, actual, performance }[] }` |
| `/reports/net-worth` | GET | Get net worth timeline | Query params: `{ start_date, end_date }` | `{ timeline: { date, amount }[] }` |

## Settings Endpoints

### User Preferences and Settings

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/settings` | GET | Get user settings | None | `Settings` |
| `/settings` | PUT | Update user settings | `{ currency?, theme?, notification_preferences? }` | `Settings` |
| `/settings/export` | GET | Export user data | Query params: `{ format? }` | File download |

## Data Structures

### Account
```
{
  id: string
  user_id: string
  name: string
  type: string
  balance: number
  currency: string
  created_at: string
  updated_at: string | null
}
```

### Transaction
```
{
  id: string
  user_id: string
  account_id: string
  amount: number
  type: string
  category: string
  description: string | null
  date: string
  created_at: string
}
```

### Budget
```
{
  id: string
  user_id: string
  category: string
  amount: number
  period: string
  created_at: string
  updated_at: string | null
}
```

### Profile
```
{
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string | null
}
```

## Error Responses

All endpoints follow a consistent error response format:

```
{
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error 