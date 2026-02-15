# FREE Deployment Setup

This document explains how to deploy your Inventra app completely FREE using:
- **Frontend**: Vercel (Free forever)
- **Backend**: Railway (Free tier with $5/month credit)
- **Database**: MongoDB Atlas (Free tier)

---

## 🎯 Quick Deploy (5 Steps)

### Step 1: MongoDB Atlas (Database - FREE)
```bash
1. Visit: https://www.mongodb.com/cloud/atlas
2. Sign up FREE
3. Create M0 cluster (free forever)
4. Create user: inventra_user / your_password
5. Whitelist IP: 0.0.0.0/0
6. Get connection string and save it
```

**Connection String Format:**
```
mongodb+srv://inventra_user:password@cluster0.xxxxx.mongodb.net/inventra_db?retryWrites=true&w=majority
```

---

### Step 2: Railway Backend (FREE)
```bash
1. Visit: https://railway.app
2. Sign up with GitHub
3. Create new project → Deploy from GitHub
4. Select: Inventra-Smart-Inventory-Manager
5. Add Variables:
   - MONGO_URI: [paste your MongoDB connection string]
   - JWT_SECRET: your-secret-key-123
   - JWT_EXPIRE: 7d
   - PORT: 3001
   - NODE_ENV: production
6. Deploy!
7. Get your Railway URL: https://inventra-api-xxxxx.railway.app
```

---

### Step 3: Update Frontend API URLs
```bash
Run this command in project root:
node update-api-urls.js https://inventra-api-xxxxx.railway.app
```

This will automatically update all API calls in your frontend!

---

### Step 4: Vercel Frontend (FREE)
```bash
1. Visit: https://vercel.com
2. Sign up with GitHub
3. Click "Import Project"
4. Select: Inventra-Smart-Inventory-Manager
5. Choose framework: React
6. Click Deploy!
7. Wait ~3 minutes
8. Your app is LIVE! 🎉
```

**Your URL will be:** `https://inventra-xxxxx.vercel.app`

---

### Step 5: Share Your App
```
Frontend: https://inventra-xxxxx.vercel.app
Backend: https://inventra-xxxxx.railway.app
```

---

## 📊 FREE Tier Limits

| Service | Free Tier | Cost |
|---------|-----------|------|
| MongoDB Atlas | 512 MB storage | FREE |
| Railway | $5/month credit | FREE (pay after) |
| Vercel | Unlimited deploys | FREE |
| **TOTAL** | Full stack! | **FREE** |

---

## ⚡ Important Notes

1. **Railway**: You get $5/month free credit (covers 1 small backend)
2. **MongoDB**: Free tier good for ~1000 users
3. **Vercel**: Completely free, unlimited deployments
4. **Auto-Deploy**: Both Railway and Vercel auto-deploy when you push to GitHub!

---

## 🔧 Environment Variables for Railway

Copy and paste into Railway dashboard:

```
MONGO_URI=mongodb+srv://inventra_user:PASSWORD@cluster0.xxxxx.mongodb.net/inventra_db?retryWrites=true&w=majority
JWT_SECRET=inventra_super_secret_key_2026
JWT_EXPIRE=7d
PORT=3001
NODE_ENV=production
```

---

## ✅ Verification Checklist

- [ ] Frontend loads at Vercel URL
- [ ] Can sign up / login
- [ ] Can add products
- [ ] Can create invoices
- [ ] Can view sales history
- [ ] Can view analytics
- [ ] Delete products work
- [ ] Everything functional!

---

## 🆘 If Something Fails

**Frontend won't load:**
- Check browser console (F12) for errors
- Verify Railway URL is correct in all API calls
- Check CORS is enabled in backend

**Backend crashes:**
- Click Railway project → View Logs
- Check MongoDB connection string
- Verify environment variables are set

**Can't connect to database:**
- Test MongoDB Atlas connection locally first
- Verify IP whitelist is 0.0.0.0/0
- Check username/password in connection string

---

## 📈 After Deployment

1. Share your app link with others
2. Monitor usage on Railway dashboard
3. Add more data / products
4. Performance will be great!

---

**Total Cost: $0 (FREE FOREVER for reasonable usage!)** 💰

Good luck! 🚀
