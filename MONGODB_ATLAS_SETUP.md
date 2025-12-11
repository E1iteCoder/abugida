# MongoDB Atlas Setup Guide

## Step-by-Step Instructions

### 1. Create a Cluster
1. Log into [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click **"Build a Database"** or **"Create"** button
3. Choose **FREE** tier (M0 Sandbox)
4. Select your preferred **Cloud Provider** and **Region** (choose closest to you)
5. Give your cluster a name (default is "Cluster0")
6. Click **"Create Cluster"** (takes 3-5 minutes)

### 2. Create Database User
1. Go to **Security** → **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication method
4. Enter a username (e.g., `abugida_user`)
5. Click **"Autogenerate Secure Password"** or create your own
6. **IMPORTANT:** Copy and save the password - you won't see it again!
7. Set user privileges to **"Atlas admin"** (or "Read and write to any database")
8. Click **"Add User"**

### 3. Whitelist IP Address
1. Go to **Security** → **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. For development/testing, click **"Allow Access from Anywhere"**
   - This adds `0.0.0.0/0` (allows all IPs)
   - ⚠️ **For production, use specific IPs only!**
4. Click **"Confirm"**

### 4. Get Connection String
1. Go to **Database** → **Connect** (or click "Connect" button on your cluster)
2. Choose **"Connect your application"**
3. Select:
   - **Driver:** Node.js
   - **Version:** 5.5 or later
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 5. Update Your `.env` File

Replace the connection string in your `.env` file:

**Before:**
```env
MONGODB_URI=mongodb://localhost:27017/abugida
```

**After:**
```env
MONGODB_URI=mongodb+srv://abugida_user:yourpassword@cluster0.xxxxx.mongodb.net/abugida?retryWrites=true&w=majority
```

**Important:**
- Replace `<username>` with your database username
- Replace `<password>` with your database password
- Replace `cluster0.xxxxx.mongodb.net` with your actual cluster URL
- Add `/abugida` before the `?` to specify your database name
- Keep `?retryWrites=true&w=majority` at the end

**Example:**
```env
MONGODB_URI=mongodb+srv://abugida_user:MySecurePass123@cluster0.abc123.mongodb.net/abugida?retryWrites=true&w=majority
```

### 6. Test the Connection

1. Make sure your `.env` file is updated
2. Start your backend server:
   ```bash
   npm run server:dev
   ```
3. You should see: `MongoDB connected successfully`
4. If you see connection errors, check:
   - Username and password are correct
   - IP address is whitelisted
   - Connection string format is correct
   - Database name is included in the URL

## Troubleshooting

### "Authentication failed"
- Double-check username and password in connection string
- Make sure password doesn't contain special characters that need URL encoding
- If password has special characters, URL encode them (e.g., `@` becomes `%40`)

### "IP not whitelisted"
- Go to Network Access and verify your IP is added
- For development, use `0.0.0.0/0` to allow all IPs

### "Connection timeout"
- Check if your firewall is blocking the connection
- Verify the cluster is fully created (not still provisioning)
- Try pinging the cluster URL

### "Database name not found"
- The database will be created automatically when you first write data
- Make sure `/abugida` is in your connection string before the `?`

## Security Best Practices

1. **Never commit your `.env` file** (already in `.gitignore`)
2. **Use strong passwords** for database users
3. **Restrict IP access** in production (don't use `0.0.0.0/0`)
4. **Rotate passwords** regularly
5. **Use environment-specific users** (dev, staging, production)

## Next Steps

Once connected:
1. Test registration: Create a user account
2. Test login: Login with the created account
3. Check Atlas: Go to Database → Browse Collections to see your data

