# 🚀 GitHub Pages Deployment Instructions

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and log in
2. Click the "+" button in the top right corner
3. Select "New repository"
4. Name it: `fenkparet` (or any name you prefer)
5. Make it **Public** (required for GitHub Pages)
6. **Don't** initialize with README (we already have files)
7. Click "Create repository"

## Step 2: Connect Your Local Repository

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/fenkparet.git

# Push your code to GitHub
git push -u origin main
```

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to "Pages" in the left sidebar
4. Under "Source", select "GitHub Actions"
5. The deployment will start automatically!

## Step 4: Your Live Site

After a few minutes, your site will be available at:
`https://YOUR_USERNAME.github.io/fenkparet`

## ✅ What's Already Set Up

- ✅ Repository initialized with git
- ✅ All files committed
- ✅ GitHub Actions workflow configured (`.github/workflows/deploy.yml`)
- ✅ Static build tested and working
- ✅ Next.js configured for static export

## 🎯 Features Ready for Testing

1. **Homepage** - Modern e-commerce landing page
2. **Products Page** - French interface with working cart
3. **Nouveautés Page** - Email signup for new products
4. **Contact Page** - Real social media links (open in new tabs)
5. **Admin Dashboard** - Product management interface
6. **Responsive Design** - Works on mobile and desktop

## 🔗 Test URLs (after deployment)

- Homepage: `https://YOUR_USERNAME.github.io/fenkparet/`
- Products: `https://YOUR_USERNAME.github.io/fenkparet/products`
- Nouveautés: `https://YOUR_USERNAME.github.io/fenkparet/nouveautes`
- Contact: `https://YOUR_USERNAME.github.io/fenkparet/contact`
- Admin: `https://YOUR_USERNAME.github.io/fenkparet/admin/dashboard`

## 📱 Social Media Links (Real URLs)

- Facebook: https://www.facebook.com/share/1CMGWQkgvc/
- Instagram: https://www.instagram.com/fenkparet?igsh=MWo0Mm1xZDgwNjlwaQ==
- X (Twitter): https://x.com/FenkParet?t=ufb_v0B_D4Qj4AIc-G_8HQ&s=09
- YouTube: https://youtube.com/@fenkparet2862?si=c46Fqko-Y0PIhQdS
- TikTok: https://www.tiktok.com/@fenkparet?_t=ZM-8xbHrr8LfYj&_r=1
- WhatsApp: https://wa.me/50947458821

## 🐛 If You Need Help

If you encounter any issues:
1. Check the "Actions" tab in your GitHub repository
2. Look for any failed deployments
3. The deployment usually takes 2-5 minutes

## 🎉 You're Ready!

Once deployed, share the GitHub Pages URL with your testers!