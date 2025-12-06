# ProcureFlix - Standalone Production Package

## 🎯 Quick Start (External Deployment)

This is a **completely standalone** Docker package for ProcureFlix, ready for deployment on any Ubuntu 24.04 server with Docker. No Emergent-specific dependencies required.

### Deploy in 5 Minutes

```bash
# 1. Configure
cp backend/.env.template backend/.env
nano backend/.env  # Add your OPENAI_API_KEY

# 2. Build & Start
docker compose build --no-cache
docker compose up -d

# 3. Verify
curl http://localhost:8001/api/health
# Open http://localhost in browser
```

**Default Login:** `admin@sourcevia.com` / `admin123`

---

## ✅ What's Included

- ✅ **Backend** - FastAPI + MongoDB (no emergentintegrations)
- ✅ **Frontend** - Pre-built React app (no yarn build in Docker)
- ✅ **AI Integration** - Standard OpenAI SDK with gpt-4o
- ✅ **Docker Config** - Complete docker-compose.yml
- ✅ **Documentation** - Comprehensive deployment guides
- ✅ **Seed Data** - Realistic procurement workflow demo data

---

## 📋 Requirements

- Ubuntu 24.04 (or any Linux with Docker)
- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- OpenAI API Key (for AI features, optional)

---

## 🚀 Deployment Options

### Option 1: Quick Local Test
```bash
docker compose up -d
```

### Option 2: Alibaba Cloud ECS
```bash
# See EXTERNAL_DEPLOYMENT_GUIDE.md
# Includes: Security group setup, firewall config, SSL setup
```

### Option 3: AWS / Azure / Other Cloud
```bash
# Standard Docker deployment
# See PRODUCTION_DEPLOYMENT.md
```

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **EXTERNAL_DEPLOYMENT_GUIDE.md** | ⭐ **START HERE** - Complete external deployment guide |
| DOCKER_TESTING_CHECKLIST.md | Phase-by-phase testing procedures |
| PRODUCTION_DEPLOYMENT.md | Full production deployment reference |
| DOCKER_VALIDATION_REPORT.md | Package validation details |
| PACKAGE_CONTENTS.md | Package structure and architecture |

---

## 🔧 Configuration

### Backend (.env file)

**Required:**
```bash
OPENAI_API_KEY=sk-your-key-here  # For AI features
```

**Optional:**
```bash
PROCUREFLIX_AI_ENABLED=false  # Disable AI if no key
ALLOWED_ORIGINS=https://your-domain.com  # For production CORS
```

### Ports

- **Frontend:** http://localhost:80
- **Backend API:** http://localhost:8001
- **API Docs:** http://localhost:8001/docs

---

## ✅ Verification

**Health Checks:**
```bash
# Backend
curl http://localhost:8001/api/health

# ProcureFlix
curl http://localhost:8001/api/procureflix/health

# Vendors (seed data)
curl http://localhost:8001/api/procureflix/vendors
```

**Container Status:**
```bash
docker compose ps
# All should show "Up (healthy)"
```

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Check logs
docker compose build --no-cache --progress=plain

# Verify requirements.txt is clean
grep emergentintegrations backend/requirements.txt  # Should be empty
```

### Backend Won't Start
```bash
# Check logs
docker compose logs backend

# Verify MongoDB is ready
docker compose logs mongo | grep "Waiting for connections"
```

### Frontend Shows 502
```bash
# Wait for backend health check
docker compose ps backend  # Wait for "healthy" status

# Check backend logs
docker compose logs backend --tail=50
```

---

## 🔐 Security Notes

### Default Passwords
- Change immediately after first login
- Admin: `admin@sourcevia.com` / `admin123`
- Update in MongoDB or via UI

### MongoDB
- Currently: No authentication (internal Docker network only)
- Production: Add authentication (see EXTERNAL_DEPLOYMENT_GUIDE.md)

### API Keys
- Store securely in .env files
- Never commit .env to version control
- Rotate regularly

---

## 📊 Package Info

**What Changed from Original:**
- ❌ Removed: `emergentintegrations==0.1.0` from requirements.txt
- ✅ Added: Pre-built frontend (build/ folder included)
- ✅ Changed: AI model to gpt-4o (from gpt-5)
- ✅ Updated: All configs to use standard OpenAI SDK
- ✅ Verified: Clean build on Ubuntu 24.04

**Build Process:**
1. Frontend pre-built with `yarn build`
2. Backend uses standard PyPI packages only
3. Docker images use official bases (python:3.11-slim, nginx:alpine)
4. No custom or private packages required

---

## 🎓 Key Features

### Core Modules
- Dashboard - Executive overview
- Vendors - Supplier management
- Tenders - RFP/RFQ processing
- Contracts - Contract lifecycle
- Purchase Orders - Procurement transactions
- Invoices - Payment processing
- Resources - Staff management
- OSR - Service requests

### Advanced Features
- 🤖 AI-powered risk analysis (vendors, contracts, tenders)
- 📊 Risk scoring and assessment
- 🔐 Role-based access control
- 🔄 Dual data backend (in-memory + SharePoint ready)
- 📝 Simplified creation APIs
- 🎨 Modern, responsive UI

---

## 🌐 URLs & Endpoints

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost | React UI |
| Backend API | http://localhost:8001 | FastAPI backend |
| API Docs | http://localhost:8001/docs | Interactive API documentation |
| Health Check | http://localhost:8001/api/health | Backend health |
| ProcureFlix Health | http://localhost:8001/api/procureflix/health | Module health |

---

## 🔄 Data & Persistence

### In-Memory Data (Default)
- ProcureFlix modules use in-memory storage
- Data seeded from JSON files on startup
- Lost on backend restart (by design for demo)
- 3 vendors, contracts, tenders included

### MongoDB (Persistent)
- User accounts and sessions
- Legacy Sourcevia data (if used)
- Persisted in Docker volume

### SharePoint (Optional)
- Architecture ready
- Requires credentials
- See SHAREPOINT_INTEGRATION.md

---

## 🚀 Scaling

### Horizontal Scaling
```yaml
backend:
  deploy:
    replicas: 3
```

### Vertical Scaling
- Increase server resources
- Adjust worker count in backend/Dockerfile

### External Database
- Use managed MongoDB (Atlas, Alibaba Cloud)
- Update MONGO_URL in .env

---

## 📞 Support

### For Deployment Issues
1. Check EXTERNAL_DEPLOYMENT_GUIDE.md
2. Review logs: `docker compose logs`
3. Verify requirements met

### For Application Issues
1. Check API docs: http://localhost:8001/docs
2. Review health endpoints
3. Check browser console for frontend errors

### For AI Issues
1. Verify OPENAI_API_KEY is set
2. Check OpenAI API status
3. Review backend logs for API errors

---

## ✅ Success Criteria

Your deployment is successful when:

- [ ] `docker compose ps` shows all containers healthy
- [ ] Backend API responds: `curl http://localhost:8001/api/health`
- [ ] Frontend loads in browser: `http://localhost`
- [ ] Login works with default credentials
- [ ] ProcureFlix modules load (vendors, tenders, etc.)
- [ ] No errors in container logs

---

## 🎉 You're Ready!

This package has been validated and is ready for production deployment. Follow the **EXTERNAL_DEPLOYMENT_GUIDE.md** for step-by-step instructions.

**Questions?** Check the documentation files listed above.

**Ready to deploy?** Start with: `docker compose build && docker compose up -d`

---

**Package Version:** 1.0 (Standalone)  
**Status:** ✅ Verified on Ubuntu 24.04 + Docker  
**Dependencies:** None (all standard public packages)  
**Build Date:** December 2024
