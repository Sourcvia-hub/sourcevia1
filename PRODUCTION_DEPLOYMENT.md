# ProcureFlix - Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying ProcureFlix to production environments, including Alibaba Cloud, AWS, Azure, or any Docker-compatible infrastructure.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (Local Testing)](#quick-start-local-testing)
3. [Configuration](#configuration)
4. [Production Deployment](#production-deployment)
5. [Alibaba Cloud Deployment](#alibaba-cloud-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For cloning the repository

### Required API Keys (Choose One)

**For AI Features:**
- OpenAI API Key (recommended for production)
- OR Anthropic Claude API Key
- OR Google Gemini API Key

**For SharePoint Integration (Optional):**
- Azure AD App Registration (Client ID, Client Secret, Tenant ID)
- SharePoint Site URL

---

## Quick Start (Local Testing)

### 1. Clone or Extract the Repository

```bash
cd /path/to/procureflix
```

### 2. Configure Environment Variables

```bash
# Backend configuration
cp backend/.env.template backend/.env

# Frontend configuration
cp frontend/.env.template frontend/.env
```

Edit `backend/.env` and add your OpenAI API key:
```bash
OPENAI_API_KEY=your-openai-api-key-here
```

### 3. Build and Start Services

```bash
# Build all containers
docker compose build

# Start all services
docker compose up -d

# Check service status
docker compose ps
```

### 4. Verify Deployment

**Backend Health Check:**
```bash
curl http://localhost:8001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "api_version": "1.0"
}
```

**ProcureFlix API:**
```bash
curl http://localhost:8001/api/procureflix/vendors
```

**Frontend:**
Open browser: `http://localhost:80`

### 5. Default Login Credentials

**Admin Account:**
- Email: `admin@sourcevia.com`
- Password: `admin123`

**Procurement Officer:**
- Email: `po@sourcevia.com`
- Password: `po123456`

**Operations User:**
- Email: `user@sourcevia.com`
- Password: `user12345`

---

## Configuration

### Backend Environment Variables

Edit `backend/.env`:

```bash
# Database
MONGO_URL=mongodb://mongo:27017/procureflix

# Data Backend (memory or sharepoint)
PROCUREFLIX_DATA_BACKEND=memory

# AI Configuration
PROCUREFLIX_AI_ENABLED=true
PROCUREFLIX_AI_PROVIDER=openai
PROCUREFLIX_AI_MODEL=gpt-4
OPENAI_API_KEY=your-key-here

# CORS (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:80,https://your-domain.com

# Application
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO
```

### Frontend Environment Variables

Edit `frontend/.env`:

```bash
# Backend API URL
REACT_APP_BACKEND_URL=http://localhost:8001

# For production (use your actual domain)
# REACT_APP_BACKEND_URL=https://api.your-domain.com

# Application Info
REACT_APP_NAME=ProcureFlix
REACT_APP_VERSION=1.0.0
```

### SharePoint Configuration (Optional)

If using SharePoint for data persistence, add to `backend/.env`:

```bash
PROCUREFLIX_DATA_BACKEND=sharepoint
SHAREPOINT_SITE_URL=https://your-tenant.sharepoint.com/sites/ProcureFlix
SHAREPOINT_TENANT_ID=your-tenant-id
SHAREPOINT_CLIENT_ID=your-client-id
SHAREPOINT_CLIENT_SECRET=your-client-secret
```

---

## Production Deployment

### Architecture Overview

```
┌─────────────┐
│   Internet  │
└──────┬──────┘
       │
┌──────┴──────────────┐
│  Load Balancer      │
│  (Port 443 HTTPS)   │
└──────┬──────────────┘
       │
┌──────┴──────────────┐
│  Frontend (Nginx)   │
│  Port 80           │
│  - Static files     │
│  - API proxy        │
└──────┬──────────────┘
       │
┌──────┴──────────────┐
│  Backend (FastAPI)  │
│  Port 8001         │
│  - REST API         │
│  - Business logic   │
└──────┬──────────────┘
       │
┌──────┴──────────────┐
│  MongoDB            │
│  Port 27017        │
│  - Data storage     │
└─────────────────────┘
```

### Production Checklist

- [ ] Configure production domain names
- [ ] Set up SSL/TLS certificates
- [ ] Configure proper CORS origins
- [ ] Set strong database passwords
- [ ] Enable application logging
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy
- [ ] Review security settings
- [ ] Set up CI/CD pipeline
- [ ] Document deployment process

### Docker Compose Production Configuration

For production, update `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongo:
    image: mongo:7.0
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: procureflix
    volumes:
      - mongo-data:/data/db
    networks:
      - procureflix-network
    # Only expose internally
    expose:
      - "27017"

  backend:
    build: ./backend
    restart: always
    environment:
      - MONGO_URL=mongodb://admin:${MONGO_ROOT_PASSWORD}@mongo:27017/procureflix?authSource=admin
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
      - ENVIRONMENT=production
      - DEBUG=false
    volumes:
      - backend-logs:/var/log/procureflix
    depends_on:
      - mongo
    networks:
      - procureflix-network
    # Only expose internally
    expose:
      - "8001"

  frontend:
    build: ./frontend
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
    networks:
      - procureflix-network

networks:
  procureflix-network:
    driver: bridge

volumes:
  mongo-data:
  backend-logs:
```

---

## Alibaba Cloud Deployment

### Option 1: Elastic Compute Service (ECS)

**1. Create ECS Instance**

```bash
# Recommended specifications:
- vCPU: 4 cores
- Memory: 8 GB
- Storage: 100 GB SSD
- OS: Ubuntu 22.04 LTS
- Region: Select closest to your users
```

**2. Install Docker & Docker Compose**

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

**3. Deploy Application**

```bash
# Transfer files to ECS
scp -r /path/to/procureflix user@your-ecs-ip:/opt/procureflix

# SSH into ECS
ssh user@your-ecs-ip

# Navigate to project directory
cd /opt/procureflix

# Configure environment
cp backend/.env.template backend/.env
nano backend/.env  # Add your API keys

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f
```

**4. Configure Security Groups**

```
Inbound Rules:
- Port 80 (HTTP): 0.0.0.0/0
- Port 443 (HTTPS): 0.0.0.0/0
- Port 22 (SSH): Your IP only

Outbound Rules:
- All traffic: 0.0.0.0/0
```

### Option 2: Container Service for Kubernetes (ACK)

**1. Create ACK Cluster**

```bash
# Use Alibaba Cloud Console to create ACK cluster
- Cluster Type: Managed Kubernetes
- Version: 1.26 or higher
- Node Pool: 3 nodes (4 vCPU, 8 GB each)
```

**2. Deploy Using Kubernetes Manifests**

```yaml
# procureflix-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: procureflix-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: procureflix-backend
  template:
    metadata:
      labels:
        app: procureflix-backend
    spec:
      containers:
      - name: backend
        image: your-registry/procureflix-backend:latest
        ports:
        - containerPort: 8001
        env:
        - name: MONGO_URL
          valueFrom:
            secretKeyRef:
              name: procureflix-secrets
              key: mongo-url
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: procureflix-secrets
              key: openai-api-key
```

### Option 3: Serverless App Engine (SAE)

**1. Package Application**

```bash
# Build Docker images
docker build -t procureflix-backend:latest ./backend
docker build -t procureflix-frontend:latest ./frontend

# Push to Alibaba Container Registry
docker tag procureflix-backend:latest registry.cn-hangzhou.aliyuncs.com/your-namespace/procureflix-backend:latest
docker push registry.cn-hangzhou.aliyuncs.com/your-namespace/procureflix-backend:latest
```

**2. Deploy to SAE**

Use Alibaba Cloud Console to:
1. Create SAE application
2. Configure container image
3. Set environment variables
4. Configure auto-scaling rules
5. Bind custom domain

---

## Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl http://your-domain.com/api/health

# ProcureFlix-specific health
curl http://your-domain.com/api/procureflix/health

# Check all containers
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Database Backup

```bash
# Backup MongoDB
docker-compose exec mongo mongodump --out=/data/backup

# Copy backup to host
docker cp procureflix-mongo:/data/backup ./backup-$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
BACKUP_DIR="/opt/backups/procureflix"
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T mongo mongodump --archive --gzip > $BACKUP_DIR/backup_$DATE.gz
find $BACKUP_DIR -type f -mtime +7 -delete  # Keep 7 days
```

### Log Rotation

```bash
# Configure logrotate
sudo nano /etc/logrotate.d/procureflix

/var/lib/docker/containers/*/*.log {
  rotate 7
  daily
  compress
  missingok
  delaycompress
  copytruncate
}
```

### Performance Monitoring

```bash
# Monitor resource usage
docker stats

# Check disk space
df -h

# Monitor MongoDB
docker-compose exec mongo mongostat
```

---

## Troubleshooting

### Services Not Starting

```bash
# Check Docker logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongo

# Restart specific service
docker-compose restart backend

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### API Not Responding

```bash
# Check backend container
docker-compose exec backend ps aux

# Test backend directly
curl http://localhost:8001/api/health

# Check MongoDB connection
docker-compose exec backend python -c "from pymongo import MongoClient; print(MongoClient(os.getenv('MONGO_URL')).server_info())"
```

### Frontend Not Loading

```bash
# Check nginx logs
docker-compose logs frontend

# Verify nginx configuration
docker-compose exec frontend nginx -t

# Check API proxy
curl -I http://localhost/api/health
```

### AI Features Not Working

```bash
# Verify API key is set
docker-compose exec backend printenv | grep API_KEY

# Check AI client initialization
docker-compose logs backend | grep "AI Client"

# Test AI endpoint manually
curl http://localhost:8001/api/procureflix/vendors/vendor-tech-innovate/ai/risk-explanation
```

### Database Connection Issues

```bash
# Check MongoDB status
docker-compose exec mongo mongosh --eval "db.adminCommand('ping')"

# Verify connection string
docker-compose exec backend printenv MONGO_URL

# Check MongoDB logs
docker-compose logs mongo
```

---

## Security Best Practices

1. **SSL/TLS Encryption**
   - Use Let's Encrypt for free SSL certificates
   - Configure HTTPS redirection in nginx

2. **Environment Variables**
   - Never commit `.env` files to version control
   - Use secrets management in production
   - Rotate API keys regularly

3. **Database Security**
   - Set strong MongoDB passwords
   - Enable MongoDB authentication
   - Restrict database access to backend only

4. **Network Security**
   - Configure firewall rules
   - Use private networks for inter-service communication
   - Implement rate limiting

5. **Application Security**
   - Keep Docker images updated
   - Regular security audits
   - Monitor for vulnerabilities

---

## Support & Documentation

- **Application Documentation**: See README.md
- **SharePoint Integration**: See SHAREPOINT_INTEGRATION.md
- **Simplified Creation**: See SIMPLIFIED_VENDOR_CREATION.md
- **API Documentation**: Access at `http://your-domain.com/docs`

---

## License

Copyright © 2025 ProcureFlix. All rights reserved.
