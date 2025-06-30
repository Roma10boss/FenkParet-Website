# Fenkparet Production Deployment Guide

## 🚀 Deployment Options

### Recommended Stack for Haitian Market:
- **Frontend**: Vercel (Free tier with custom domain)
- **Backend**: Railway/Render (Free tier available)
- **Database**: MongoDB Atlas (Free 512MB cluster)
- **File Storage**: Cloudinary (Free tier: 25GB)
- **Email**: EmailJS or Brevo (Free tier available)

## 📋 Pre-Deployment Checklist

### ✅ Code Preparation
- [x] All routes implemented and tested
- [x] Environment variables configured
- [x] Production build tested locally
- [x] Database models and migrations ready
- [x] File upload functionality configured
- [ ] Production environment variables set
- [ ] Domain name acquired (optional)
- [ ] SSL certificate configured (automatic with most platforms)

## 🌐 Option 1: Vercel + Railway (Recommended)

### Frontend Deployment (Vercel)

1. **Push to GitHub**:
```bash
cd frontend
git add .
git commit -m "Ready for production deployment"
git push origin main
```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Select the `frontend` folder as root directory
   - Add environment variables:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_SITE_NAME=Fenkparet
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

3. **Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Backend Deployment (Railway)

1. **Prepare Backend for Production**:
```bash
cd backend
# Create package.json start script if not exists
```

2. **Deploy to Railway**:
   - Go to [railway.app](https://railway.app)
   - Connect GitHub repository
   - Select `backend` folder
   - Add environment variables:

```bash
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fenkparet
JWT_SECRET=your-super-secure-jwt-secret
JWT_REFRESH_SECRET=your-super-secure-refresh-secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@fenkparet.com
CONTACT_EMAIL=support@fenkparet.com
MONCASH_NUMBER=+50912345678
```

## 🗄️ Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**:
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create free cluster (M0 tier)
   - Set up database user and password
   - Whitelist IP addresses (0.0.0.0/0 for Railway/Vercel)

2. **Get Connection String**:
```bash
mongodb+srv://username:password@cluster.mongodb.net/fenkparet?retryWrites=true&w=majority
```

3. **Create Database Structure**:
```bash
# Database will be created automatically when first document is inserted
# Collections: users, products, orders, reviews, tickets, categories, notifications, settings
```

## 📧 Email Setup (Brevo/SendGrid)

### Option A: Brevo (Recommended for Haiti)
1. Create account at [brevo.com](https://brevo.com)
2. Get SMTP credentials
3. Update environment variables:
```bash
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-login
SMTP_PASS=your-smtp-key
```

### Option B: Gmail (Development/Testing)
1. Enable 2FA on Gmail account
2. Generate App Password
3. Use in environment variables

## 🖼️ File Storage Setup (Cloudinary)

1. **Create Cloudinary Account**:
   - Go to [cloudinary.com](https://cloudinary.com)
   - Get API credentials

2. **Update Backend Configuration**:
```javascript
// Add to backend/middleware/upload.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
```

3. **Environment Variables**:
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🌐 Option 2: DigitalOcean/Heroku (Paid Options)

### Heroku Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create apps
heroku login
heroku create fenkparet-backend
heroku create fenkparet-frontend

# Deploy backend
cd backend
git init
heroku git:remote -a fenkparet-backend
git add .
git commit -m "Initial deployment"
git push heroku main

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
# ... (add all other env vars)
```

## 🔧 Production Environment Variables

### Backend (.env.production)
```bash
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/fenkparet
JWT_SECRET=super-secure-random-string-64-chars-long-for-production-use
JWT_REFRESH_SECRET=another-super-secure-random-string-64-chars-long
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://fenkparet.vercel.app
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-login
SMTP_PASS=your-brevo-smtp-key
SMTP_FROM=noreply@fenkparet.com
CONTACT_EMAIL=support@fenkparet.com
MONCASH_NUMBER=+50912345678
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend (.env.production)
```bash
NEXT_PUBLIC_API_URL=https://fenkparet-backend.railway.app
NEXT_PUBLIC_SITE_NAME=Fenkparet
NEXT_PUBLIC_SITE_URL=https://fenkparet.vercel.app
NEXT_PUBLIC_CURRENCY=HTG
```

## 🧪 Testing Your Deployment

### 1. Health Checks
```bash
# Test backend
curl https://your-backend-url.railway.app/
curl https://your-backend-url.railway.app/api

# Test frontend
# Visit https://your-frontend.vercel.app
```

### 2. API Testing
```bash
# Test product listing
curl https://your-backend-url.railway.app/api/products

# Test authentication
curl -X POST https://your-backend-url.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fenkparet.com","password":"admin123"}'
```

### 3. Frontend Testing
- [ ] Home page loads correctly
- [ ] Product browsing works
- [ ] User registration/login
- [ ] Cart functionality
- [ ] Admin panel access
- [ ] Mobile responsiveness

## 🔐 Security Configuration

### SSL/TLS (Automatic with Vercel/Railway)
- Vercel provides automatic SSL
- Railway provides automatic SSL
- Custom domains need DNS configuration

### CORS Configuration
Update backend CORS for production:
```javascript
// In server.js
const allowedOrigins = [
  'https://fenkparet.vercel.app',
  'https://your-custom-domain.com'
];
```

### Rate Limiting
```javascript
// Already configured in server.js
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

## 📱 Domain Setup (Optional)

### Custom Domain Configuration
1. **Purchase Domain** (GoDaddy, Namecheap, etc.)
2. **Configure DNS**:
   - Frontend: Point to Vercel
   - Backend: Point to Railway
3. **Update Environment Variables**

### DNS Records Example:
```
Type: CNAME
Host: www
Points to: cname.vercel-dns.com

Type: A
Host: @
Points to: 76.76.19.61 (Vercel IP)
```

## 🚨 Pre-Launch Checklist

### Critical Items:
- [ ] Production database configured
- [ ] Email service working
- [ ] File uploads working
- [ ] All environment variables set
- [ ] CORS configured for production URLs
- [ ] Admin user created
- [ ] Sample products added
- [ ] MonCash payment details updated

### Testing Checklist:
- [ ] User registration/login
- [ ] Product browsing and search
- [ ] Cart and checkout flow
- [ ] Order creation and tracking
- [ ] Admin panel functionality
- [ ] Mobile responsiveness
- [ ] Email notifications
- [ ] File uploads

## 📞 Support & Monitoring

### Error Monitoring
Consider adding:
- Sentry.io for error tracking
- LogRocket for user session recording
- Google Analytics for user behavior

### Performance Monitoring
- Lighthouse score optimization
- Core Web Vitals monitoring
- Database query optimization

## 🎯 Launch Strategy

### Soft Launch (Beta Testing)
1. Deploy to staging URLs
2. Share with 5-10 trusted users
3. Gather feedback and fix issues
4. Monitor performance and errors

### Public Launch
1. Update to production URLs
2. Create social media presence
3. Set up customer support channels
4. Monitor and respond to user feedback

## 💰 Cost Estimation (Monthly)

### Free Tier (Recommended for Start):
- **MongoDB Atlas**: Free (512MB)
- **Vercel**: Free (100GB bandwidth)
- **Railway**: Free (500 hours/month)
- **Cloudinary**: Free (25GB storage)
- **Brevo**: Free (300 emails/day)
- **Total**: $0/month

### Paid Tier (After Growth):
- **MongoDB Atlas**: ~$9/month (2GB)
- **Vercel Pro**: ~$20/month
- **Railway**: ~$5-20/month
- **Cloudinary**: ~$0.18/GB
- **Total**: ~$35-50/month

## 🚀 Ready to Deploy!

Your Fenkparet platform is ready for production deployment. Choose your deployment strategy and follow the steps above. The platform includes all necessary features for a successful e-commerce launch in the Haitian market.

**Recommended Quick Start**: Vercel + Railway + MongoDB Atlas (Free tier to start)