# Domain Deployment Guide for theabugida.org

Since you have `theabugida.org` set up, here's how to configure everything to work with your domain and avoid mobile connection issues.

## Current Setup

- **Frontend**: Deployed to GitHub Pages at `theabugida.org`
- **Backend**: Needs to be deployed and accessible via your domain

## Backend Deployment Options

### Option 1: Subdomain (Recommended) - `api.theabugida.org`

**Pros:**
- Clean separation of frontend and backend
- Easy to configure
- Works well with GitHub Pages frontend

**Steps:**

1. **Deploy your backend** to a service that supports custom domains:
   - **Railway** (recommended - easy setup)
   - **Render** (free tier available)
   - **Heroku** (paid)
   - **DigitalOcean App Platform**
   - **AWS/Google Cloud** (more complex)

2. **Configure subdomain** in your DNS:
   - Add a CNAME record: `api` → `your-backend-service.railway.app` (or your provider's URL)
   - Or A record pointing to your server's IP

3. **Update your `.env` file** for production builds:
   ```env
   REACT_APP_API_URL=https://api.theabugida.org/api
   ```

4. **Update `src/client/utils/api.js`** - Already configured to use `api.theabugida.org` in production

### Option 2: Same Domain with Reverse Proxy - `theabugida.org/api`

**Pros:**
- Single domain
- No CORS issues

**Steps:**

1. **Set up a reverse proxy** (nginx, Apache, or cloud service):
   ```
   theabugida.org/          → GitHub Pages (frontend)
   theabugida.org/api/*     → Your backend server
   ```

2. **Deploy backend** to a server you control

3. **Configure nginx** (example):
   ```nginx
   server {
       server_name theabugida.org;
       
       # Frontend (GitHub Pages)
       location / {
           proxy_pass https://your-username.github.io/abugida/;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Update `src/client/utils/api.js`** - Change production return to:
   ```javascript
   return '/api';
   ```

### Option 3: Separate Backend Service

**Steps:**

1. Deploy backend to any service (Railway, Render, Heroku, etc.)
2. Get the backend URL (e.g., `https://abugida-backend.railway.app`)
3. Update `.env`:
   ```env
   REACT_APP_API_URL=https://abugida-backend.railway.app/api
   ```

## Quick Setup for Railway (Recommended)

1. **Install Railway CLI** or use their web interface
2. **Deploy backend:**
   ```bash
   # In your project root
   railway login
   railway init
   railway up
   ```
3. **Add custom domain:**
   - In Railway dashboard, go to Settings → Domains
   - Add `api.theabugida.org`
   - Update your DNS with the provided CNAME record
4. **Set environment variables in Railway:**
   - `MONGODB_URI` (your MongoDB Atlas connection string)
   - `JWT_SECRET` (your secret key)
   - `PORT` (Railway sets this automatically)
   - `NODE_ENV=production`

## Environment Configuration

### For Development (`.env` file):
```env
# Backend Configuration
PORT=5000
MONGODB_URI=mongodb+srv://support_db_user:hCcGZsgNhx38kzQj@abugida0.xvp3tqk.mongodb.net/abugida?retryWrites=true&w=majority
JWT_SECRET=c6faa723a626490abf5f2b431af6b4c0b35badb69245d15a10f791e0b694355c
NODE_ENV=development

# Frontend API URL (for local development)
# Leave empty to use localhost, or set to your computer's IP for mobile testing
# REACT_APP_API_URL=http://192.168.1.100:5000/api
```

### For Production Build:
```env
# When building for production, set this:
REACT_APP_API_URL=https://api.theabugida.org/api
```

Or if using same domain:
```env
REACT_APP_API_URL=https://theabugida.org/api
```

## Building and Deploying

1. **Set production API URL** in `.env`:
   ```env
   REACT_APP_API_URL=https://api.theabugida.org/api
   ```

2. **Build the frontend:**
   ```bash
   npm run build
   ```

3. **Deploy to GitHub Pages:**
   - The GitHub Actions workflow will automatically deploy when you push to main
   - Or manually push the `build` folder contents to `gh-pages` branch

4. **Verify:**
   - Visit `https://theabugida.org`
   - Check browser console for API calls
   - Test login functionality

## Testing

After deployment, test from mobile:
1. Open `https://theabugida.org` on your phone
2. Try logging in
3. Should work without "Load failed" errors

## Current Configuration

The code is already set up to:
- Use `https://api.theabugida.org/api` when on the production domain
- Fall back to localhost for development
- Use `REACT_APP_API_URL` if explicitly set

## Next Steps

1. Choose your backend deployment option (subdomain recommended)
2. Deploy your backend server
3. Configure DNS for your chosen option
4. Update `.env` with production API URL
5. Rebuild and redeploy frontend
6. Test from mobile device

## Troubleshooting

### Still getting "Load failed" on mobile?
- Check that backend is deployed and accessible
- Verify DNS is configured correctly
- Test backend directly: `https://api.theabugida.org/api/health`
- Check browser console for specific error messages
- Ensure CORS is configured on backend (already done in `server.js`)

### CORS errors?
- Backend already has CORS enabled
- Make sure backend allows requests from `https://theabugida.org`
- Check backend logs for CORS-related errors

