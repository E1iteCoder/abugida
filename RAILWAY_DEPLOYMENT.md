# Railway Backend Deployment Guide

This guide will walk you through deploying your Express.js backend to Railway and connecting it to `api.theabugida.org`.

## Prerequisites

- Railway account (sign up at https://railway.app - free tier available)
- GitHub account (your code is already on GitHub)
- MongoDB Atlas account (already set up)

## Step 1: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub (recommended - easier integration)
3. Complete the setup

## Step 2: Create New Project

1. Click **"New Project"** in Railway dashboard
2. Select **"Deploy from GitHub repo"**
3. Choose your `abugida` repository
4. Railway will detect it's a Node.js project

## Step 3: Configure the Service

### 3.1 Set Root Directory (if needed)

Railway should auto-detect, but if it doesn't:
1. Go to **Settings** → **Root Directory**
2. Leave it as root (`.`)

### 3.2 Configure Start Command

1. Go to **Settings** → **Deploy**
2. Set **Start Command** to:
   ```
   node src/server/server.js
   ```
   Or Railway might auto-detect from `package.json`

### 3.3 Set Build Command (optional)

Railway will automatically run `npm install`, but you can verify:
- **Build Command**: Leave empty (Railway handles it)
- Or set to: `npm install`

## Step 4: Set Environment Variables

1. Go to your service → **Variables** tab
2. Click **"New Variable"** and add each:

   **Required Variables:**
   ```
   MONGODB_URI=mongodb+srv://support_db_user:hCcGZsgNhx38kzQj@abugida0.xvp3tqk.mongodb.net/abugida?retryWrites=true&w=majority
   ```
   
   ```
   JWT_SECRET=c6faa723a626490abf5f2b431af6b4c0b35badb69245d15a10f791e0b694355c
   ```
   
   ```
   NODE_ENV=production
   ```

   **Note:** Railway automatically sets `PORT`, so you don't need to set it.

3. Click **"Add"** for each variable

## Step 5: Deploy

1. Railway will automatically start deploying when you:
   - Push to your GitHub repository's main branch, OR
   - Manually trigger a deploy from the dashboard

2. Watch the **Deploy Logs** to see the build progress

3. Wait for deployment to complete (usually 2-3 minutes)

## Step 6: Get Your Railway URL

1. Once deployed, go to **Settings** → **Networking**
2. You'll see a generated URL like: `abugida-production.up.railway.app`
3. Test it: `https://abugida-production.up.railway.app/api/health`
   - Should return: `{"status":"OK","message":"Server is running"}`

## Step 7: Configure Custom Domain (api.theabugida.org)

1. In Railway, go to **Settings** → **Networking**
2. Scroll down to **"Custom Domains"**
3. Click **"Add Domain"**
4. Enter: `api.theabugida.org`
5. Railway will show you DNS records to add

## Step 8: Configure DNS

1. Go to your domain registrar (where you manage `theabugida.org`)
2. Add a **CNAME record**:
   - **Name/Host**: `api`
   - **Value/Target**: `abugida-production.up.railway.app` (your Railway URL)
   - **TTL**: 3600 (or default)

3. Wait for DNS propagation (5-60 minutes, usually faster)

4. Verify DNS is working:
   ```bash
   # Run this in terminal
   nslookup api.theabugida.org
   ```
   Should show your Railway URL

## Step 9: Update Frontend Configuration

1. Update your `.env` file (for production builds):
   ```env
   REACT_APP_API_URL=https://api.theabugida.org/api
   ```

2. Or the code will automatically use it when deployed (already configured)

## Step 10: Test the Deployment

1. **Test backend directly:**
   - Visit: `https://api.theabugida.org/api/health`
   - Should return: `{"status":"OK","message":"Server is running"}`

2. **Test from frontend:**
   - Visit: `https://theabugida.org`
   - Open browser console
   - Try logging in
   - Should work without errors

3. **Test from mobile:**
   - Open `https://theabugida.org` on your phone
   - Try logging in
   - Should work without "Load failed" errors

## Troubleshooting

### Deployment Fails

**Check logs:**
1. Go to Railway dashboard → **Deployments** → Click on failed deployment
2. Check the logs for errors

**Common issues:**
- Missing environment variables → Add them in Variables tab
- Wrong start command → Set to `node src/server/server.js`
- MongoDB connection fails → Check MONGODB_URI is correct

### Domain Not Working

**Check DNS:**
```bash
nslookup api.theabugida.org
dig api.theabugida.org
```

**Verify in Railway:**
- Go to Settings → Networking
- Check that custom domain shows as "Active"
- Railway will show any DNS issues

### CORS Errors

- Backend already configured to allow `theabugida.org`
- Check Railway logs for CORS-related errors
- Verify domain is in allowed origins list in `server.js`

### MongoDB Connection Issues

- Verify `MONGODB_URI` is set correctly in Railway
- Check MongoDB Atlas → Network Access → Ensure Railway's IPs are allowed (or use 0.0.0.0/0 for all)
- Check MongoDB Atlas → Database Access → User has correct permissions

## Railway CLI (Alternative Method)

If you prefer command line:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to existing project (if created in dashboard)
railway link

# Set environment variables
railway variables set MONGODB_URI="your-connection-string"
railway variables set JWT_SECRET="your-secret"
railway variables set NODE_ENV="production"

# Deploy
railway up
```

## Monitoring

Railway provides:
- **Logs**: Real-time application logs
- **Metrics**: CPU, Memory usage
- **Deployments**: History of all deployments

Access these from your Railway dashboard.

## Cost

Railway offers:
- **Free tier**: $5 credit/month (usually enough for small projects)
- **Hobby plan**: $5/month for more resources
- **Pro plan**: $20/month for production workloads

For a small backend, the free tier should be sufficient.

## Next Steps After Deployment

1. ✅ Backend deployed to Railway
2. ✅ Custom domain configured (`api.theabugida.org`)
3. ✅ DNS records added
4. ✅ Environment variables set
5. ✅ Test backend health endpoint
6. ✅ Update frontend to use domain (already configured)
7. ✅ Rebuild and redeploy frontend
8. ✅ Test login from mobile device

Your backend should now be accessible at `https://api.theabugida.org` and mobile login should work!

