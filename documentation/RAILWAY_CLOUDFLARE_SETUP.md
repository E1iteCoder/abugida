# Railway + Cloudflare Tunnel Setup Guide

This guide helps you configure Railway to work with your Cloudflare Tunnel.

## Prerequisites

✅ Cloudflare Tunnel created (`abugida_backend`)  
✅ Route configured (`server.theabugida.org` → `http://localhost:8080`)  
✅ Dockerfile updated to include cloudflared  

## Step 1: Get Your Cloudflare Tunnel Token

1. Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com)
2. Navigate to **Networks** → **Connectors** → **Cloudflare Tunnels**
3. Click on your tunnel: `abugida_backend`
4. Click on the **Connector ID** (the UUID link with external icon)
5. You'll see the connector details with a **Token** section
6. Copy the token (it looks like: `eyJhIjoi...` - a long string)

**Alternative method:**
- In the tunnel overview, look for "Install and run connectors"
- Copy the command that includes `--token` - extract just the token part

## Step 2: Add Token to Railway

1. Go to your Railway project dashboard
2. Select your backend service
3. Go to **Variables** tab
4. Click **+ New Variable**
5. Add:
   - **Name**: `CLOUDFLARE_TUNNEL_TOKEN`
   - **Value**: Paste your tunnel token
6. Click **Add**

## Step 3: Update Dockerfile CMD (if needed)

The Dockerfile is already updated, but if you need to use the token explicitly:

```dockerfile
CMD sh -c "node src/server/server.js & cloudflared tunnel run --token $CLOUDFLARE_TUNNEL_TOKEN"
```

However, since you've already configured the route in Cloudflare dashboard, you can use the simpler command (which is already in the Dockerfile):

```dockerfile
CMD sh -c "node src/server/server.js & cloudflared tunnel --url http://localhost:8080"
```

## Step 4: Deploy to Railway

1. Push your changes to GitHub (already done)
2. Railway will automatically rebuild and deploy
3. Check Railway logs to verify:
   - Server starts: `Server is running on port 8080`
   - Tunnel connects: Look for cloudflared connection messages

## Step 5: Get Cloudflare Egress IP for MongoDB Atlas

### Method 1: Check Cloudflare Documentation

Cloudflare Tunnel typically uses these IP ranges:
- `104.16.0.0/12`
- `172.64.0.0/13`
- `198.41.128.0/17`

You may need to whitelist one or more of these CIDR ranges in MongoDB Atlas.

### Method 2: Contact Cloudflare Support

1. Go to Cloudflare Dashboard → Support
2. Ask: "What are the egress IP addresses for my Cloudflare Tunnel `abugida_backend`?"
3. They'll provide the specific IP(s) or CIDR range(s)

### Method 3: Check Tunnel Details

1. In Cloudflare Zero Trust → Networks → Connectors
2. Click your tunnel → **Overview** tab
3. Look for "Egress IPs" or "Ingress IPs" section
4. Note the IP addresses listed

### Method 4: Test from Your Backend

Once your Railway service is running with the tunnel:

1. Check Railway logs for any IP information
2. Test the connection: `curl https://server.theabugida.org/api/health`
3. Check MongoDB Atlas logs to see what IP is connecting

## Step 6: Add IP to MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to **Network Access** → **IP Access List**
3. Click **"+ ADD IP ADDRESS"**

**Option A: If you have specific IP(s):**
- **IP Address**: `YOUR_IP/32` (e.g., `104.16.1.1/32`)
- **Comment**: "Cloudflare Tunnel Static IP"

**Option B: If using CIDR range:**
- **IP Address**: `104.16.0.0/12` (or the range Cloudflare provides)
- **Comment**: "Cloudflare Tunnel IP Range"

4. Click **"Confirm"**

## Step 7: Test the Connection

1. **Test API endpoint:**
   ```bash
   curl https://server.theabugida.org/api/health
   ```

2. **Test from frontend:**
   - Go to `https://theabugida.org`
   - Try logging in or registering
   - Check browser console for any errors

3. **Check Railway logs:**
   - Look for "MongoDB connected successfully"
   - Check for any connection errors

## Troubleshooting

### Tunnel Not Connecting

**Check Railway logs:**
- Look for cloudflared errors
- Verify `CLOUDFLARE_TUNNEL_TOKEN` is set correctly
- Check if both server and tunnel are running

**Verify tunnel token:**
- Make sure token is correct (no extra spaces)
- Token should start with `eyJ` (JWT format)

### MongoDB Connection Issues

1. **Verify IP is whitelisted:**
   - Check MongoDB Atlas → Network Access
   - Ensure Cloudflare IP range is added

2. **Check connection string:**
   - Verify `MONGODB_URI` in Railway variables
   - Ensure it's correct format

3. **Test from Railway:**
   - Check Railway logs for MongoDB connection errors
   - Look for "MongoDB connection error" messages

### API Not Responding

1. **Check if server is running:**
   - Railway logs should show "Server is running on port 8080"

2. **Check tunnel status:**
   - Cloudflare dashboard → Tunnel → Should show "HEALTHY"

3. **Test direct connection:**
   - Try accessing `https://server.theabugida.org/api/health`
   - Should return JSON response

## Next Steps

1. ✅ Get tunnel token from Cloudflare
2. ✅ Add token to Railway environment variables
3. ✅ Deploy updated Dockerfile
4. ✅ Get Cloudflare egress IP
5. ✅ Add IP to MongoDB Atlas
6. ✅ Test connection
7. ✅ Verify frontend can connect

## Important Notes

- **Tunnel Token**: Keep this secret! Don't commit it to Git
- **IP Ranges**: Cloudflare may use multiple IPs, so CIDR ranges are safer
- **Port**: Railway uses port 8080 by default, which matches your setup
- **SSL**: Cloudflare Tunnel provides automatic HTTPS - no need for Let's Encrypt

## Support Resources

- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Railway Docs](https://docs.railway.app/)
- [MongoDB Atlas Network Access](https://www.mongodb.com/docs/atlas/security/ip-access-list/)

