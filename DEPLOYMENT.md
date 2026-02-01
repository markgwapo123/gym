# Deployment Guide

## Backend Deployment (Render)

### Prerequisites
- MongoDB Atlas account (for cloud database)
- Render account

### Steps

1. **Setup MongoDB Atlas**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a new cluster (free tier available)
   - Click "Connect" → "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/gym_db`)

2. **Deploy to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository OR use "Public Git repository"
   - Configure:
     - **Name**: gym-backend (or your choice)
     - **Root Directory**: `backend`
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
   
3. **Add Environment Variables in Render**
   - Go to your service → "Environment"
   - Add these variables:
     ```
     MONGODB_URI=your-mongodb-atlas-connection-string
     JWT_SECRET=create-a-random-secret-key-here
     NODE_ENV=production
     ```

4. **Note Your Backend URL**
   - After deployment, Render will give you a URL like: `https://your-app-name.onrender.com`
   - Save this URL - you'll need it for the frontend

---

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account
- Backend deployed and URL ready

### Steps

1. **Update Environment Variable**
   - Open `frontend/.env.production`
   - Replace `https://gym-bfda.onrender.com/api` with your actual Render backend URL + `/api`
   - Example: `REACT_APP_API_URL=https://your-backend.onrender.com/api`

2. **Deploy to Vercel**

   **Option A: Using Vercel CLI**
   ```bash
   cd frontend
   npm install -g vercel
   vercel login
   vercel
   ```

   **Option B: Using Vercel Dashboard**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository OR drag & drop the `frontend` folder
   - Configure:
     - **Framework Preset**: Create React App
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`
   
3. **Add Environment Variables in Vercel**
   - Go to your project → "Settings" → "Environment Variables"
   - Add:
     ```
     REACT_APP_API_URL=https://your-backend.onrender.com/api
     ```
   - Apply to: Production

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be available at: `https://your-app-name.vercel.app`

---

## Testing Your Deployment

1. Visit your Vercel URL
2. Try logging in (default admin credentials)
3. Check if dashboard loads
4. Test creating a member
5. Test attendance and payments

## Troubleshooting

### Backend Issues
- Check Render logs for errors
- Verify MongoDB connection string is correct
- Ensure JWT_SECRET is set

### Frontend Issues
- Check browser console for errors
- Verify REACT_APP_API_URL points to correct backend
- Check Vercel deployment logs
- Make sure CORS is enabled on backend (already configured)

### CORS Errors
If you see CORS errors, update backend's CORS configuration in `server.js` to include your Vercel domain.

---

## Quick Commands

### Local Development
```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm start
```

### Production URLs
- Backend: https://your-backend.onrender.com
- Frontend: https://your-frontend.vercel.app

---

## Important Notes

1. **Free Tier Limitations**:
   - Render free tier may sleep after inactivity (takes ~30 seconds to wake up)
   - MongoDB Atlas free tier has storage limits

2. **Security**:
   - Never commit `.env` files to Git
   - Use strong JWT secrets
   - Regularly update dependencies

3. **First Time Setup**:
   - Create an admin user using the `createAdmin.js` script before deploying
   - Or deploy backend first and create admin via API
