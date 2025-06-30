# 🆓 Free Full-Stack Deployment Guide for Fenkparet

## 🎯 Best Free Hosting Combo (Recommended)

### Frontend: Vercel (Free)
- ✅ Unlimited personal projects
- ✅ 100GB bandwidth/month
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Custom domains

### Backend: Railway (Free Tier)
- ✅ $5 free credits monthly
- ✅ 500 hours execution time
- ✅ 1GB RAM, 1 vCPU
- ✅ Perfect for small projects

### Database: MongoDB Atlas (Free)
- ✅ 512MB storage
- ✅ Shared cluster
- ✅ No time limit
- ✅ Perfect for development/testing

---

## 🚀 Quick Setup (15 minutes)

### Step 1: Deploy Database (5 min)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free
3. Create new cluster (M0 Sandbox - FREE)
4. Create database user
5. Get connection string: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fenkparet`

### Step 2: Deploy Backend to Railway (5 min)

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repo: `Roma10boss/FenkParet-Website`
5. Railway will detect your backend folder
6. Add environment variables:
   ```
   NODE_ENV=production
   MONGODB_URI=your_atlas_connection_string
   JWT_SECRET=your_secret_key_here
   PORT=8080
   ```

### Step 3: Deploy Frontend to Vercel (5 min)

1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository
4. Set build settings:
   - Framework: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=your_railway_backend_url
   ```

---

## 🆓 Alternative: All-in-One Solutions

### Option 1: Render (Free Tier)
- ✅ 750 hours/month (enough for testing)
- ✅ Auto-deploy from GitHub
- ✅ Both frontend and backend

### Option 2: Netlify + Railway
- ✅ Netlify: Frontend (free)
- ✅ Railway: Backend (free credits)

### Option 3: GitHub Pages + Railway
- ✅ GitHub Pages: Frontend (free)
- ✅ Railway: Backend (free credits)

---

## 💰 Free Tier Limits

### Vercel (Frontend)
- ✅ Unlimited projects
- ✅ 100GB bandwidth/month
- ✅ 6,000 build minutes/month
- ✅ No time limit

### Railway (Backend)
- ✅ $5 free credits/month
- ✅ ~500 hours execution time
- ✅ 1GB RAM, 1 vCPU
- ✅ Great for development

### MongoDB Atlas (Database)
- ✅ 512MB storage
- ✅ Shared cluster
- ✅ No time limit
- ✅ Perfect for small projects

### Render (Alternative)
- ✅ 750 hours/month free
- ✅ Auto-sleep after 15min inactivity
- ✅ Both frontend and backend

---

## 🎯 Recommended Free Setup

**Best Performance & Reliability:**
1. **Frontend**: Vercel (unlimited, fast)
2. **Backend**: Railway ($5 credits monthly)
3. **Database**: MongoDB Atlas (512MB free)

**Total Monthly Cost**: $0 (within free limits)

---

## 🚀 Quick Commands for Recommended Setup

### Step 1: Database Setup
```bash
# Go to mongodb.com/cloud/atlas
# Create free M0 cluster
# Get connection string
```

### Step 2: Backend to Railway
```cmd
# Go to railway.app
# Deploy from GitHub
# Add environment variables
```

### Step 3: Frontend to Vercel
```cmd
npm install -g vercel
cd C:\Users\Rome\Desktop\Projects\Fenkparet\frontend
vercel
# Follow prompts, connect GitHub repo
```

---

## 🔧 Environment Variables You'll Need

### Backend (Railway)
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/fenkparet
JWT_SECRET=your_super_secret_jwt_key_here
CORS_ORIGIN=your_vercel_frontend_url
PORT=8080
```

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_SITE_NAME=Fenkparet
NEXT_PUBLIC_CURRENCY=HTG
```

---

## 🎉 What You'll Get (100% Free)

### Live URLs
- **Website**: `https://fenkparet-website.vercel.app`
- **API**: `https://fenkparet-backend.railway.app`
- **Admin**: `https://fenkparet-website.vercel.app/admin`

### Full Features
- ✅ User registration/login
- ✅ Product catalog with real database
- ✅ Shopping cart with persistence
- ✅ Admin dashboard
- ✅ Order management
- ✅ Email notifications
- ✅ Payment integration (MonCash)
- ✅ Real-time updates

### Performance
- ✅ Global CDN (fast worldwide)
- ✅ Automatic HTTPS
- ✅ 99.9% uptime
- ✅ Mobile responsive

---

## 📊 Monthly Usage Estimates

For a testing/small business site:
- **Vercel**: Well within free limits
- **Railway**: ~$3-5 of free credits used
- **MongoDB**: ~50-100MB used (free)
- **Total Cost**: $0

---

## 🚀 Want to Start?

**Easiest path**: 
1. **Database**: MongoDB Atlas (5 min setup)
2. **Backend**: Railway from GitHub (5 min)
3. **Frontend**: Vercel from GitHub (5 min)

**Ready to begin?** Let's start with MongoDB Atlas first!