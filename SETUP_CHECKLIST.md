# Setup Checklist

Follow these steps to get your application running with the backend:

## ✅ Required Setup Steps

### 1. Install Dependencies
```bash
npm install
```
This will install all the new backend dependencies (express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv, nodemon, concurrently).

### 2. Create `.env` File
Create a `.env` file in the **project root** (same level as `package.json`):

```env
# Backend Configuration
PORT=5000
MONGODB_URI=mongodb://localhost:27017/abugida
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development

# Frontend Configuration (optional - has fallback)
REACT_APP_API_URL=http://localhost:5000/api
```

**Important:** 
- Generate a secure JWT_SECRET for production
- Update MONGODB_URI if using MongoDB Atlas (cloud)

### 3. Set Up MongoDB

**Option A: Local MongoDB**
- Download and install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
- Start MongoDB service:
  - Windows: Usually starts automatically as a service
  - Mac: `brew services start mongodb-community`
  - Linux: `sudo systemctl start mongod`

**Option B: MongoDB Atlas (Cloud)**
- Create free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster
- Create database user
- Whitelist your IP (or `0.0.0.0/0` for development)
- Get connection string and update `MONGODB_URI` in `.env`

### 4. Generate Secure JWT Secret (Recommended)
Run this command to generate a secure random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and use it as your `JWT_SECRET` in `.env`

## 🚀 Running the Application

### Start Backend Only
```bash
npm run server:dev
```
Server will run on `http://localhost:5000`

### Start Frontend Only
```bash
npm start
```
Frontend will run on `http://localhost:3000`

### Start Both Together
```bash
npm run dev
```
This runs both backend and frontend concurrently.

## 🧪 Testing the Setup

1. **Test Backend Health:**
   - Open browser: `http://localhost:5000/api/health`
   - Should return: `{"status":"OK","message":"Server is running"}`

2. **Test Registration:**
   - Go to `http://localhost:3000/login`
   - Click "Create your Abugida account"
   - Register with email and password
   - Should redirect to dashboard

3. **Test Login:**
   - Logout and login again
   - Should work and redirect to dashboard

4. **Check Navbar:**
   - When logged in, navbar should show your email
   - Logout button should appear

## ⚠️ Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify `.env` file exists and has correct values
- Check if port 5000 is available (change PORT in `.env` if needed)

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check `REACT_APP_API_URL` in `.env` (or it will use default)
- Check browser console for CORS errors

### MongoDB connection errors
- Verify MongoDB is running (local) or connection string is correct (Atlas)
- Check `MONGODB_URI` in `.env`
- For Atlas: Ensure IP is whitelisted

### Authentication not working
- Check browser console for errors
- Verify JWT_SECRET is set in `.env`
- Check if token is being stored in localStorage

## 📝 Additional Notes

- The `.env` file is already in `.gitignore` - it won't be committed
- Use `env.example` as a template for team members
- For production, use strong, unique values for all secrets
- The frontend API URL has a fallback, so `REACT_APP_API_URL` is optional for local development

## ✅ Verification Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with all required variables
- [ ] MongoDB installed and running (or Atlas configured)
- [ ] JWT_SECRET set to a secure random string
- [ ] Backend starts without errors (`npm run server:dev`)
- [ ] Frontend starts without errors (`npm start`)
- [ ] Can register a new user
- [ ] Can login with registered user
- [ ] Navbar shows user email when logged in
- [ ] Logout works correctly

