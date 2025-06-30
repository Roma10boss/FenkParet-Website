# 🔐 Fenkparet Authentication System

This document explains how the role-based authentication system works in Fenkparet.

## 🎭 User Roles

### 👤 Regular User
- **Role**: `user`
- **isAdmin**: `false`
- **Access**: 
  - Frontend user pages
  - Shopping cart, orders, profile
  - Customer support tickets

### 👑 Admin User  
- **Role**: `admin`
- **isAdmin**: `true`
- **Access**:
  - All regular user features
  - Admin panel (`/admin/*`)
  - User management
  - Product management
  - Order management
  - Analytics dashboard

## 🚀 Quick Setup

### 1. Create Admin User
```bash
cd backend
npm run create-admin
```

This creates:
- **Email**: `admin@fenkparet.com`
- **Password**: `Admin123!`
- **Role**: `admin`

### 2. Create Regular User
Register through the frontend at `/auth/register` or use the API:

```bash
POST /api/auth/register
{
  "name": "John Doe",
  "email": "user@example.com", 
  "password": "UserPass123!"
}
```

### 3. Test Authentication
```bash
cd backend
npm run test-auth
```

## 🔑 Login Process

### Regular User Login
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "UserPass123!"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "John Doe", 
    "email": "user@example.com",
    "isAdmin": false,
    "role": "user"
  }
}
```

### Admin Login
```bash
POST /api/auth/login
{
  "email": "admin@fenkparet.com",
  "password": "Admin123!"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful", 
  "token": "jwt-token-here",
  "user": {
    "id": "admin-id",
    "name": "Admin User",
    "email": "admin@fenkparet.com", 
    "isAdmin": true,
    "role": "admin"
  }
}
```

## 🛡️ Route Protection

### Frontend Protection
- **Regular routes**: Accessible to all users
- **User routes** (`/user/*`): Requires authentication
- **Admin routes** (`/admin/*`): Requires admin role

### Backend Protection
- **Public endpoints**: No authentication required
- **User endpoints**: `authenticateToken` middleware
- **Admin endpoints**: `authenticateToken` + `requireAdmin` middleware

## 📋 Frontend Components

### Authentication Hook
```javascript
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth();
  
  if (isAdmin) {
    // Show admin features
  }
  
  return <div>Welcome {user?.name}</div>;
}
```

### Admin Route Protection
```javascript
import withAdminAuth from '../components/admin/withAdminAuth';

const AdminPage = () => {
  return <div>Admin Only Content</div>;
};

export default withAdminAuth(AdminPage);
```

## 🔧 Backend Middleware

### Authentication Middleware
```javascript
const { authenticateToken, requireAdmin } = require('./middleware/auth');

// Protect regular user routes
router.get('/profile', authenticateToken, getUserProfile);

// Protect admin routes  
router.get('/dashboard', authenticateToken, requireAdmin, getDashboard);
```

## 🧪 Testing Login

### Test Admin Access
1. Login with admin credentials
2. Visit `http://localhost:3000/admin/dashboard`
3. Should see admin panel

### Test User Access
1. Login with regular user credentials  
2. Visit `http://localhost:3000/admin/dashboard`
3. Should redirect to home page

### Test API Access
```bash
# Get user profile (requires token)
curl -H "Authorization: Bearer <token>" \
     http://localhost:5000/api/auth/me

# Access admin endpoint (requires admin token)
curl -H "Authorization: Bearer <admin-token>" \
     http://localhost:5000/api/admin/dashboard
```

## 🔒 Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT tokens with expiration (24h)
- ✅ Role-based access control
- ✅ Account status checking (active/inactive)
- ✅ Token validation on each request
- ✅ Secure password requirements
- ✅ Protected admin routes
- ✅ Frontend route guards

## 🚨 Important Notes

1. **Change Default Passwords**: Always change default admin password in production
2. **Environment Variables**: Set proper JWT secrets in production
3. **HTTPS**: Use HTTPS in production for secure token transmission
4. **Token Storage**: Frontend stores tokens in localStorage
5. **Role Sync**: User model automatically syncs `role` and `isAdmin` fields

## 🐛 Troubleshooting

### "Access Denied" Error
- Check if user has correct role (`admin` for admin routes)
- Verify token is valid and not expired
- Ensure user account is active

### Login Not Working
- Verify password is correct
- Check if user exists in database
- Run `npm run test-auth` to diagnose issues

### Admin Panel Not Loading
- Confirm user has `isAdmin: true` or `role: 'admin'`
- Check browser console for authentication errors
- Verify admin routes are properly protected

## 📞 Support

If you encounter authentication issues:
1. Run `npm run test-auth` for diagnostics
2. Check server console for error messages
3. Verify database connection and user data
4. Test API endpoints with tools like Postman