---
name: security-check
description: This skill should be used when performing security audits, reviewing code for vulnerabilities, or checking for security issues. It triggers automatically when the user asks to find security problems, audit code security, check for vulnerabilities, or review authentication/authorization. Covers OWASP Top 10, secrets detection, dependency vulnerabilities, XSS, SQL injection, CSRF, and secure coding patterns.
---

# Security Check

## Overview

Perform comprehensive security audits on codebases to identify vulnerabilities, insecure patterns, and potential attack vectors. Apply OWASP guidelines and security best practices systematically.

## When This Skill Triggers

- User asks to "security check", "audit", or "review security"
- Requests to find vulnerabilities or security issues
- Code review with security focus
- Questions about authentication, authorization, or data protection
- Checking for secrets, credentials, or sensitive data exposure

## Security Audit Workflow

### Step 1: Scope Assessment

Determine audit scope:

1. Identify entry points (APIs, forms, file uploads)
2. Map authentication/authorization boundaries
3. List external dependencies and integrations
4. Note sensitive data flows (PII, credentials, tokens)

### Step 2: Automated Checks

Run quick scans first:

```bash
# Find hardcoded secrets
grep -rn "password\s*=\|secret\s*=\|api_key\s*=\|apiKey\s*=" --include="*.ts" --include="*.js" --include="*.env*"

# Find potential SQL injection
grep -rn "query(\`\|execute(\`\|raw(\`" --include="*.ts" --include="*.js"

# Find eval/dangerous functions
grep -rn "eval(\|Function(\|setTimeout(\s*['\"\`]" --include="*.ts" --include="*.js"

# Check for console.log with sensitive data
grep -rn "console.log.*password\|console.log.*token\|console.log.*secret" --include="*.ts" --include="*.js"

# Find innerHTML usage (XSS risk)
grep -rn "innerHTML\|dangerouslySetInnerHTML" --include="*.ts" --include="*.tsx" --include="*.js"
```

### Step 3: Manual Review

Check each category in `references/security-checklist.md`:

1. **Critical**: Authentication, injection, secrets
2. **High**: Authorization, XSS, CSRF
3. **Medium**: Headers, logging, error handling
4. **Low**: Best practices, hardening

### Step 4: Report Findings

Present findings with severity:

```
## Security Audit Report: [scope]

### Critical Issues
- [Issue]: [Location] - [Impact] - [Remediation]

### High Severity
- [Issue]: [Location] - [Impact] - [Remediation]

### Medium Severity
- [Issue]: [Location] - [Impact] - [Remediation]

### Recommendations
1. [Priority action]
2. [Secondary action]
```

## Quick Vulnerability Reference

### Injection Attacks

**SQL Injection**
```typescript
// VULNERABLE
const query = `SELECT * FROM users WHERE id = ${userId}`;

// SECURE
const query = 'SELECT * FROM users WHERE id = $1';
await db.query(query, [userId]);
```

**Command Injection**
```typescript
// VULNERABLE
exec(`ls ${userInput}`);

// SECURE
execFile('ls', [sanitizedPath]);
```

### Cross-Site Scripting (XSS)

**DOM XSS**
```typescript
// VULNERABLE
element.innerHTML = userInput;

// SECURE
element.textContent = userInput;
// Or use DOMPurify for HTML
element.innerHTML = DOMPurify.sanitize(userInput);
```

**React XSS**
```tsx
// VULNERABLE
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// SECURE
<div>{userInput}</div>
// Or sanitize if HTML needed
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### Authentication Issues

**Session Management**
- Use secure, httpOnly, sameSite cookies
- Implement proper session expiration
- Regenerate session ID after login

**Password Handling**
```typescript
// VULNERABLE
const hash = md5(password);

// SECURE
const hash = await bcrypt.hash(password, 12);
```

### Authorization Flaws

**Broken Access Control**
```typescript
// VULNERABLE - No ownership check
app.get('/api/documents/:id', async (req, res) => {
  const doc = await Document.findById(req.params.id);
  res.json(doc);
});

// SECURE
app.get('/api/documents/:id', async (req, res) => {
  const doc = await Document.findOne({
    _id: req.params.id,
    userId: req.user.id  // Ownership check
  });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc);
});
```

### Secrets Exposure

**Environment Variables**
```typescript
// VULNERABLE - Hardcoded
const API_KEY = 'sk-1234567890abcdef';

// SECURE
const API_KEY = process.env.API_KEY;
if (!API_KEY) throw new Error('API_KEY not configured');
```

**Git Safety**
```gitignore
# .gitignore must include
.env
.env.*
*.pem
*.key
credentials.json
```

## Search Patterns for Common Vulnerabilities

```bash
# Secrets in code
grep -rn "Bearer \|sk-\|pk_live\|sk_live\|aws_secret\|AKIA" --include="*.ts" --include="*.js"

# Weak crypto
grep -rn "md5\|sha1\|createCipher(" --include="*.ts" --include="*.js"

# Insecure randomness
grep -rn "Math.random()" --include="*.ts" --include="*.js"

# Missing input validation
grep -rn "req.body\.\|req.query\.\|req.params\." --include="*.ts" --include="*.js"

# Prototype pollution risk
grep -rn "Object.assign\|\.\.\.req.body\|merge(" --include="*.ts" --include="*.js"

# CORS misconfig
grep -rn "origin:\s*['\"]\\*['\"]\\|Access-Control-Allow-Origin.*\\*" --include="*.ts" --include="*.js"
```

## Resources

Detailed security checklist and vulnerability patterns are in `references/security-checklist.md`. Consult for:

- Complete OWASP Top 10 coverage
- Language-specific vulnerability patterns
- Secure coding examples
- Security header configurations
