# Fenkparet GitHub Pages Deployment Guide

## ⚠️ Important: GitHub Pages Limitation

GitHub Pages only hosts **static websites** and cannot run Node.js backends. However, we have several solutions for your testing needs.

## 🎯 Recommended Solution: Static Frontend + External Backend

### Option 1: GitHub Pages + Free Backend Hosting (RECOMMENDED)

**Frontend**: GitHub Pages (Static Next.js export)
**Backend**: Railway/Render (Free tier)
**Database**: MongoDB Atlas (Free)

### Step-by-Step Implementation:

#### 1. Prepare Frontend for Static Export

First, let's modify the Next.js configuration for static export:

```javascript
// Update frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // ... keep existing configuration
}
```

#### 2. Create GitHub Pages Deployment Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
        
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
        
    - name: Build
      run: |
        cd frontend
        npm run build
      env:
        NEXT_PUBLIC_API_URL: https://your-backend.railway.app
        NEXT_PUBLIC_SITE_NAME: Fenkparet
        NEXT_PUBLIC_SITE_URL: https://yourusername.github.io/fenkparet
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: frontend/out
```

#### 3. Backend Deployment (Railway - Free)

Deploy your backend to Railway for free:

1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Select the `backend` folder
4. Add environment variables:

```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/fenkparet
JWT_SECRET=your-secure-secret
FRONTEND_URL=https://yourusername.github.io
```

## 🔧 Frontend Modifications for Static Export

### 1. Update API Calls

Create a new API configuration file:

```javascript
// frontend/utils/api-config.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-backend.railway.app';

export const apiConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
};

// Update all API calls to use full URLs
export const apiEndpoints = {
  products: `${API_BASE_URL}/api/products`,
  auth: `${API_BASE_URL}/api/auth`,
  orders: `${API_BASE_URL}/api/orders`,
  admin: `${API_BASE_URL}/api/admin`,
  reviews: `${API_BASE_URL}/api/reviews`,
  tickets: `${API_BASE_URL}/api/tickets`,
};
```

### 2. Remove Next.js API Routes

Since GitHub Pages can't run server-side code, remove or modify the `/pages/api/` folder:

```bash
# Delete frontend API routes (they won't work on GitHub Pages)
rm -rf frontend/pages/api/
```

### 3. Update Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "export": "next export",
    "deploy": "next build && next export",
    "start": "next start"
  }
}
```

## 🚀 Alternative Solutions

### Option 2: Vercel (Recommended Alternative)

If you prefer a simpler solution:

1. **Deploy to Vercel** instead of GitHub Pages
2. **Keep your code on GitHub** for collaboration
3. **Connect Vercel to your GitHub repo**
4. **Automatic deployments** on every push

Benefits:
- ✅ Supports full Next.js features
- ✅ Free tier with custom domains
- ✅ Automatic SSL certificates
- ✅ Global CDN
- ✅ Easy environment variable management

### Option 3: Netlify + Backend

Similar to Vercel but with Netlify:
- Deploy frontend to Netlify
- Deploy backend to Railway/Render
- Connect via API calls

### Option 4: Full Static Demo (Limited Testing)

For basic testing without backend functionality:

1. **Create static demo** with mock data
2. **Simulate all interactions** client-side
3. **Collect feedback** via forms/email
4. **Limited admin functionality**

## 📋 GitHub Pages Setup Instructions

### 1. Repository Setup

```bash
# Create GitHub repository
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/fenkparet.git
git push -u origin main
```

### 2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** section
4. Source: **GitHub Actions**
5. Save settings

### 3. Configure Environment Variables

Create repository secrets for sensitive data:

1. Go to **Settings** > **Secrets and variables** > **Actions**
2. Add secrets:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `BACKEND_URL`

### 4. Backend Environment Variables

For Railway backend:
```bash
NODE_ENV=production
MONGODB_URI=your-mongodb-connection
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://yourusername.github.io
CORS_ORIGIN=https://yourusername.github.io
```

## 🧪 Testing Strategy for GitHub Pages

### Admin Testing Workflow

1. **Admin Access**: 
   - Admin logs in through GitHub Pages frontend
   - Authenticates with Railway backend
   - Full admin panel functionality available

2. **Product Upload**:
   - Admin uploads products via frontend
   - Images stored in cloud storage (Cloudinary)
   - Data saved to MongoDB via backend API

3. **User Testing**:
   - Users browse products on GitHub Pages
   - Shopping cart works client-side
   - Orders processed via backend API

### Feedback Collection

Set up multiple feedback channels:

```javascript
// Frontend feedback component
const FeedbackButton = () => {
  const collectFeedback = (feedback) => {
    // Send to backend API
    fetch(`${API_BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feedback,
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        page: window.location.pathname
      })
    });
  };
  
  return (
    <button onClick={() => /* Open feedback modal */}>
      📝 Give Feedback
    </button>
  );
};
```

## 📝 Modified File Structure

```
fenkparet/
├── frontend/           # Static frontend for GitHub Pages
│   ├── pages/         # Next.js pages (no API routes)
│   ├── components/    # React components
│   ├── utils/         # Client-side utilities
│   └── out/           # Built static files (auto-generated)
├── backend/           # Deploy to Railway/Render
│   ├── routes/        # API endpoints
│   ├── models/        # Database models
│   └── controllers/   # Business logic
├── .github/
│   └── workflows/
│       └── deploy.yml # GitHub Actions deployment
└── docs/              # Documentation
```

## 🎯 URLs After Deployment

```bash
Frontend (GitHub Pages): https://yourusername.github.io/fenkparet
Backend (Railway): https://fenkparet-backend.railway.app
Database: MongoDB Atlas cluster
Admin Panel: https://yourusername.github.io/fenkparet/admin
```

## ✅ Benefits of This Approach

1. **Free Hosting**: GitHub Pages is completely free
2. **Version Control**: All changes tracked in Git
3. **Collaboration**: Easy for multiple people to contribute
4. **Professional URLs**: Clean GitHub.io domain
5. **Automatic Deployment**: Push to deploy
6. **Full Functionality**: Complete e-commerce features
7. **Easy Feedback**: Built-in issue tracking

## 🚨 Important Considerations

1. **CORS Configuration**: Backend must allow GitHub Pages domain
2. **HTTPS Required**: GitHub Pages uses HTTPS, backend should too
3. **Environment Variables**: Manage secrets properly
4. **Image Uploads**: Use cloud storage (Cloudinary/AWS S3)
5. **Database**: MongoDB Atlas recommended for reliability

## 🎉 Ready to Deploy!

This setup gives you:
- ✅ **Static frontend** on GitHub Pages
- ✅ **Full backend functionality** on Railway
- ✅ **Professional appearance** for testing
- ✅ **Easy collaboration** with admin testers
- ✅ **Free hosting** for testing phase
- ✅ **Scalable architecture** for future growth

Would you like me to help you implement any of these modifications?