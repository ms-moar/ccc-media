# API Patterns Reference

## Complete Endpoint Implementations

### Express Router Setup

```typescript
// src/routes/transactions.ts
import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { TransactionService } from '../services/transaction.service';

const router = Router();

// Apply auth to all routes
router.use(authenticate);

// GET /api/v1/transactions
router.get('/', validate(listTransactionsSchema, 'query'), async (req, res, next) => {
  try {
    const result = await TransactionService.list({
      userId: req.user.id,
      ...req.query
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/transactions/:id
router.get('/:id', async (req, res, next) => {
  try {
    const transaction = await TransactionService.findById(req.params.id, req.user.id);
    if (!transaction) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Transaction not found' }
      });
    }
    res.json({ data: transaction });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/transactions
router.post('/', validate(createTransactionSchema), async (req, res, next) => {
  try {
    const transaction = await TransactionService.create({
      userId: req.user.id,
      ...req.body
    });
    res.status(201).json({ data: transaction });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/transactions/:id
router.patch('/:id', validate(updateTransactionSchema), async (req, res, next) => {
  try {
    const transaction = await TransactionService.update(
      req.params.id,
      req.user.id,
      req.body
    );
    if (!transaction) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Transaction not found' }
      });
    }
    res.json({ data: transaction });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/transactions/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await TransactionService.softDelete(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Transaction not found' }
      });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
```

---

## Validation Schemas (Zod)

### Transaction Schemas

```typescript
// src/schemas/transaction.schema.ts
import { z } from 'zod';

export const transactionTypeSchema = z.enum(['income', 'expense', 'transfer']);
export const transactionStatusSchema = z.enum(['pending', 'cleared', 'reconciled']);

export const createTransactionSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  type: transactionTypeSchema,
  amount: z.number()
    .int('Amount must be in cents')
    .positive('Amount must be positive'),
  description: z.string().min(1).max(255),
  categoryId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  merchant: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  transferAccountId: z.string().optional()
}).refine(
  (data) => data.type !== 'transfer' || data.transferAccountId,
  { message: 'Transfer requires destination account', path: ['transferAccountId'] }
);

export const updateTransactionSchema = createTransactionSchema.partial();

export const listTransactionsSchema = z.object({
  accountId: z.string().optional(),
  type: transactionTypeSchema.optional(),
  status: transactionStatusSchema.optional(),
  categoryId: z.string().optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  minAmount: z.coerce.number().int().optional(),
  maxAmount: z.coerce.number().int().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional()
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsSchema>;
```

### Account Schemas

```typescript
// src/schemas/account.schema.ts
import { z } from 'zod';

export const accountTypeSchema = z.enum([
  'checking', 'savings', 'credit', 'investment', 'cash', 'loan'
]);

export const currencySchema = z.string()
  .length(3, 'Currency must be ISO 4217 code')
  .toUpperCase()
  .default('USD');

export const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: accountTypeSchema,
  currency: currencySchema,
  initialBalance: z.number().int().default(0),
  institution: z.string().max(100).optional(),
  accountNumber: z.string().max(50).optional(), // Last 4 digits only
  notes: z.string().max(500).optional()
});

export const updateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  institution: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
  isActive: z.boolean().optional()
});
```

### Budget Schemas

```typescript
// src/schemas/budget.schema.ts
import { z } from 'zod';

export const budgetPeriodSchema = z.enum(['weekly', 'monthly', 'yearly']);

export const createBudgetSchema = z.object({
  categoryId: z.string().min(1),
  amount: z.number().int().positive(),
  period: budgetPeriodSchema.default('monthly'),
  alertThreshold: z.number().min(0).max(1).optional(), // 0.8 = 80%
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

export const updateBudgetSchema = z.object({
  amount: z.number().int().positive().optional(),
  alertThreshold: z.number().min(0).max(1).optional(),
  isActive: z.boolean().optional()
});
```

---

## Validation Middleware

```typescript
// src/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req[target]);
      req[target] = data; // Replace with validated/transformed data
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!details[path]) details[path] = [];
          details[path].push(err.message);
        });

        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details
          }
        });
      }
      next(error);
    }
  };
}
```

---

## Error Handling

```typescript
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Custom error classes
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super('FORBIDDEN', message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string, details?: Record<string, string[]>) {
    super('BUSINESS_RULE_VIOLATION', message, 422, details);
  }
}

// Global error handler
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();

  if (error instanceof AppError) {
    logger.warn('Application error', {
      requestId,
      code: error.code,
      message: error.message,
      path: req.path
    });

    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        requestId
      }
    });
  }

  // Unexpected errors
  logger.error('Unexpected error', {
    requestId,
    error: error.message,
    stack: error.stack,
    path: req.path
  });

  // Don't expose internal errors in production
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : error.message;

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message,
      requestId
    }
  });
}
```

---

## Pagination Helper

```typescript
// src/utils/pagination.ts
interface PaginationParams {
  page: number;
  limit: number;
}

interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export async function paginate<T>(
  query: any, // Mongoose query or similar
  params: PaginationParams
): Promise<PaginationResult<T>> {
  const { page, limit } = params;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    query.skip(skip).limit(limit).exec(),
    query.model.countDocuments(query.getQuery())
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages
    }
  };
}

// Cursor-based pagination for large datasets
export async function cursorPaginate<T>(
  query: any,
  cursor: string | undefined,
  limit: number
): Promise<{ data: T[]; nextCursor?: string }> {
  if (cursor) {
    query = query.where('_id').gt(cursor);
  }

  const data = await query.limit(limit + 1).exec();
  const hasMore = data.length > limit;

  if (hasMore) {
    data.pop(); // Remove extra item
  }

  return {
    data,
    nextCursor: hasMore ? data[data.length - 1]._id.toString() : undefined
  };
}
```

---

## OpenAPI Specification Template

```yaml
# openapi.yaml
openapi: 3.0.3
info:
  title: Finance Management API
  version: 1.0.0
  description: API for managing personal and business finances

servers:
  - url: https://api.example.com/v1
    description: Production
  - url: http://localhost:3000/api/v1
    description: Development

security:
  - bearerAuth: []

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Error:
      type: object
      properties:
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
            details:
              type: object
              additionalProperties:
                type: array
                items:
                  type: string
            requestId:
              type: string

    Pagination:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        totalPages:
          type: integer
        hasMore:
          type: boolean

    Account:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        type:
          type: string
          enum: [checking, savings, credit, investment, cash]
        currency:
          type: string
        balance:
          type: integer
          description: Balance in cents
        isActive:
          type: boolean
        createdAt:
          type: string
          format: date-time

    Transaction:
      type: object
      properties:
        id:
          type: string
        accountId:
          type: string
        type:
          type: string
          enum: [income, expense, transfer]
        amount:
          type: integer
          description: Amount in cents (always positive)
        description:
          type: string
        categoryId:
          type: string
        date:
          type: string
          format: date
        status:
          type: string
          enum: [pending, cleared, reconciled]

paths:
  /accounts:
    get:
      summary: List accounts
      tags: [Accounts]
      parameters:
        - name: type
          in: query
          schema:
            type: string
        - name: isActive
          in: query
          schema:
            type: boolean
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Account'
                  pagination:
                    $ref: '#/components/schemas/Pagination'

    post:
      summary: Create account
      tags: [Accounts]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [name, type]
              properties:
                name:
                  type: string
                type:
                  type: string
                currency:
                  type: string
                  default: USD
                initialBalance:
                  type: integer
                  default: 0
      responses:
        '201':
          description: Created
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /transactions:
    get:
      summary: List transactions
      tags: [Transactions]
      parameters:
        - name: accountId
          in: query
          schema:
            type: string
        - name: type
          in: query
          schema:
            type: string
        - name: from
          in: query
          schema:
            type: string
            format: date
        - name: to
          in: query
          schema:
            type: string
            format: date
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Success
```

---

## Rate Limiting

```typescript
// src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config/redis';

// Standard API rate limit
export const apiLimiter = rateLimit({
  store: new RedisStore({ client: redis }),
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict limit for auth endpoints
export const authLimiter = rateLimit({
  store: new RedisStore({ client: redis }),
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 10,                    // 10 attempts per hour
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many authentication attempts'
    }
  }
});

// Reporting endpoints (expensive queries)
export const reportLimiter = rateLimit({
  store: new RedisStore({ client: redis }),
  windowMs: 60 * 1000,       // 1 minute
  max: 10,                    // 10 reports per minute
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Report rate limit exceeded'
    }
  }
});
```

---

## API Versioning

```typescript
// src/app.ts
import express from 'express';
import v1Routes from './routes/v1';
import v2Routes from './routes/v2';

const app = express();

// Version via URL path (recommended)
app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);

// Or via header
app.use('/api', (req, res, next) => {
  const version = req.headers['api-version'] || 'v1';
  req.apiVersion = version;
  next();
});
```

---

## Request ID Middleware

```typescript
// src/middleware/requestId.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = req.headers['x-request-id'] as string || crypto.randomUUID();
  req.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
}

// Add to Express types
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      user?: { id: string; email: string };
      apiVersion?: string;
    }
  }
}
```
