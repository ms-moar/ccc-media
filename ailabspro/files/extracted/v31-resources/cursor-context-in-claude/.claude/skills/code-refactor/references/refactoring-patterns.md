# Refactoring Patterns Reference

## Code Smell Checklist

Use this checklist when analyzing code for refactoring opportunities.

### Functions
- [ ] Function longer than 20 lines
- [ ] More than 3 parameters
- [ ] Nested conditionals (3+ levels deep)
- [ ] Multiple return statements scattered throughout
- [ ] Mixed abstraction levels
- [ ] Side effects in supposedly pure functions
- [ ] Callback hell / deeply nested promises

### Variables & Naming
- [ ] Single-letter variable names (except `i`, `j` in loops)
- [ ] Generic names: `data`, `info`, `temp`, `result`, `value`
- [ ] Inconsistent naming conventions
- [ ] Boolean without `is`/`has`/`can`/`should` prefix
- [ ] Abbreviations that aren't universally understood
- [ ] Hungarian notation or type prefixes

### TypeScript-Specific
- [ ] Using `any` type
- [ ] Non-null assertions (`!`) without clear justification
- [ ] Type casting with `as` when narrowing would work
- [ ] Missing return type annotations on public functions
- [ ] Overly complex union types (5+ members)
- [ ] Object types instead of interfaces

### React-Specific
- [ ] Components over 150 lines
- [ ] Prop drilling through 3+ levels
- [ ] Inline function definitions in JSX
- [ ] Inline object/array literals in JSX props
- [ ] Missing dependency arrays in useEffect/useMemo/useCallback
- [ ] State that could be derived from other state
- [ ] Multiple useState calls that should be combined

### Code Duplication
- [ ] Same logic repeated in multiple places
- [ ] Similar components with only minor differences
- [ ] Copy-pasted code blocks with small variations

---

## Before/After Examples

### Extract Function

**Before:**
```typescript
function processOrder(order: Order) {
  // Validate order
  if (!order.items || order.items.length === 0) {
    throw new Error('Order must have items');
  }
  if (!order.customerId) {
    throw new Error('Order must have customer');
  }
  if (order.total < 0) {
    throw new Error('Total cannot be negative');
  }

  // Calculate discount
  let discount = 0;
  if (order.total > 100) {
    discount = order.total * 0.1;
  } else if (order.total > 50) {
    discount = order.total * 0.05;
  }

  // ... more processing
}
```

**After:**
```typescript
function validateOrder(order: Order): void {
  if (!order.items || order.items.length === 0) {
    throw new Error('Order must have items');
  }
  if (!order.customerId) {
    throw new Error('Order must have customer');
  }
  if (order.total < 0) {
    throw new Error('Total cannot be negative');
  }
}

function calculateDiscount(total: number): number {
  if (total > 100) return total * 0.1;
  if (total > 50) return total * 0.05;
  return 0;
}

function processOrder(order: Order) {
  validateOrder(order);
  const discount = calculateDiscount(order.total);
  // ... more processing
}
```

---

### Replace Conditionals with Early Returns

**Before:**
```typescript
function getDisplayName(user: User | null): string {
  if (user) {
    if (user.profile) {
      if (user.profile.displayName) {
        return user.profile.displayName;
      } else {
        return user.email;
      }
    } else {
      return user.email;
    }
  } else {
    return 'Anonymous';
  }
}
```

**After:**
```typescript
function getDisplayName(user: User | null): string {
  if (!user) return 'Anonymous';
  if (!user.profile?.displayName) return user.email;
  return user.profile.displayName;
}
```

---

### Object Parameter Pattern

**Before:**
```typescript
function createUser(
  name: string,
  email: string,
  age: number,
  role: string,
  department: string,
  isActive: boolean
) {
  // ...
}

createUser('John', 'john@example.com', 30, 'admin', 'engineering', true);
```

**After:**
```typescript
interface CreateUserParams {
  name: string;
  email: string;
  age: number;
  role: string;
  department: string;
  isActive?: boolean;
}

function createUser({ name, email, age, role, department, isActive = true }: CreateUserParams) {
  // ...
}

createUser({
  name: 'John',
  email: 'john@example.com',
  age: 30,
  role: 'admin',
  department: 'engineering',
});
```

---

### Modernize Async Code

**Before:**
```typescript
function fetchUserData(userId: string) {
  return fetch(`/api/users/${userId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      return response.json();
    })
    .then(user => {
      return fetch(`/api/users/${userId}/posts`)
        .then(response => response.json())
        .then(posts => {
          return { user, posts };
        });
    })
    .catch(error => {
      console.error(error);
      throw error;
    });
}
```

**After:**
```typescript
async function fetchUserData(userId: string) {
  try {
    const userResponse = await fetch(`/api/users/${userId}`);
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user');
    }

    const user = await userResponse.json();
    const postsResponse = await fetch(`/api/users/${userId}/posts`);
    const posts = await postsResponse.json();

    return { user, posts };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
```

---

### React Component Optimization

**Before:**
```tsx
function UserList({ users }: { users: User[] }) {
  const [filter, setFilter] = useState('');

  return (
    <div>
      <input onChange={(e) => setFilter(e.target.value)} />
      {users
        .filter(u => u.name.toLowerCase().includes(filter.toLowerCase()))
        .map(user => (
          <UserCard
            key={user.id}
            user={user}
            onClick={() => console.log(user.id)}
            style={{ margin: 10 }}
          />
        ))}
    </div>
  );
}
```

**After:**
```tsx
function UserList({ users }: { users: User[] }) {
  const [filter, setFilter] = useState('');

  const handleFilterChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  }, []);

  const filteredUsers = useMemo(() =>
    users.filter(u => u.name.toLowerCase().includes(filter.toLowerCase())),
    [users, filter]
  );

  return (
    <div>
      <input onChange={handleFilterChange} />
      {filteredUsers.map(user => (
        <MemoizedUserCard key={user.id} user={user} />
      ))}
    </div>
  );
}

const MemoizedUserCard = React.memo(function UserCard({ user }: { user: User }) {
  const handleClick = useCallback(() => {
    console.log(user.id);
  }, [user.id]);

  return <UserCard user={user} onClick={handleClick} />;
});
```

---

### Replace Magic Numbers/Strings

**Before:**
```typescript
if (user.role === 'admin' || user.role === 'super_admin') {
  // allow access
}

if (retryCount > 3) {
  throw new Error('Too many retries');
}

setTimeout(fetchData, 5000);
```

**After:**
```typescript
const ADMIN_ROLES = ['admin', 'super_admin'] as const;
const MAX_RETRY_COUNT = 3;
const REFRESH_INTERVAL_MS = 5000;

if (ADMIN_ROLES.includes(user.role)) {
  // allow access
}

if (retryCount > MAX_RETRY_COUNT) {
  throw new Error('Too many retries');
}

setTimeout(fetchData, REFRESH_INTERVAL_MS);
```

---

### Remove Type Assertions

**Before:**
```typescript
const user = getUser() as User;
const element = document.getElementById('root') as HTMLDivElement;
const data = JSON.parse(response) as UserData;
```

**After:**
```typescript
const user = getUser();
if (!user) throw new Error('User not found');

const element = document.getElementById('root');
if (!(element instanceof HTMLDivElement)) {
  throw new Error('Root element not found');
}

function parseUserData(json: string): UserData {
  const data = JSON.parse(json);
  // Add runtime validation
  if (!isUserData(data)) {
    throw new Error('Invalid user data');
  }
  return data;
}
```

---

## Search Patterns for Common Issues

```bash
# Find any types
grep -rn ": any" --include="*.ts" --include="*.tsx"

# Find non-null assertions
grep -rn "!\." --include="*.ts" --include="*.tsx"

# Find var declarations
grep -rn "\bvar\b" --include="*.ts" --include="*.tsx" --include="*.js"

# Find .then() chains (potential async/await conversion)
grep -rn "\.then(" --include="*.ts" --include="*.tsx"

# Find inline functions in JSX
grep -rn "={() =>" --include="*.tsx"

# Find TODO/FIXME
grep -rn "TODO\|FIXME\|HACK\|XXX" --include="*.ts" --include="*.tsx"

# Find console statements
grep -rn "console\." --include="*.ts" --include="*.tsx"

# Find long files (potential split candidates)
find . -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -n | tail -20
```
