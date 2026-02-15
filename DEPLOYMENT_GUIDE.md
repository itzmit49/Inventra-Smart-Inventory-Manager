# 🚀 Deployment Guide - Inventra Smart Inventory Manager

## Overview
- **Frontend**: React app deployed on Vercel
- **Backend**: Node.js/Express API deployed on Railway
- **Database**: MongoDB Atlas (Cloud)

---

## ✅ Pre-Deployment Checklist

### 1. MongoDB Atlas Setup (Cloud Database)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (M0 free tier)
4. Create a database user with username & password
5. Whitelist your IP: Click "Network Access" → "Allow Access from Anywhere" (0.0.0.0/0)
6. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

### 2. Backend Preparation
Your backend is already configured with:
- ✅ Environment variables via `.env`
- ✅ JWT authentication
- ✅ CORS enabled
- ✅ All routes protected

### 3. Frontend Configuration
Update API endpoints from localhost to production URL:
- Change `http://localhost:3001` → `your-railway-backend-url`

---

## 📋 Step 1: Deploy Backend to Railway

### 1.1 Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Create a new project

### 1.2 Connect GitHub Repository
1. In Railway: Click "New Project" → "Deploy from GitHub"
2. Select your `Inventra-Smart-Inventory-Manager` repository
3. Click "Import"

### 1.3 Add Environment Variables
In Railway dashboard, go to **Variables** and add:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/inventra
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
PORT=3001
NODE_ENV=production
```

### 1.4 Deploy
1. Click "Deploy" button
2. Wait for build to complete
3. Copy your Railway backend URL (e.g., `https://inventra-api.railway.app`)

---

## 🎨 Step 2: Update Frontend with Backend URL

### 2.1 Update API Endpoint
In your frontend, update all API calls from:
```javascript
http://localhost:3001
```
To:
```javascript
https://your-railway-url.railway.app
```

**Files to update:**
- `src/context/AuthContext.js` - Auth API calls
- `src/components/Products.js` - Product API calls
- `src/components/InsertProduct.js` - Insert API calls
- `src/components/UpdateProduct.js` - Update API calls
- `src/components/InvoiceGenerator.js` - Invoice API calls
- `src/components/SalesHistory.js` - Sales API calls
- `src/components/SalesAnalytics.js` - Analytics API calls

### 2.2 Example Update (AuthContext.js)
Change:
```javascript
const res = await fetch('http://localhost:3001/api/auth/signup', {
```
To:
```javascript
const res = await fetch('https://your-railway-url.railway.app/api/auth/signup', {
```

---

## 🚀 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Import Project"

### 3.2 Import GitHub Repository
1. Select your GitHub repository
2. Choose "Framework": **React**
3. Click "Import"

### 3.3 Environment Variables (if needed)
1. Go to Settings → Environment Variables
2. Add (if using env vars):
```
REACT_APP_API_URL=https://your-railway-url.railway.app
```

### 3.4 Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your app is live! 🎉

**Your frontend URL**: `https://your-project.vercel.app`

---

## 🔗 CORS Configuration

For Railway backend to accept requests from Vercel frontend:

In `Backend/index.js`, update CORS:
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-vercel-url.vercel.app',
    'https://inventra-app.vercel.app' // Your actual Vercel URL
  ],
  credentials: true
}));
```

Then redeploy to Railway.

---

## 🧪 Testing Your Deployment

1. Visit your Vercel frontend URL
2. Sign up with a test account
3. Add a product
4. Create an invoice
5. Check sales analytics
6. Delete a product

---

## 📊 Recommended Enhancements

After deployment, consider:
- ✅ Add error logging (Sentry)
- ✅ Monitor performance (Datadog)
- ✅ Add SSL certificates (included on both platforms)
- ✅ Set up auto-deploys from GitHub

---

## 🆘 Troubleshooting

### Frontend can't connect to backend
- Check that Railway backend URL is correct in all API calls
- Verify CORS is properly configured
- Check Network tab in browser DevTools

### Backend crashes on Railway
- Check logs in Railway dashboard
- Verify MongoDB connection string
- Ensure all environment variables are set

### MongoDB connection errors
- Verify MongoDB Atlas credentials
- Check IP whitelist (should be 0.0.0.0/0 for cloud)
- Confirm database name in connection string

---

## 📝 Summary

| Component | Platform | URL Pattern |
|-----------|----------|-------------|
| Frontend | Vercel | `https://your-project.vercel.app` |
| Backend | Railway | `https://your-project.railway.app` |
| Database | MongoDB Atlas | `mongodb+srv://...` |

---

**Total Deployment Time**: ~15-20 minutes

**Cost**: FREE! (Using free tiers of all services)

Good luck with your deployment! 🚀
