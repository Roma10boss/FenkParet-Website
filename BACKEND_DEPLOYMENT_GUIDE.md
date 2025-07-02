# Backend Deployment Guide for Render.com

## Overview
Your Fenkparet backend is fully prepared for deployment on Render.com. All necessary files have been added and committed to your GitHub repository.

## Prerequisites
1. **GitHub Repository**: ✅ Done - Your code is pushed to `https://github.com/Roma10boss/FenkParet-Website.git`
2. **MongoDB Atlas Database**: You'll need a MongoDB connection string
3. **Render.com Account**: Free account available at render.com

## Step-by-Step Deployment Instructions

### 1. Create MongoDB Atlas Database (if not already done)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Create a database user
4. Get your connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/fenkparet`)

### 2. Deploy to Render.com
1. **Go to Render.com**
   - Visit [render.com](https://render.com)
   - Sign up or login

2. **Connect GitHub Repository**
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select repository: `Roma10boss/FenkParet-Website`
   - Select branch: `main`

3. **Configure Service Settings**
   - **Name**: `fenkparet-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Set Environment Variables**
   Click "Advanced" and add these environment variables:

   **Required Variables:**
   ```
   NODE_ENV = production
   PORT = 10000
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/fenkparet?retryWrites=true&w=majority
   JWT_SECRET = your-super-secure-jwt-secret-minimum-32-characters
   JWT_REFRESH_SECRET = your-super-secure-refresh-secret-minimum-32-characters
   JWT_EXPIRES_IN = 7d
   FRONTEND_URL = https://fenparet-website.web.app
   ```

   **Optional Variables (for email features):**
   ```
   SMTP_HOST = smtp-relay.brevo.com
   SMTP_PORT = 587
   SMTP_USER = your-brevo-login
   SMTP_PASS = your-brevo-smtp-key
   SMTP_FROM = noreply@fenkparet.com
   CONTACT_EMAIL = support@fenkparet.com
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy your backend

### 3. Verify Deployment
Once deployed, your backend will be available at a URL like:
`https://fenkparet-backend.onrender.com`

Test these endpoints:
- **Health Check**: `GET https://fenkparet-backend.onrender.com/api/health`
- **API Info**: `GET https://fenkparet-backend.onrender.com/api`
- **Auth Test**: `POST https://fenkparet-backend.onrender.com/api/auth/login`

### 4. Expected Response from Health Check
```json
{
  "status": "healthy",
  "timestamp": "2024-07-02T14:30:00.000Z",
  "uptime": 120.5,
  "memory": {
    "rss": 50000000,
    "heapTotal": 30000000,
    "heapUsed": 20000000,
    "external": 1000000
  },
  "database": "connected"
}
```

## Important Notes

### Environment Variables Tips
1. **JWT Secrets**: Generate secure 32+ character strings
2. **MongoDB URI**: Replace `username`, `password`, and `cluster` with your actual values
3. **CORS**: The backend is already configured for your Firebase frontend URL

### Render.com Free Tier Limitations
- Service may "spin down" after 15 minutes of inactivity
- First request after spin down may take 10-30 seconds
- 750 hours/month free (sufficient for development/testing)

### Backend Features Included
✅ User authentication (JWT)
✅ Product management
✅ Order processing
✅ Admin panel APIs
✅ File upload handling
✅ Real-time Socket.IO
✅ Security middleware
✅ Rate limiting
✅ CORS configuration
✅ Health monitoring

## Troubleshooting

### Common Issues
1. **Database Connection Failed**
   - Check MONGODB_URI format
   - Ensure database user has correct permissions
   - Verify network access in MongoDB Atlas

2. **Service Won't Start**
   - Check build logs in Render dashboard
   - Verify all required environment variables are set
   - Ensure package.json has correct start script

3. **CORS Errors**
   - Backend already includes Firebase URL in CORS config
   - Check console for CORS debug messages

### Getting Help
- Check Render.com logs for detailed error messages
- Verify environment variables match the `.env.example` template
- Test locally first: `cd backend && npm install && npm start`

## Next Steps After Deployment
1. **Test API Endpoints**: Verify all routes work correctly
2. **Update Frontend**: Ensure frontend points to new backend URL
3. **Monitor Performance**: Check Render dashboard for metrics
4. **Set Up Monitoring**: Consider adding error tracking (Sentry)

## Backend Repository Structure
```
backend/
├── config/           # Database and app configuration
├── controllers/      # Route controllers
├── middleware/       # Authentication and security middleware
├── models/          # MongoDB/Mongoose models
├── routes/          # API route definitions
├── utils/           # Utility functions and helpers
├── server.js        # Main application entry point
├── package.json     # Dependencies and scripts
├── render.yaml      # Render.com deployment config
└── .env.example     # Environment variables template
```

Your backend is production-ready and includes all necessary features for the Fenkparet e-commerce platform!