# Gym Management System - Full JavaScript Stack

A complete gym management system built with **Node.js/Express** backend and **React.js** frontend using **MongoDB** database.

## 🚀 Features

✅ **Member Management** - Add, edit, and manage gym members  
✅ **Attendance Tracking** - Check-in and check-out system  
✅ **Payment Management** - Record payments and auto-activate memberships  
✅ **Dashboard** - Real-time statistics and insights  
✅ **User Roles** - Admin and Staff access control  
✅ **Automatic Status Updates** - Active, Expiring Soon, Expired  

## 📦 Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## ⚙️ Prerequisites

- **Node.js** (v16+) - [Download](https://nodejs.org/)
- **MongoDB** - Local or MongoDB Atlas cloud

### Installing MongoDB on Windows

**Option 1: Local MongoDB**
1. Download: https://www.mongodb.com/try/download/community
2. Install and start as Windows service
3. Verify: `Get-Service -Name MongoDB*`

**Option 2: MongoDB Atlas (Cloud - Recommended)**
1. Sign up: https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `backend/.env`

## 🚀 Running the Application

### Step 1: Start MongoDB

```powershell
# Check if MongoDB is running
Get-Service -Name MongoDB*

# Start if needed
Start-Service MongoDB
```

### Step 2: Start Backend (Port 5001)

```powershell
cd d:\boygym\backend
node server.js
```

You should see:
```
🚀 Server running on port 5001
✅ MongoDB Connected
```

### Step 3: Start Frontend (Port 3000)

```powershell
cd d:\boygym\frontend
npm start
```

Opens automatically at **http://localhost:3000**

### Step 4: Create Admin User

```powershell
cd d:\boygym\backend
node createAdmin.js
```

Output:
```
✅ Admin user created successfully!
Username: admin
Password: admin123
```

## 🔐 Login

1. Open **http://localhost:3000**
2. Username: `admin`
3. Password: `admin123`

## 💰 Membership Plans

- **Monthly**: ₱500 (30 days)
- **Quarterly**: ₱1,350 (90 days)
- **Annual**: ₱5,000 (365 days)

## 🐛 Troubleshooting

### MongoDB Not Running

```powershell
# Start MongoDB service
Start-Service MongoDB

# Or use MongoDB Atlas connection string in backend/.env
```

### Port Already in Use

```powershell
# Find process using port
netstat -ano | findstr :5001

# Kill process (replace PID)
taskkill /PID <PID> /F
```

## 📝 Quick Start Summary

```powershell
# 1. Start MongoDB
Start-Service MongoDB

# 2. Start Backend (Terminal 1)
cd d:\boygym\backend
node server.js

# 3. Start Frontend (Terminal 2)
cd d:\boygym\frontend
npm start

# 4. Create Admin (Terminal 3)
cd d:\boygym\backend
node createAdmin.js

# 5. Login at http://localhost:3000
# Username: admin | Password: admin123
```

## ✅ Current Status

✅ Backend installed and ready (Node.js/Express)  
✅ Frontend installed and ready (React)  
✅ Backend running on port 5001  
✅ Frontend starting on port 3000  
⚠️ **Next**: Install/start MongoDB, then create admin user

---

**Made with Node.js, Express, React, and MongoDB**
# gym
