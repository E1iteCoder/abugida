# Security Fixes for CodeQL Alerts

This document describes the security fixes applied to resolve CodeQL alerts.

## Issues Fixed

### 1. Missing Rate Limiting (6 instances - HIGH severity)
**Location:** `src/server/routes/auth.js` (lines 9, 81, 136, 159)

**Problem:** Authentication routes were vulnerable to brute force attacks without rate limiting.

**Solution:**
- Installed `express-rate-limit` package
- Created rate limiting middleware (`src/server/middleware/rateLimiter.js`)
- Applied `authLimiter` to `/register`, `/login`, and `/me` routes (5 requests per 15 minutes)
- Applied `preferencesLimiter` to `/preferences` route (20 requests per 15 minutes)

**Files Changed:**
- `package.json` - Added `express-rate-limit` dependency
- `src/server/middleware/rateLimiter.js` - New rate limiting middleware
- `src/server/routes/auth.js` - Applied rate limiters to all routes

### 2. Database Query Built from User-Controlled Sources (4 instances - HIGH severity)
**Location:** `src/server/routes/auth.js` (lines 28, 34, 97, 99)

**Problem:** User inputs were used directly in database queries without sanitization, potentially allowing injection attacks.

**Solution:**
- Created sanitization utility (`src/server/utils/sanitize.js`)
- Added `sanitizeUsername()` function to validate and sanitize usernames
- Added `sanitizeEmail()` function to validate and sanitize email addresses
- Updated all database queries to use sanitized values instead of raw user input

**Files Changed:**
- `src/server/utils/sanitize.js` - New sanitization utility
- `src/server/routes/auth.js` - All queries now use sanitized inputs

## Implementation Details

### Rate Limiting Configuration

```javascript
// Authentication routes (login, register, /me)
authLimiter: 5 requests per 15 minutes per IP

// Preference updates
preferencesLimiter: 20 requests per 15 minutes per IP
```

### Sanitization Functions

1. **sanitizeUsername()**
   - Validates format: alphanumeric and underscores only
   - Validates length: 3-30 characters
   - Returns null if invalid

2. **sanitizeEmail()**
   - Validates email format using regex
   - Converts to lowercase
   - Validates length (max 320 characters)
   - Returns null if invalid

## Testing

After applying these fixes:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Test rate limiting:**
   - Try making more than 5 requests to `/api/auth/login` within 15 minutes
   - Should receive 429 (Too Many Requests) error after limit

3. **Test sanitization:**
   - Try registering with invalid username/email formats
   - Should receive 400 (Bad Request) with validation error

4. **Verify CodeQL alerts:**
   - Push changes to GitHub
   - Wait for CodeQL analysis to complete
   - All 10 alerts should be resolved

## Security Benefits

1. **Brute Force Protection:** Rate limiting prevents attackers from trying multiple password combinations
2. **Injection Prevention:** Input sanitization prevents NoSQL injection attacks
3. **Input Validation:** All user inputs are validated before database operations
4. **Better Error Handling:** Clear error messages without exposing system details

## Notes

- Rate limiting is based on IP address
- In production behind a proxy (like Railway/Cloudflare), ensure `trust proxy` is enabled
- Sanitization happens before any database operations
- All validation errors return 400 status codes with clear messages

