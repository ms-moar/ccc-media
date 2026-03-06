---
name: api-design
description: This skill should be used when designing, implementing, or reviewing REST APIs for finance applications. It triggers automatically when the user asks to create endpoints, design API structure, implement CRUD operations, or build financial data APIs. Covers RESTful conventions, finance-specific endpoints (accounts, transactions, budgets), authentication, error handling, pagination, and OpenAPI documentation.
---

# API Design

## Overview

Design and implement RESTful APIs for finance management applications following industry best practices. Provides patterns for accounts, transactions, budgets, categories, and reporting endpoints with proper authentication, validation, and error handling.

## When This Skill Triggers

- User asks to "design API", "create endpoints", or "build REST API"
- Implementing CRUD operations for financial entities
- Questions about API structure, versioning, or conventions
- Creating OpenAPI/Swagger documentation
- Reviewing or refactoring existing API code

## API Design Workflow

### Step 1: Identify Resources

Map business entities to REST resources:

| Entity | Resource | Example |
|--------|----------|---------|
| Bank Account | `/accounts` | Checking, Savings, Credit |
| Transaction | `/transactions` | Income, Expense, Transfer |
| Category | `/categories` | Food, Utilities, Salary |
| Budget | `/budgets` | Monthly spending limits |
| Report | `/reports` | Summaries, analytics |

### Step 2: Define Endpoints

Follow RESTful conventions:

```
GET    /api/v1/{resource}          List (with pagination)
POST   /api/v1/{resource}          Create
GET    /api/v1/{resource}/:id      Read single
PUT    /api/v1/{resource}/:id      Full update
PATCH  /api/v1/{resource}/:id      Partial update
DELETE /api/v1/{resource}/:id      Delete (soft-delete for finance)
```

### Step 3: Implement with Standards

Apply patterns from `references/api-patterns.md` for:
- Request/response schemas
- Error handling
- Pagination & filtering
- Authentication

## Finance API Quick Reference

### Accounts Endpoint

```typescript
// GET /api/v1/accounts
interface AccountsResponse {
  data: Account[];
  pagination: Pagination;
}

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
  currency: string;          // ISO 4217 (USD, EUR)
  balance: number;           // Current balance in cents
  availableBalance: number;  // Available to spend
  institution?: string;
  isActive: boolean;
  createdAt: string;         // ISO 8601
  updatedAt: string;
}

// POST /api/v1/accounts
interface CreateAccountRequest {
  name: string;
  type: Account['type'];
  currency?: string;         // Default: USD
  initialBalance?: number;   // In cents
  institution?: string;
}
```

### Transactions Endpoint

```typescript
// GET /api/v1/transactions?accountId=xxx&from=2024-01-01&to=2024-01-31
interface TransactionsResponse {
  data: Transaction[];
  pagination: Pagination;
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netChange: number;
  };
}

interface Transaction {
  id: string;
  accountId: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;            // Always positive, in cents
  currency: string;
  description: string;
  categoryId?: string;
  date: string;              // ISO 8601 date
  status: 'pending' | 'cleared' | 'reconciled';

  // For transfers
  transferAccountId?: string;

  // Metadata
  merchant?: string;
  notes?: string;
  tags?: string[];
  attachments?: string[];    // Receipt URLs

  createdAt: string;
  updatedAt: string;
}

// POST /api/v1/transactions
interface CreateTransactionRequest {
  accountId: string;
  type: Transaction['type'];
  amount: number;
  description: string;
  categoryId?: string;
  date?: string;             // Default: today
  merchant?: string;
  notes?: string;
  tags?: string[];
  transferAccountId?: string; // Required for transfers
}
```

### Budgets Endpoint

```typescript
// GET /api/v1/budgets?month=2024-01
interface BudgetsResponse {
  data: Budget[];
  summary: {
    totalBudgeted: number;
    totalSpent: number;
    remaining: number;
  };
}

interface Budget {
  id: string;
  categoryId: string;
  amount: number;            // Monthly limit in cents
  spent: number;             // Current month spending
  remaining: number;
  period: 'monthly' | 'weekly' | 'yearly';
  alertThreshold?: number;   // Percentage (0.8 = 80%)
  isActive: boolean;
}
```

## Standard Patterns

### Pagination

```typescript
// Request: GET /api/v1/transactions?page=2&limit=20
// Or cursor-based: ?cursor=abc123&limit=20

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  nextCursor?: string;       // For cursor-based
}
```

### Filtering & Sorting

```typescript
// GET /api/v1/transactions?
//   accountId=acc_123&
//   type=expense&
//   from=2024-01-01&
//   to=2024-01-31&
//   minAmount=1000&
//   maxAmount=50000&
//   categoryId=cat_456&
//   sort=-date,amount       // - prefix = descending
```

### Error Response

```typescript
interface ApiError {
  error: {
    code: string;            // Machine-readable
    message: string;         // Human-readable
    details?: Record<string, string[]>;  // Field errors
    requestId: string;       // For debugging
  };
}

// Example
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "amount": ["Amount must be positive"],
      "accountId": ["Account not found"]
    },
    "requestId": "req_abc123"
  }
}
```

### HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 422 | Unprocessable (business rule) |
| 429 | Rate limited |
| 500 | Server error |

## Authentication Pattern

```typescript
// All endpoints require Authorization header
// Authorization: Bearer <jwt_token>

// Middleware
async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Missing token' }
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
    });
  }
}

// All queries must filter by userId
const accounts = await Account.find({ userId: req.user.id });
```

## Money Handling Rules

1. **Store in cents** - Avoid floating point: `$10.50` → `1050`
2. **Use integers** - Never use float/double for money
3. **Include currency** - Always store ISO 4217 code
4. **Calculate server-side** - Never trust client calculations
5. **Validate ranges** - Ensure amounts are positive where required

```typescript
// Utility functions
const toCents = (dollars: number): number => Math.round(dollars * 100);
const toDollars = (cents: number): number => cents / 100;
const formatMoney = (cents: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(toDollars(cents));
};
```

## Resources

Detailed API patterns, OpenAPI templates, and implementation examples are in `references/api-patterns.md`. Consult for:

- Complete endpoint implementations
- Validation schemas (Zod/Joi)
- OpenAPI specification templates
- Rate limiting configuration
- Versioning strategies
