# VPS Deployment Guide for theabugida.org Backend

This guide walks you through migrating your backend from Railway to a VPS with a static IP for secure MongoDB Atlas access.

## Table of Contents
1. [VPS Provider Selection](#vps-provider-selection)
2. [VPS Setup](#vps-setup)
3. [Server Configuration](#server-configuration)
4. [Deploying Your Backend](#deploying-your-backend)
5. [MongoDB Atlas Configuration](#mongodb-atlas-configuration)
6. [Domain & SSL Setup](#domain--ssl-setup)
7. [Process Management](#process-management)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## VPS Provider Selection

### Recommended Providers (with static IPs included):

1. **Hetzner** (€4-6/month) - Best value, EU-based
   - 2GB RAM, 1 vCPU, 20GB SSD
   - Static IP included
   - Great performance

2. **DigitalOcean** ($6/month) - Popular, US-based
   - 1GB RAM, 1 vCPU, 25GB SSD
   - Static IP included
   - Good documentation

3. **Linode** ($5/month) - Reliable, global
   - 1GB RAM, 1 vCPU, 25GB SSD
   - Static IP included

4. **Vultr** ($6/month) - Fast, global
   - 1GB RAM, 1 vCPU, 25GB SSD
   - Static IP included

**Recommendation**: Start with Hetzner (best value) or DigitalOcean (easiest setup).

---

## VPS Setup

### Step 1: Create VPS Instance

1. Sign up for your chosen provider
2. Create a new VPS/droplet:
   - **OS**: Ubuntu 22.04 LTS (recommended)
   - **Size**: 1GB RAM minimum (2GB recommended)
   - **Region**: Choose closest to your users
   - **SSH Key**: Add your public SSH key (recommended) or use password

### Step 2: Get Your Static IP Address

After creating the VPS, you'll see the IP address in your dashboard. **Write this down** - you'll need it for MongoDB Atlas.

Example: `123.45.67.89`

### Step 3: Connect to Your VPS

```bash
ssh root@YOUR_VPS_IP
# or if using a user:
ssh your-username@YOUR_VPS_IP
```

---

## Server Configuration

### Step 1: Update System

```bash
apt update && apt upgrade -y
```

### Step 2: Install Node.js 18

```bash
# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version
```

### Step 3: Install Git

```bash
apt install -y git
```

### Step 4: Install PM2 (Process Manager)

```bash
npm install -g pm2
```

### Step 5: Install Nginx (Reverse Proxy)

```bash
apt install -y nginx
```

### Step 6: Configure Firewall

```bash
# Allow SSH, HTTP, HTTPS
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable

# Check status
ufw status
```

---

## Deploying Your Backend

### Step 1: Clone Your Repository

```bash
# Create app directory
mkdir -p /var/www
cd /var/www

# Clone your repository
git clone https://github.com/E1iteCoder/abugida.git
cd abugida
```

### Step 2: Install Dependencies

```bash
# Install only production dependencies
npm ci --only=production
```

### Step 3: Create Environment File

```bash
# Create .env file
nano .env
```

Add the following (replace with your actual values):

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/abugida
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random-and-long
```

**Important**: 
- Use a strong, random `JWT_SECRET` (at least 32 characters)
- Never commit `.env` to git

Save and exit (Ctrl+X, then Y, then Enter).

### Step 4: Test the Server

```bash
# Test if server starts
npm run server
```

If it works, stop it (Ctrl+C) and proceed.

### Step 5: Start with PM2

```bash
# Start the server with PM2
pm2 start src/server/server.js --name abugida-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions it prints
```

### Step 6: Check PM2 Status

```bash
pm2 status
pm2 logs abugida-backend
```

---

## MongoDB Atlas Configuration

### Step 1: Get Your VPS Static IP

Your VPS IP should be visible in your provider's dashboard. It looks like: `123.45.67.89`

### Step 2: Add IP to MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to **Network Access** → **IP Access List**
3. Click **"+ ADD IP ADDRESS"**
4. Enter:
   - **IP Address**: `YOUR_VPS_IP/32` (e.g., `123.45.67.89/32`)
   - **Comment**: "VPS Production Server"
5. Click **"Confirm"**

### Step 3: Remove Old IPs (Optional)

- Remove `0.0.0.0/0` if it exists
- Keep your local development IP (`104.181.159.42/32`) if you need local access
- Remove any Railway IPs if you're fully migrated

### Step 4: Test Connection

On your VPS, test the MongoDB connection:

```bash
# Check PM2 logs
pm2 logs abugida-backend

# You should see: "MongoDB connected successfully"
```

---

## Domain & SSL Setup

### Step 1: Point Domain to VPS

In your domain registrar (Namecheap):

1. Go to **Advanced DNS**
2. Add/Update A Record:
   - **Type**: A Record
   - **Host**: `api` (or `@` for root)
   - **Value**: `YOUR_VPS_IP`
   - **TTL**: Automatic

This creates: `api.theabugida.org` → `YOUR_VPS_IP`

### Step 2: Configure Nginx Reverse Proxy

```bash
# Create Nginx config
nano /etc/nginx/sites-available/abugida-backend
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name api.theabugida.org;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
# Create symlink
ln -s /etc/nginx/sites-available/abugida-backend /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

### Step 3: Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d api.theabugida.org

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

Certbot will automatically:
- Get the certificate
- Update Nginx config
- Set up auto-renewal

### Step 4: Update Frontend API URL

Update your frontend to point to the new backend:

1. In your GitHub repository, update the API URL
2. Or set environment variable in GitHub Pages (if supported)

The frontend should use: `https://api.theabugida.org/api`

---

## Process Management

### PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs abugida-backend

# Restart
pm2 restart abugida-backend

# Stop
pm2 stop abugida-backend

# Delete
pm2 delete abugida-backend

# Monitor
pm2 monit
```

### Updating Your Backend

```bash
cd /var/www/abugida
git pull origin main
npm ci --only=production
pm2 restart abugida-backend
```

---

## Monitoring & Maintenance

### Check Server Status

```bash
# Server resources
htop  # or: top

# Disk space
df -h

# PM2 status
pm2 status
```

### View Logs

```bash
# Application logs
pm2 logs abugida-backend

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Backup Strategy

1. **Database**: MongoDB Atlas handles backups automatically
2. **Code**: Already in Git
3. **Environment**: Keep `.env` backed up securely (password manager)

### Security Checklist

- ✅ Firewall configured (UFW)
- ✅ SSH key authentication (disable password auth)
- ✅ SSL certificate installed
- ✅ MongoDB Atlas IP whitelist restricted
- ✅ Strong JWT_SECRET
- ✅ Regular system updates

---

## Troubleshooting

### Server Won't Start

```bash
# Check logs
pm2 logs abugida-backend

# Check if port is in use
netstat -tulpn | grep 5000

# Test manually
cd /var/www/abugida
node src/server/server.js
```

### MongoDB Connection Issues

1. Verify IP is whitelisted in MongoDB Atlas
2. Check connection string in `.env`
3. Test from VPS: `curl https://api.theabugida.org/api/health`

### Nginx Issues

```bash
# Test configuration
nginx -t

# Check error logs
tail -f /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

### SSL Certificate Issues

```bash
# Renew certificate manually
certbot renew

# Check certificate status
certbot certificates
```

---

## Cost Comparison

| Service | Cost/Month | Static IP | Notes |
|---------|-----------|------------|-------|
| Railway (Free) | $0 | ❌ Dynamic | Not suitable for production |
| Railway (Pro) | $20 | ✅ Static | Expensive for small sites |
| Hetzner VPS | €4-6 | ✅ Static | Best value |
| DigitalOcean | $6 | ✅ Static | Easy setup |
| Linode | $5 | ✅ Static | Reliable |

**Savings**: ~$14-16/month vs Railway Pro, with better security!

---

## Next Steps

1. ✅ Set up VPS
2. ✅ Deploy backend
3. ✅ Configure MongoDB Atlas IP whitelist
4. ✅ Set up domain & SSL
5. ✅ Update frontend API URL
6. ✅ Test everything
7. ✅ Remove Railway deployment (after confirming VPS works)

---

## Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs abugida-backend`
2. Check Nginx logs: `tail -f /var/log/nginx/error.log`
3. Verify MongoDB Atlas IP whitelist
4. Test API endpoint: `curl https://api.theabugida.org/api/health`

