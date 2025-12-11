# Mobile API Setup Guide

## Problem
When testing on a mobile device, the app tries to connect to `http://localhost:5000/api`, but `localhost` on a phone refers to the phone itself, not your development computer. This causes "Load failed" errors.

## Solution

### Option 1: Use Your Computer's IP Address (Recommended for Testing)

1. **Find your computer's local IP address:**
   - Windows: Open Command Prompt and run `ipconfig`
   - Look for "IPv4 Address" under your active network adapter (usually starts with 192.168.x.x or 10.x.x.x)
   - Mac/Linux: Run `ifconfig` or `ip addr` and look for your local IP

2. **Update your `.env` file:**
   ```env
   REACT_APP_API_URL=http://YOUR_IP_ADDRESS:5000/api
   ```
   Example: `REACT_APP_API_URL=http://192.168.1.100:5000/api`

3. **Make sure your phone and computer are on the same Wi-Fi network**

4. **Restart your React development server:**
   ```bash
   npm start
   ```

5. **Ensure your backend server is running:**
   ```bash
   npm run server:dev
   ```

6. **Access from your phone:**
   - Open your phone's browser
   - Go to `http://YOUR_IP_ADDRESS:3000` (replace with your actual IP)
   - The app should now be able to connect to the backend

### Option 2: Use ngrok (For External Testing)

If you need to test from outside your local network:

1. Install ngrok: https://ngrok.com/
2. Start your backend server: `npm run server:dev`
3. In another terminal, run: `ngrok http 5000`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Update `.env`:
   ```env
   REACT_APP_API_URL=https://abc123.ngrok.io/api
   ```
6. Restart your React app

### Option 3: Deploy Backend (For Production)

For production, deploy your backend to a service like:
- Heroku
- Railway
- Render
- AWS
- DigitalOcean

Then update your `.env`:
```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

## Troubleshooting

### "Network error: Unable to connect to server"
- Check that your backend server is running
- Verify the IP address is correct
- Ensure both devices are on the same network
- Check firewall settings (port 5000 might be blocked)

### "CORS error"
- Make sure your backend has CORS enabled (already configured in `server.js`)
- Check that the API URL in `.env` matches where your backend is running

### Still not working?
1. Check browser console on your phone for detailed error messages
2. Verify backend is accessible by visiting `http://YOUR_IP:5000/api/health` in your phone's browser
3. Make sure your computer's firewall allows connections on port 5000

## Quick Test

To test if your backend is accessible from your phone:
1. Open your phone's browser
2. Navigate to: `http://YOUR_COMPUTER_IP:5000/api/health`
3. You should see: `{"status":"OK","message":"Server is running"}`

If this works, your backend is accessible and the React app should work too.

