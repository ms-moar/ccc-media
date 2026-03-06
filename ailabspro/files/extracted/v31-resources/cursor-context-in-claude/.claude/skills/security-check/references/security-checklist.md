# Security Checklist Reference

## OWASP Top 10 (2021) Checklist

### A01: Broken Access Control

- [ ] Verify authorization on every request (not just UI hiding)
- [ ] Check resource ownership before returning data
- [ ] Deny by default for all protected resources
- [ ] Disable directory listing
- [ ] Log access control failures
- [ ] Rate limit API access
- [ ] Invalidate sessions on logout
- [ ] Use short-lived JWT tokens

**Search patterns:**
```bash
# Find routes without auth middleware
grep -rn "app.get\|app.post\|app.put\|app.delete" --include="*.ts" | grep -v "auth\|protect\|verify"

# Find direct object references
grep -rn "findById\|findOne.*params\." --include="*.ts"
```

---

### A02: Cryptographic Failures

- [ ] No sensitive data in URLs or query strings
- [ ] Use TLS 1.2+ for all connections
- [ ] No weak algorithms (MD5, SHA1, DES, RC4)
- [ ] Use bcrypt/scrypt/argon2 for passwords (cost factor 12+)
- [ ] Generate keys with cryptographically secure randomness
- [ ] Encrypt sensitive data at rest
- [ ] Proper key management (rotation, storage)

**Weak crypto patterns:**
```bash
# Find weak hashing
grep -rn "md5\|sha1\|createHash.*md5\|createHash.*sha1" --include="*.ts" --include="*.js"

# Find insecure random
grep -rn "Math.random\|Math.floor.*Math.random" --include="*.ts" --include="*.js"
```

**Secure alternatives:**
```typescript
// Password hashing
import bcrypt from 'bcrypt';
const hash = await bcrypt.hash(password, 12);

// Secure random
import crypto from 'crypto';
const token = crypto.randomBytes(32).toString('hex');
const uuid = crypto.randomUUID();
```

---

### A03: Injection

#### SQL Injection
- [ ] Use parameterized queries exclusively
- [ ] No string concatenation in queries
- [ ] Validate/sanitize input types
- [ ] Use ORM with proper escaping

```bash
# Find SQL injection risks
grep -rn "query(\`\|execute(\`\|\${\|\" +\|' +" --include="*.ts" | grep -i "select\|insert\|update\|delete"
```

#### Command Injection
- [ ] Avoid shell execution with user input
- [ ] Use execFile instead of exec
- [ ] Whitelist allowed commands/arguments

```bash
# Find command injection risks
grep -rn "exec(\|spawn(\|execSync(" --include="*.ts" --include="*.js"
```

#### NoSQL Injection
- [ ] Validate input types strictly
- [ ] Avoid $where with user input
- [ ] Sanitize query operators

```bash
# Find NoSQL injection risks
grep -rn "\$where\|\$regex.*req\." --include="*.ts"
```

---

### A04: Insecure Design

- [ ] Threat modeling performed
- [ ] Security requirements defined
- [ ] Rate limiting on sensitive operations
- [ ] Account lockout after failed attempts
- [ ] Secure password reset flow
- [ ] No security through obscurity

---

### A05: Security Misconfiguration

#### HTTP Headers
- [ ] Content-Security-Policy configured
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY or SAMEORIGIN
- [ ] Strict-Transport-Security enabled
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Referrer-Policy configured

**Recommended headers:**
```typescript
// Express with helmet
import helmet from 'helmet';
app.use(helmet());

// Manual configuration
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
```

#### CORS Configuration
- [ ] No wildcard (*) origin in production
- [ ] Whitelist specific domains
- [ ] Restrict allowed methods
- [ ] Credentials require specific origin

```bash
# Find CORS misconfig
grep -rn "origin.*\*\|Access-Control-Allow-Origin.*\*" --include="*.ts" --include="*.js"
```

#### Error Handling
- [ ] No stack traces in production
- [ ] Generic error messages to users
- [ ] Detailed logging server-side only

---

### A06: Vulnerable Components

- [ ] Run `npm audit` regularly
- [ ] Update dependencies promptly
- [ ] Remove unused dependencies
- [ ] Monitor security advisories
- [ ] Use lockfiles (package-lock.json)

**Dependency checks:**
```bash
# Check for vulnerabilities
npm audit

# Check for outdated packages
npm outdated

# Find unused dependencies
npx depcheck
```

---

### A07: Authentication Failures

#### Password Requirements
- [ ] Minimum 8 characters (12+ recommended)
- [ ] Check against breached password lists
- [ ] No password composition rules (reduces entropy)
- [ ] Allow paste in password fields

#### Session Management
- [ ] Secure cookie flags (Secure, HttpOnly, SameSite)
- [ ] Session regeneration after authentication
- [ ] Absolute session timeout
- [ ] Idle session timeout

```typescript
// Secure cookie configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    secure: true,        // HTTPS only
    httpOnly: true,      // No JS access
    sameSite: 'strict',  // CSRF protection
    maxAge: 3600000      // 1 hour
  },
  resave: false,
  saveUninitialized: false
}));
```

#### Multi-Factor Authentication
- [ ] MFA available for sensitive accounts
- [ ] Backup codes provided
- [ ] Rate limit MFA attempts

---

### A08: Software and Data Integrity

- [ ] Verify integrity of dependencies (lockfiles)
- [ ] Use Subresource Integrity for CDN scripts
- [ ] Sign and verify artifacts
- [ ] Secure CI/CD pipeline

```html
<!-- Subresource Integrity -->
<script src="https://cdn.example.com/lib.js"
        integrity="sha384-..."
        crossorigin="anonymous"></script>
```

---

### A09: Logging and Monitoring

#### What to Log
- [ ] Authentication attempts (success/failure)
- [ ] Authorization failures
- [ ] Input validation failures
- [ ] Application errors
- [ ] High-value transactions

#### What NOT to Log
- [ ] Passwords or credentials
- [ ] Session tokens
- [ ] PII without masking
- [ ] Full credit card numbers

```typescript
// Safe logging example
logger.info('Login attempt', {
  userId: user.id,
  email: maskEmail(user.email),  // j***@example.com
  ip: req.ip,
  success: false,
  reason: 'invalid_password'
});
```

---

### A10: Server-Side Request Forgery (SSRF)

- [ ] Validate and sanitize URLs
- [ ] Use allowlists for external services
- [ ] Block requests to internal networks
- [ ] Disable unnecessary URL schemes

```typescript
// SSRF protection
const ALLOWED_HOSTS = ['api.example.com', 'cdn.example.com'];

function isAllowedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return ALLOWED_HOSTS.includes(url.hostname) &&
           ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}
```

---

## Additional Security Checks

### Secrets Management

```bash
# Find hardcoded secrets
grep -rn "password\s*=\s*['\"]" --include="*.ts" --include="*.js"
grep -rn "api_key\|apiKey\|API_KEY\s*=\s*['\"]" --include="*.ts" --include="*.js"
grep -rn "secret\s*=\s*['\"]" --include="*.ts" --include="*.js"
grep -rn "Bearer \|sk-\|pk_live\|sk_live" --include="*.ts" --include="*.js"
grep -rn "AKIA[A-Z0-9]{16}" --include="*.ts" --include="*.js"  # AWS keys

# Check .gitignore
cat .gitignore | grep -E "\.env|secret|credential|\.pem|\.key"
```

### Input Validation

- [ ] Validate all input on server side
- [ ] Use allowlists over denylists
- [ ] Validate data types strictly
- [ ] Limit input length
- [ ] Sanitize output for context

```typescript
// Input validation with zod
import { z } from 'zod';

const UserInput = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150)
});

// Validate
const result = UserInput.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({ errors: result.error.issues });
}
```

### File Upload Security

- [ ] Validate file types by content, not extension
- [ ] Limit file size
- [ ] Store outside webroot
- [ ] Rename uploaded files
- [ ] Scan for malware

```typescript
// Secure file upload
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const upload = multer({
  storage: multer.diskStorage({
    destination: '/secure/uploads/',  // Outside webroot
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = crypto.randomBytes(16).toString('hex');
      cb(null, `${name}${ext}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  }
});
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,
  message: 'Too many requests'
});

// Strict limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,
  message: 'Too many login attempts'
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
```
