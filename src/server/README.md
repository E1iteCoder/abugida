# Backend Server Setup Guide

This guide will help you get started with the backend server for the Abugida application.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the `src/server/` directory (or at the project root) with the following:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/abugida
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

   **For MongoDB Atlas (cloud):**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/abugida
   ```

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run server:dev
```

### Production Mode:
```bash
npm run server
```

### Run Both Frontend and Backend Together:
```bash
npm run dev
```
(Note: You may need to install `concurrently` if you get an error: `npm install --save-dev concurrently`)

## API Endpoints

### Authentication Routes (`/api/auth`)

- **POST `/api/auth/register`** - Register a new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- **POST `/api/auth/login`** - Login user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- **GET `/api/auth/me`** - Get current user (requires Bearer token)
  ```
  Authorization: Bearer <your-jwt-token>
  ```

### Health Check

- **GET `/api/health`** - Check if server is running

## MongoDB Setup

### Local MongoDB

1. Install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   - Windows: MongoDB should start automatically as a service
   - Mac/Linux: `mongod` or `brew services start mongodb-community`
3. Use connection string: `mongodb://localhost:27017/abugida`

### MongoDB Atlas (Cloud)

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string and update `MONGODB_URI` in `.env`

## Project Structure

```
src/server/
├── server.js          # Main server file
├── db.js              # Database connection
├── routes/
│   └── auth.js        # Authentication routes
└── models/
    └── User.js        # User model
```

## Next Steps

1. **Add more routes** - Create new route files in `src/server/routes/`
2. **Add more models** - Create new model files in `src/server/models/`
3. **Add middleware** - Create middleware for authentication, validation, etc.
4. **Connect frontend** - Update your React components to use the API endpoints

## Example: Connecting Frontend to Backend

Update your login component to use the backend API:

```javascript
// In src/client/components/login.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password: pass }),
    });
    
    const data = await response.json();
    if (response.ok) {
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      console.log('Login successful');
    } else {
      setError(data.error);
    }
  } catch (error) {
    setError('Network error. Please try again.');
  }
};
```

## Troubleshooting

- **Port already in use**: Change `PORT` in `.env` file
- **MongoDB connection error**: Check if MongoDB is running and connection string is correct
- **JWT errors**: Make sure `JWT_SECRET` is set in `.env`

