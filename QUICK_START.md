# QuoteCraft - Quick Start Guide

**Get QuoteCraft running in 5 minutes!**

---

## 🚀 Fastest Way to Start

### Windows Users

**Option 1: Development Mode (Recommended)**
```bash
# Double-click this file:
start-dev.bat

# Or run from command prompt:
.\start-dev.bat
```

**Option 2: Docker Mode**
```bash
# Double-click this file:
start-docker.bat

# Or run from command prompt:
.\start-docker.bat
```

### Mac/Linux Users

**Development Mode:**
```bash
# Terminal 1: Start Backend
cd quotecraft-backend
npm install
npm run dev

# Terminal 2: Start Frontend
cd QuoteCraft-frontend
npm install
npm run dev
```

**Docker Mode:**
```bash
docker-compose up --build
```

---

## 📍 Access Points

Once started, access the application at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **KPI Dashboard**: http://localhost:3000 (click "KPIs" in nav)

---

## 🎯 Quick Demo Workflow

### 1. Upload BOQ
- Go to http://localhost:3000
- Click "Upload BOQ"
- Select `quotecraft-backend/sample-data/sample-boq.json`
- Click "Upload"

### 2. Upload Vendor Quotes
- Click "Upload Quotes"
- Select `sample-quote-vendor1.json`
- Enter vendor name: "Best Supply Co."
- Repeat for vendor2 and vendor3

### 3. Create Comparison
- Click "Create Comparison"
- View automated vendor analysis
- See best vendor recommendation
- Check cost savings

### 4. Approve/Reject
- Click "Approve" or "Reject"
- Enter your email
- Add optional comment
- Submit decision

### 5. View KPIs
- Click "KPIs" in navigation
- See processing metrics
- Check cost savings
- Review efficiency gains

---

## ✅ Verification

### Check Backend is Running
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-11-22T...",
  "environment": "development",
  "uptime": 123.456
}
```

### Check Frontend is Running
Open http://localhost:3000 in your browser. You should see the QuoteCraft homepage.

### Check API is Working
```bash
curl http://localhost:3001/api/kpi
```

Expected response:
```json
{
  "success": true,
  "data": {
    "totalProcessed": 0,
    "avgProcessingTime": "0.00s",
    "stpRate": 0,
    ...
  }
}
```

---

## 🚨 Troubleshooting

### Port Already in Use

**Backend (Port 3001):**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

**Frontend (Port 3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Dependencies Not Installed

```bash
# Backend
cd quotecraft-backend
npm install

# Frontend
cd QuoteCraft-frontend
npm install
```

### Build Errors

```bash
# Backend
cd quotecraft-backend
npm run build

# Frontend
cd QuoteCraft-frontend
npm run build
```

### Docker Issues

```bash
# Stop all containers
docker-compose down

# Remove volumes
docker-compose down -v

# Rebuild
docker-compose up --build
```

---

## 📖 Next Steps

1. **Configure watsonx Agent** (Optional)
   - See [watsonx/SETUP_CHECKLIST.md](watsonx/SETUP_CHECKLIST.md)
   - Follow step-by-step instructions
   - Test agent integration

2. **Explore Documentation**
   - [README.md](README.md) - Main documentation
   - [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Deployment guide
   - [QuoteCraft.md](QuoteCraft.md) - Complete specification

3. **Customize Configuration**
   - Edit `quotecraft-backend/.env`
   - Edit `QuoteCraft-frontend/.env`
   - Configure integrations (Slack, ERP, etc.)

---

## 💡 Tips

- Use **Development Mode** for testing and development
- Use **Docker Mode** for production-like environment
- Check logs in terminal for debugging
- Use browser DevTools to inspect API calls
- Sample data is in `quotecraft-backend/sample-data/`

---

## 🎉 Success!

If you can:
- ✅ Access http://localhost:3000
- ✅ Upload a BOQ file
- ✅ Create a comparison
- ✅ View KPIs

**You're all set!** QuoteCraft is running successfully.

---

**Need Help?**
- Check [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- Review [README.md](README.md)
- See [watsonx/README.md](watsonx/README.md)

**Last Updated**: November 22, 2025
