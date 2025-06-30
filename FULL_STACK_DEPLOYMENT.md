# 🚀 Complete Full-Stack Fenkparet Deployment

## Architecture Overview
- **Frontend**: Next.js deployed to Vercel/Firebase
- **Backend**: Node.js/Express deployed to Google Cloud Run
- **Database**: MongoDB Atlas (managed database)
- **File Storage**: Google Cloud Storage
- **Domain**: Custom domain with SSL

## Option 1: Google Cloud Run + MongoDB Atlas (Recommended)

### Step 1: Set Up MongoDB Atlas Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create new cluster (free tier)
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/fenkparet`

### Step 2: Deploy Backend to Google Cloud Run

```cmd
# Install Google Cloud CLI
# Download from: https://cloud.google.com/sdk/docs/install

# Initialize gcloud
gcloud init
gcloud auth login

# Create project
gcloud projects create fenkparet-prod --name="Fenkparet Production"
gcloud config set project fenkparet-prod

# Enable APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable storage.googleapis.com

# Deploy backend
cd C:\Users\Rome\Desktop\Projects\Fenkparet\backend
gcloud run deploy fenkparet-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,MONGODB_URI=your_mongodb_connection_string,JWT_SECRET=your_jwt_secret"
```

### Step 3: Deploy Frontend to Vercel

```cmd
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd C:\Users\Rome\Desktop\Projects\Fenkparet\frontend
vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://your-backend-url.run.app
```

---

## Option 2: Complete Google Cloud Solution

### Step 1: Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD ["npm", "start"]
```

### Step 2: Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Step 3: Deploy Both Services

```cmd
# Deploy backend
cd backend
gcloud run deploy fenkparet-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated

# Deploy frontend
cd ../frontend
gcloud run deploy fenkparet-frontend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Option 3: Railway (Easiest Full-Stack)

### Step 1: Deploy to Railway

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect and deploy both frontend and backend

### Step 2: Set Environment Variables

In Railway dashboard:
```
# Backend variables
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
PORT=8080

# Frontend variables
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

---

## Quick Setup Commands

### Option A: MongoDB Atlas + Google Cloud

```cmd
# 1. Set up database (manual step at mongodb.com)

# 2. Deploy backend
cd C:\Users\Rome\Desktop\Projects\Fenkparet\backend
gcloud run deploy fenkparet-backend --source . --region us-central1 --allow-unauthenticated

# 3. Deploy frontend
cd ../frontend
# Update NEXT_PUBLIC_API_URL in .env.local to your backend URL
npm run build
gcloud run deploy fenkparet-frontend --source . --region us-central1 --allow-unauthenticated
```

### Option B: Railway (Simplest)

```cmd
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy
cd C:\Users\Rome\Desktop\Projects\Fenkparet
railway up
```

---

## What You'll Get

### ✅ Complete E-commerce Platform
- **Product catalog** with real database
- **Shopping cart** with persistent storage
- **User authentication** (login/register)
- **Admin dashboard** for managing products
- **Order management** system
- **Payment integration** (MonCash)
- **Email notifications**
- **Real-time features**

### ✅ Live URLs
- **Frontend**: `https://fenkparet-frontend-xyz.run.app`
- **Backend API**: `https://fenkparet-backend-xyz.run.app`
- **Admin Panel**: `https://fenkparet-frontend-xyz.run.app/admin`

### ✅ Database Features
- **User accounts** and profiles
- **Product inventory** management
- **Order history** and tracking
- **Customer reviews** and ratings
- **Support tickets** system

---

## Recommended Approach

**For quickest full-stack deployment**: Use **Railway**
1. Sign up at railway.app
2. Connect your GitHub repo
3. Deploy with one click
4. Set environment variables
5. Live in 5 minutes!

**For production-ready**: Use **Google Cloud Run + MongoDB Atlas**
1. More control and scalability
2. Better for high traffic
3. Professional deployment

Which option would you prefer? I'll help you set it up step by step!