# 🚀 Google Cloud Deployment Guide for Fenkparet

## Method 1: Firebase Hosting (Recommended)

### Prerequisites
1. Google account
2. Node.js installed
3. Firebase CLI

### Step 1: Install Firebase CLI

```cmd
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```cmd
firebase login
```

### Step 3: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it "fenkparet-website"
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 4: Initialize Firebase in Your Project

```cmd
cd C:\Users\Rome\Desktop\Projects\Fenkparet
firebase init hosting
```

When prompted:
- **Use existing project**: Select "fenkparet-website"
- **Public directory**: Enter `frontend/out`
- **Single-page app**: Yes
- **Set up automatic builds**: No
- **Overwrite index.html**: No

### Step 5: Build Your Site

```cmd
cd frontend
npm run build:static
cd ..
```

### Step 6: Deploy to Firebase

```cmd
firebase deploy
```

### Your Live Website
Your site will be available at: `https://fenkparet-website.web.app`

---

## Method 2: Google Cloud Run (Full Stack)

### Step 1: Install Google Cloud CLI

Download from: https://cloud.google.com/sdk/docs/install

### Step 2: Initialize gcloud

```cmd
gcloud init
gcloud auth login
```

### Step 3: Create New Project

```cmd
gcloud projects create fenkparet-website --name="Fenkparet Website"
gcloud config set project fenkparet-website
```

### Step 4: Enable Required APIs

```cmd
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### Step 5: Create Dockerfile

Already created in your project!

### Step 6: Build and Deploy

```cmd
gcloud run deploy fenkparet-website \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Method 3: Quick Firebase Deployment (Fastest)

If you want to get online quickly:

### Step 1: Build the site
```cmd
cd C:\Users\Rome\Desktop\Projects\Fenkparet\frontend
npm run build:static
```

### Step 2: Install Firebase CLI
```cmd
npm install -g firebase-tools
```

### Step 3: Deploy
```cmd
cd ..
firebase login
firebase deploy
```

---

## 🎯 Recommended: Firebase Hosting

**Why Firebase Hosting?**
- ✅ **Free tier**: 10GB storage, 10GB/month transfer
- ✅ **Global CDN**: Fast worldwide
- ✅ **Auto SSL**: HTTPS included
- ✅ **Custom domain**: Easy setup
- ✅ **Perfect for static sites**

**Your URLs will be:**
- Main site: `https://fenkparet-website.web.app`
- Custom domain: `https://fenkparet.com` (if you buy domain)

## 🔧 Troubleshooting

### If Firebase CLI fails to install:
```cmd
# Try with elevated permissions
npm install -g firebase-tools --force
```

### If build fails:
```cmd
cd frontend
rm -rf node_modules .next
npm install
npm run build:static
```

### If deployment fails:
```cmd
firebase logout
firebase login
firebase deploy --force
```

## 📊 Estimated Costs

**Firebase Hosting (Free Tier):**
- Storage: 10GB (plenty for your site)
- Transfer: 10GB/month (good for testing)
- Custom domain: Free
- SSL certificate: Free

**Upgrade (Spark to Blaze):**
- Only pay for what you use above free limits
- Typically $1-5/month for small sites

## 🎉 Next Steps After Deployment

1. **Test all pages**:
   - Homepage: `https://your-site.web.app/`
   - Products: `https://your-site.web.app/products`
   - Contact: `https://your-site.web.app/contact`

2. **Set up custom domain** (optional):
   - Buy domain from Google Domains or elsewhere
   - Add to Firebase Hosting settings

3. **Enable analytics** (optional):
   - Google Analytics 4
   - Firebase Analytics

4. **Set up monitoring**:
   - Performance monitoring
   - Error reporting

## 🚀 Quick Start Commands

```cmd
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Build site
cd frontend && npm run build:static && cd ..

# 4. Deploy
firebase deploy
```

**That's it! Your site will be live in minutes!** 🎉