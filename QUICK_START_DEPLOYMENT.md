# Quick Start: Deploy in 20 Minutes

Follow these steps to deploy your Inventra Smart Inventory Manager to production for **FREE**.

---

## Step 1: MongoDB Atlas Setup (5 min)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up with email (select "Free Forever")
3. Create M0 cluster (completely free - 512 MB storage)
4. Set username/password (remember these!)
5. Click "Add My Current IP Address" → then change to `0.0.0.0/0`
6. Click "Connect" → Copy connection string
7. Replace `<password>` with your actual password
8. Format: `mongodb+srv://username:PASSWORD@cluster.xxxxx.mongodb.net/inventra_db`

---

## Step 2: Deploy Backend to Railway (5 min)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "Create New Project" → "Deploy from GitHub repo"
4. Select: Inventra-Smart-Inventory-Manager
5. Add these environment variables:
   - `MONGO_URI` = your MongoDB connection string from Step 1
   - `JWT_SECRET` = any random string (e.g., `super-secret-key-2024`)
   - `JWT_EXPIRE` = `7d`
   - `PORT` = `3001`
   - `NODE_ENV` = `production`
6. Click Deploy
7. Wait 2 min for build to finish
8. Copy your Railway URL (looks like: `https://xxxx.railway.app`)

---

## Step 3: Update API URLs (1 min)

1. Open terminal in your project root
2. Run:
   ```bash
   node update-api-urls.js https://your-railway-url-from-step-2.railway.app
   ```
3. This updates all 7 frontend files automatically
4. Commit changes:
   ```bash
   git add .
   git commit -m "Update API URLs for production"
   git push
   ```

---

## Step 4: Deploy Frontend to Vercel (5 min)

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Import Project"
4. Select: Inventra-Smart-Inventory-Manager
5. Framework: React
6. Click "Deploy"
7. Wait 3-5 min
8. Your live URL appears (save this!)

---

## Step 5: Test Everything (2 min)

1. Open your Vercel URL
2. Sign up with test account
3. Add 3-5 products with quantities
4. Go to Invoice → Create invoice
5. Select products and confirm
6. Check that stock decreased ✓
7. Go to Analytics → Verify metrics ✓
8. Go to History → Verify invoice appears ✓

---

## ✅ You're Live!

Your app is now live and accessible to everyone. 

**Total Cost: $0**
- MongoDB: Free tier
- Railway: $5/month free credit (more than enough)
- Vercel: Completely free

---

## Troubleshooting

**Products not loading?**
- Check Railway logs
- Verify MongoDB connection string in Railway env variables
- Database user password doesn't contain `@` or `:` (special chars cause issues)

**Can't log in?**
- Check backend is running (Railway dashboard → Logs)
- Clear browser localStorage and try again
- Check JWT_SECRET is set in Railway

**Print invoice showing blank page?**
- This is normal - browser print preview doesn't load images
- Use browser's "Print to PDF" to save invoice
- On actual print, images will appear

---

## Next Steps

- Share your live URL with users
- Monitor Railway dashboard for errors
- Keep GitHub updated with features
- Test monthly to ensure everything works

