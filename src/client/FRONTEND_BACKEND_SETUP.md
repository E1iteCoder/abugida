# Frontend-Backend Integration Guide

This guide explains how the frontend is connected to the backend API.

## Setup

1. **Environment Variables**
   Create a `.env` file in the project root (if not already created):
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```
   For production, update this to your deployed backend URL.

2. **Start the Backend Server**
   ```bash
   npm run server:dev
   ```

3. **Start the Frontend**
   ```bash
   npm start
   ```

## How It Works

### Authentication Flow

1. **Registration/Login**
   - User submits email and password
   - Frontend sends request to `/api/auth/register` or `/api/auth/login`
   - Backend returns JWT token
   - Token is stored in `localStorage`
   - User is redirected to dashboard

2. **Protected Routes**
   - Use `<ProtectedRoute>` component to protect routes
   - Example:
     ```jsx
     <Route 
       path="/dashboard" 
       element={
         <ProtectedRoute>
           <Dashboard />
         </ProtectedRoute>
       } 
     />
     ```

3. **API Calls**
   - All API calls use the `api.js` utility
   - Token is automatically included in request headers
   - Example:
     ```javascript
     import { authAPI } from '../utils/api';
     
     const data = await authAPI.getCurrentUser();
     ```

### Components Updated

- **`src/client/components/login.jsx`** - Now uses backend API
- **`src/client/components/register.jsx`** - Now uses backend API
- **`src/client/components/navbar.jsx`** - Shows user email and logout button when authenticated
- **`src/client/app.js`** - Wrapped with `AuthProvider` for global auth state

### New Files Created

- **`src/client/utils/api.js`** - API utility for making backend requests
- **`src/client/context/AuthContext.js`** - Authentication context provider
- **`src/client/components/ProtectedRoute.jsx`** - Component for protecting routes

## Usage Examples

### Using Auth Context in Components

```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <p>Welcome, {user.email}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Making API Calls

```javascript
import apiRequest from '../utils/api';

// Get data
const data = await apiRequest('/some-endpoint');

// Post data
const result = await apiRequest('/some-endpoint', {
  method: 'POST',
  body: JSON.stringify({ key: 'value' }),
});
```

## Testing

1. Start both frontend and backend
2. Navigate to `/login`
3. Register a new account or login
4. You should be redirected to `/dashboard`
5. Check the navbar - it should show your email and a logout button

## Troubleshooting

- **CORS errors**: Make sure backend has CORS enabled (already configured in `server.js`)
- **401 errors**: Check if token is being sent in headers
- **Connection refused**: Ensure backend server is running on port 5000
- **Token expired**: User will need to login again (tokens expire after 7 days)

