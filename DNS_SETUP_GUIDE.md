# DNS Setup Guide for theabugida.org

This guide explains how to configure DNS records for both your frontend (GitHub Pages) and backend (Railway).

## Current Setup

- **Frontend**: GitHub Pages at `theabugida.org` (via `E1iteCoder.github.io`)
- **Backend**: Railway at `api.theabugida.org` (to be configured)

## DNS Records You Need

### 1. Main Domain (theabugida.org) → GitHub Pages

**For the root domain (`theabugida.org`):**

You have two options:

#### Option A: CNAME Record (if your DNS provider supports it for root domains)
- **Type**: CNAME
- **Name/Host**: `@` or `theabugida.org` (or leave blank for root)
- **Value/Target**: `E1iteCoder.github.io.` (note the trailing dot)
- **TTL**: 3600 (or default)

#### Option B: A Records (if CNAME not supported for root)
- **Type**: A
- **Name/Host**: `@` or `theabugida.org`
- **Value/Target**: GitHub Pages IP addresses:
  ```
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153
  ```
- **TTL**: 3600

**For www subdomain (www.theabugida.org):**
- **Type**: CNAME
- **Name/Host**: `www`
- **Value/Target**: `E1iteCoder.github.io.` (with trailing dot)
- **TTL**: 3600

### 2. API Subdomain (api.theabugida.org) → Railway

**After deploying to Railway:**

- **Type**: CNAME
- **Name/Host**: `api`
- **Value/Target**: `your-railway-url.up.railway.app` (Railway will give you this)
  - Example: `abugida-production.up.railway.app`
  - **Do NOT include the trailing dot** for subdomains
- **TTL**: 3600

## Complete DNS Configuration Example

Here's what your DNS records should look like:

```
Type    Name    Value                          TTL
----    ----    -----                          ---
A       @       185.199.108.153                3600
A       @       185.199.109.153                3600
A       @       185.199.110.153                3600
A       @       185.199.111.153                3600
CNAME   www     E1iteCoder.github.io.          3600
CNAME   api     abugida-production.up.railway.app  3600
```

## Step-by-Step Instructions

### For GitHub Pages (theabugida.org)

1. **Go to your domain registrar** (where you bought theabugida.org)
2. **Find DNS Management** or **DNS Settings**
3. **Add records:**

   **If using CNAME for root:**
   - Type: CNAME
   - Name: `@` (or `theabugida.org`)
   - Value: `E1iteCoder.github.io.` (with trailing dot)
   
   **If using A records (more common):**
   - Type: A
   - Name: `@` (or `theabugida.org`)
   - Value: `185.199.108.153`
   - Repeat for all 4 IPs listed above

4. **Add www subdomain:**
   - Type: CNAME
   - Name: `www`
   - Value: `E1iteCoder.github.io.` (with trailing dot)

5. **In GitHub:**
   - Go to your repository → Settings → Pages
   - Under "Custom domain", enter: `theabugida.org`
   - Check "Enforce HTTPS"

### For Railway (api.theabugida.org)

1. **Deploy to Railway first** (follow RAILWAY_DEPLOYMENT.md)
2. **Get your Railway URL** from Railway dashboard
3. **Add CNAME record:**
   - Type: CNAME
   - Name: `api`
   - Value: `your-railway-url.up.railway.app` (no trailing dot)
   - TTL: 3600

## Important Notes

### Trailing Dots in DNS

- **With trailing dot** (`E1iteCoder.github.io.`): Absolute domain name
- **Without trailing dot** (`api.theabugida.org`): Relative to your domain

**For GitHub Pages CNAME:**
- Use trailing dot: `E1iteCoder.github.io.`

**For Railway CNAME:**
- No trailing dot: `abugida-production.up.railway.app`

### DNS Propagation

- Changes can take 5 minutes to 48 hours
- Usually propagates within 1 hour
- Use tools like `nslookup` or `dig` to check

### Verify DNS

```bash
# Check main domain
nslookup theabugida.org

# Check API subdomain
nslookup api.theabugida.org
```

## Common DNS Providers

### Cloudflare
1. Go to DNS → Records
2. Add records as shown above
3. Make sure proxy is OFF (gray cloud) for custom domains

### Namecheap
1. Go to Domain List → Manage → Advanced DNS
2. Add records in "Host Records" section

### GoDaddy
1. Go to DNS Management
2. Add records in the DNS records table

### Google Domains
1. Go to DNS → Custom records
2. Add records as specified

## Troubleshooting

### "CNAME already exists" error
- You can't have both CNAME and A records for the same name
- For root domain, use A records
- For subdomains, use CNAME

### Domain not working
- Wait for DNS propagation (up to 48 hours)
- Clear browser cache
- Check DNS with `nslookup` or online tools
- Verify GitHub Pages custom domain is set correctly

### API subdomain not working
- Verify Railway deployment is successful
- Check Railway custom domain is configured
- Verify CNAME record points to correct Railway URL
- Wait for DNS propagation

## Summary

- **theabugida.org** → Use `E1iteCoder.github.io.` (with dot) for CNAME, or GitHub's A record IPs
- **api.theabugida.org** → Use your Railway URL (without dot) after deployment

The CNAME file in your repo (`theabugida.org`) is correct and tells GitHub Pages which domain to use. You just need to configure DNS at your registrar to point to GitHub.

