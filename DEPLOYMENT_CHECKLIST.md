# 🚀 Deployment Checklist

## Before Deployment

- [ ] Test app locally (backend on port 5001, frontend on port 3000)
- [ ] Create MongoDB Atlas account and cluster
- [ ] Create Render account
- [ ] Create Vercel account
- [ ] Prepare admin credentials

---

## Step 1: MongoDB Atlas Setup ☁️

- [ ] Go to https://cloud.mongodb.com
- [ ] Create new cluster (free tier is fine)
- [ ] Create database user with password
- [ ] Whitelist IP: `0.0.0.0/0` (allow from anywhere)
- [ ] Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/gym_db`
- [ ] Save connection string securely

---

## Step 2: Backend Deployment (Render) 🔧

- [ ] Go to https://dashboard.render.com
- [ ] Click "New +" → "Web Service"
- [ ] Connect your Git repository (or use public repo)
- [ ] Configure:
  - **Name**: gym-backend (or your choice)
  - **Root Directory**: `backend`
  - **Environment**: Node
  - **Build Command**: `npm install`
  - **Start Command**: `npm start`
  - **Instance Type**: Free

- [ ] Add Environment Variables:
  ```
  MONGODB_URI=your-mongodb-atlas-connection-string
  JWT_SECRET=your-random-secret-key-min-32-chars
  NODE_ENV=production
  ```

- [ ] Click "Create Web Service"
- [ ] Wait for deployment (5-10 minutes)
- [ ] Test: Visit `https://your-backend.onrender.com/api/health`
- [ ] Should see: `{"status":"healthy"}`
- [ ] **Copy your backend URL**: `https://your-backend.onrender.com`

---

## Step 3: Create Admin User 👤

Option A: Via backend terminal (Render dashboard)
```bash
node createAdmin.js
```

Option B: Via API call (Postman/curl)
```bash
curl -X POST https://your-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","email":"admin@gym.com","role":"admin"}'
```

- [ ] Admin user created successfully

---

## Step 4: Update Frontend Configuration 🎨

- [ ] Open `frontend/.env.production`
- [ ] Update with your Render backend URL:
  ```
  REACT_APP_API_URL=https://your-backend.onrender.com/api
  ```
- [ ] Save the file

- [ ] Update backend CORS in `backend/server.js`:
  - Change line 11: `? ['https://your-frontend.vercel.app', ...]`
  - Replace with your actual Vercel URL (you'll get this in next step)
  - Commit and redeploy backend if needed

---

## Step 5: Frontend Deployment (Vercel) 🌐

### Option A: Vercel CLI (Recommended)

- [ ] Install Vercel CLI:
  ```bash
  npm install -g vercel
  ```

- [ ] Login to Vercel:
  ```bash
  vercel login
  ```

- [ ] Deploy from frontend directory:
  ```bash
  cd frontend
  vercel
  ```

- [ ] Follow prompts:
  - Setup and deploy? **Y**
  - Scope: Choose your account
  - Link to existing project? **N**
  - Project name: **gym-frontend** (or your choice)
  - Directory: **./** (current directory)
  - Override settings? **N**

- [ ] For production deployment:
  ```bash
  vercel --prod
  ```

### Option B: Vercel Dashboard

- [ ] Go to https://vercel.com/dashboard
- [ ] Click "Add New" → "Project"
- [ ] Import your Git repository
- [ ] Configure:
  - **Framework Preset**: Create React App
  - **Root Directory**: `frontend`
  - **Build Command**: `npm run build`
  - **Output Directory**: `build`

- [ ] Add Environment Variable:
  - Key: `REACT_APP_API_URL`
  - Value: `https://your-backend.onrender.com/api`
  - Environment: Production

- [ ] Click "Deploy"
- [ ] Wait for deployment (3-5 minutes)
- [ ] **Copy your frontend URL**: `https://your-frontend.vercel.app`

---

## Step 6: Update Backend CORS 🔄

- [ ] Go back to `backend/server.js`
- [ ] Update line 11 with your actual Vercel URL:
  ```javascript
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-actual-frontend.vercel.app', 'http://localhost:3000']
    : '*',
  ```
- [ ] Commit changes
- [ ] Redeploy backend on Render (auto-deploys if Git connected)

---

## Step 7: Testing 🧪

- [ ] Visit your Vercel URL: `https://your-frontend.vercel.app`
- [ ] Test login with admin credentials
- [ ] Check dashboard loads
- [ ] Add a test member
- [ ] Test check-in/check-out
- [ ] Record a test payment
- [ ] Check all navigation works
- [ ] Test on mobile device

---

## Step 8: Final Configuration ✅

- [ ] Add custom domain (optional)
  - Vercel: Settings → Domains
  - Render: Settings → Custom Domain

- [ ] Enable HTTPS (should be automatic)
- [ ] Set up monitoring/logging
- [ ] Document your URLs:
  - **Backend**: _____________________
  - **Frontend**: _____________________
  - **Admin User**: _____________________
  - **Admin Pass**: _____________________

---

## Troubleshooting 🔧

### Backend won't connect to MongoDB
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Check MongoDB user permissions

### Frontend shows "Loading..." forever
- Check browser console for errors
- Verify REACT_APP_API_URL is correct
- Test backend health endpoint
- Check CORS settings

### CORS errors
- Add your Vercel domain to backend CORS whitelist
- Redeploy backend after changes

### 500 errors
- Check Render logs
- Verify all environment variables are set
- Check MongoDB connection

---

## Post-Deployment 📊

- [ ] Monitor Render dashboard for backend health
- [ ] Check Vercel analytics
- [ ] Set up error tracking (optional: Sentry)
- [ ] Create backups of MongoDB
- [ ] Document deployment for team

---

## Important URLs

- MongoDB Atlas: https://cloud.mongodb.com
- Render Dashboard: https://dashboard.render.com
- Vercel Dashboard: https://vercel.com/dashboard
- Your Backend: https://_________________________.onrender.com
- Your Frontend: https://_________________________.vercel.app

---

## Notes

- Render free tier sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- MongoDB Atlas free tier: 512MB storage
- Vercel free tier: Unlimited bandwidth, 100GB/month
