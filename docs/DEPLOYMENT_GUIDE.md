# 🚀 Deployment Guide

Complete guide for deploying the Digital E-Commerce Backend to production environments.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Deployment Options](#deployment-options)
4. [MongoDB Atlas Setup](#mongodb-atlas-setup)
5. [Deploying to Heroku](#deploying-to-heroku)
6. [Deploying to AWS EC2](#deploying-to-aws-ec2)
7. [Deploying with Docker](#deploying-with-docker)
8. [Deploying to Vercel](#deploying-to-vercel)
9. [CI/CD with GitHub Actions](#cicd-with-github-actions)
10. [Post-Deployment](#post-deployment)
11. [Monitoring & Logging](#monitoring--logging)
12. [Backup Strategy](#backup-strategy)

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing (`npm test`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Code formatted (`npm run format`)
- [ ] No `console.log()` statements
- [ ] No commented-out code
- [ ] Dependencies up to date (`npm audit fix`)

### Security

- [ ] All secrets in environment variables
- [ ] Strong JWT secrets (32+ characters)
- [ ] HTTPS enabled
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] `.env` file in `.gitignore`

### Configuration

- [ ] `NODE_ENV=production`
- [ ] Production database configured
- [ ] Email service configured
- [ ] Payment gateway production credentials
- [ ] Proper error handling
- [ ] Logging configured

### Documentation

- [ ] API documentation updated
- [ ] README updated
- [ ] Environment variables documented
- [ ] Deployment steps documented

---

## Environment Configuration

### Production `.env` Template

```env
# ================================
# APPLICATION
# ================================
NODE_ENV=production
PORT=5000
APP_NAME="Digital E-Commerce"
APP_URL=https://your-domain.com

# ================================
# DATABASE (MongoDB Atlas)
# ================================
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/digital-ecommerce?retryWrites=true&w=majority

# ================================
# AUTHENTICATION
# ================================
JWT_SECRET=<STRONG-RANDOM-SECRET-32-CHARS-MIN>
JWT_REFRESH_SECRET=<DIFFERENT-STRONG-SECRET-32-CHARS-MIN>
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# ================================
# EMAIL SERVICE
# ================================
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=<SENDGRID-API-KEY>
EMAIL_FROM_NAME="Digital E-Commerce"
EMAIL_FROM=noreply@your-domain.com

# ================================
# PAYOS PAYMENT (Production)
# ================================
PAYOS_CLIENT_ID=<PRODUCTION-CLIENT-ID>
PAYOS_API_KEY=<PRODUCTION-API-KEY>
PAYOS_CHECKSUM_KEY=<PRODUCTION-CHECKSUM-KEY>
PAYOS_RETURN_URL=https://your-domain.com/payment/return
PAYOS_CANCEL_URL=https://your-domain.com/payment/cancel
PAYOS_WEBHOOK_URL=https://your-domain.com/api/payment/webhook
PAYOS_SKIP_SIGNATURE=false

# ================================
# CORS
# ================================
CORS_ORIGIN=https://your-frontend.com,https://admin.your-domain.com

# ================================
# SECURITY
# ================================
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# ================================
# REDIS (Production)
# ================================
REDIS_HOST=<REDIS-HOST>
REDIS_PORT=6379
REDIS_PASSWORD=<REDIS-PASSWORD>
REDIS_DB=0
```

---

## Deployment Options

### Comparison Table

| Platform         | Ease       | Cost      | Scalability | Best For         |
| ---------------- | ---------- | --------- | ----------- | ---------------- |
| **Heroku**       | ⭐⭐⭐⭐⭐ | $7+/mo    | ⭐⭐⭐      | Quick deployment |
| **AWS EC2**      | ⭐⭐⭐     | $5+/mo    | ⭐⭐⭐⭐⭐  | Full control     |
| **DigitalOcean** | ⭐⭐⭐⭐   | $5+/mo    | ⭐⭐⭐⭐    | Balance          |
| **Railway**      | ⭐⭐⭐⭐⭐ | $5+/mo    | ⭐⭐⭐      | Modern platform  |
| **Render**       | ⭐⭐⭐⭐   | Free tier | ⭐⭐⭐      | Free hosting     |
| **Docker**       | ⭐⭐       | Varies    | ⭐⭐⭐⭐⭐  | Containerization |

---

## MongoDB Atlas Setup

### 1. Create Account

Visit: https://www.mongodb.com/cloud/atlas/register

### 2. Create Cluster

1. Click "Build a Database"
2. Choose **M0 Sandbox** (Free tier) or paid tier
3. Select region closest to your users
4. Name your cluster (e.g., `digital-ecommerce-prod`)

### 3. Configure Security

#### Database User

1. Go to **Database Access**
2. Click "Add New Database User"
3. Username: `admin` or `produser`
4. Password: Generate strong password
5. Permissions: **Read and write to any database**

#### Network Access

1. Go to **Network Access**
2. Click "Add IP Address"
3. Options:
   - **Allow Access from Anywhere** (0.0.0.0/0) - Simplest
   - Or add specific IPs of your servers

### 4. Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy connection string:
   ```
   mongodb+srv://username:<password>@cluster.mongodb.net/digital-ecommerce?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your database user password
5. Update `.env`:
   ```env
   MONGO_URI=mongodb+srv://username:yourpassword@cluster.mongodb.net/digital-ecommerce?retryWrites=true&w=majority
   ```

---

## Deploying to Heroku

### Prerequisites

- Heroku account
- Heroku CLI installed

### Steps

#### 1. Install Heroku CLI

```bash
# macOS
brew install heroku/brew/heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

#### 2. Login to Heroku

```bash
heroku login
```

#### 3. Create Heroku App

```bash
# Create app
heroku create digital-ecommerce-api

# Or with specific name
heroku create your-unique-app-name
```

#### 4. Add MongoDB Add-on (Optional)

```bash
# Or use MongoDB Atlas (recommended)
# Skip this if using Atlas
heroku addons:create mongolab:sandbox
```

#### 5. Set Environment Variables

```bash
# Set all environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="your-secret-here"
heroku config:set JWT_REFRESH_SECRET="your-refresh-secret"
heroku config:set MONGO_URI="your-mongodb-atlas-uri"
heroku config:set EMAIL_HOST="smtp.sendgrid.net"
heroku config:set EMAIL_USER="apikey"
heroku config:set EMAIL_PASSWORD="your-sendgrid-key"
# ... set all other variables

# Verify
heroku config
```

#### 6. Create `Procfile`

```bash
# Create Procfile in root directory
echo "web: node server.js" > Procfile
```

#### 7. Deploy

```bash
# Add Heroku remote (if not already added)
heroku git:remote -a your-app-name

# Deploy
git push heroku main

# Or deploy from a different branch
git push heroku your-branch:main
```

#### 8. Scale Dynos

```bash
# Ensure at least one dyno is running
heroku ps:scale web=1

# Check status
heroku ps
```

#### 9. View Logs

```bash
# Tail logs
heroku logs --tail

# View recent logs
heroku logs -n 200
```

#### 10. Test Deployment

```bash
# Open app in browser
heroku open

# Or test health endpoint
curl https://your-app-name.herokuapp.com/health
```

---

## Deploying to AWS EC2

### Prerequisites

- AWS account
- SSH key pair

### Steps

#### 1. Launch EC2 Instance

1. Go to AWS Console → EC2
2. Click "Launch Instance"
3. Choose **Ubuntu Server 22.04 LTS**
4. Instance type: **t2.micro** (free tier) or higher
5. Configure security group:
   - SSH (22) - Your IP
   - HTTP (80) - Anywhere
   - HTTPS (443) - Anywhere
   - Custom TCP (5000) - Anywhere (or use Nginx reverse proxy)
6. Download key pair (.pem file)
7. Launch instance

#### 2. Connect to Instance

```bash
# Set key permissions
chmod 400 your-key.pem

# Connect via SSH
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

#### 3. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version

# Install PM2 globally
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

#### 4. Clone Repository

```bash
# Clone your repository
git clone https://github.com/yourusername/Digital-Ecommerce-BE.git
cd Digital-Ecommerce-BE

# Install dependencies
npm install --production
```

#### 5. Configure Environment

```bash
# Create .env file
nano .env

# Paste your production environment variables
# Save: Ctrl+X, Y, Enter
```

#### 6. Start Application with PM2

```bash
# Start with PM2
pm2 start server.js --name digital-ecommerce

# Setup PM2 to start on boot
pm2 startup
# Copy and run the command it outputs

pm2 save

# View logs
pm2 logs

# Monitor
pm2 monit
```

#### 7. Setup Nginx Reverse Proxy (Optional)

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/digital-ecommerce

# Add configuration:
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/digital-ecommerce /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 8. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

---

## Deploying with Docker

### Prerequisites

- Docker installed
- Docker Hub account (optional)

### Steps

#### 1. Create `Dockerfile`

```dockerfile
# Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "server.js"]
```

#### 2. Create `.dockerignore`

```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
docs/
tests/
```

#### 3. Build Image

```bash
# Build image
docker build -t digital-ecommerce-api .

# Verify
docker images
```

#### 4. Run Container

```bash
# Run with environment file
docker run -d \
  --name digital-ecommerce \
  -p 5000:5000 \
  --env-file .env \
  digital-ecommerce-api

# View logs
docker logs digital-ecommerce

# Follow logs
docker logs -f digital-ecommerce
```

#### 5. Docker Compose (Multi-Container)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '5000:5000'
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/digital-ecommerce
      - REDIS_HOST=redis
    env_file:
      - .env
    depends_on:
      - mongo
      - redis
    restart: unless-stopped

  mongo:
    image: mongo:6.0
    ports:
      - '27017:27017'
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    restart: unless-stopped

volumes:
  mongo-data:
```

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## Deploying to Vercel

**Note**: Vercel is optimized for serverless/Next.js. For Express apps, consider:

- Railway
- Render
- Heroku

However, if you want to use Vercel:

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Create `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 3. Deploy

```bash
vercel
```

---

## CI/CD with GitHub Actions

### Create Workflow File

`.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x, 18.x]

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test
        env:
          NODE_ENV: test
          MONGO_URI: mongodb://localhost:27017/test
          JWT_SECRET: test-secret-key-for-ci-testing

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: 'your-app-name'
          heroku_email: 'your-email@example.com'
```

---

## Post-Deployment

### Health Check

```bash
# Test health endpoint
curl https://your-domain.com/health

# Test API endpoint
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!"}'
```

### Configure Domain

1. Point domain to server IP (A record)
2. Configure SSL certificate
3. Update CORS settings
4. Update webhook URLs

### Setup Monitoring

- **Uptime monitoring**: UptimeRobot, Pingdom
- **Error tracking**: Sentry
- **Performance**: New Relic, Datadog
- **Logs**: Loggly, Papertrail

---

## Monitoring & Logging

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs

# Metrics
pm2 describe digital-ecommerce
```

### Setup Sentry (Error Tracking)

```bash
npm install @sentry/node
```

```javascript
// server.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Error handler
app.use(Sentry.Handlers.errorHandler());
```

---

## Backup Strategy

### Database Backups

```bash
# MongoDB Atlas: Automatic backups enabled by default

# Manual backup
mongodump --uri="your-mongodb-uri" --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="your-mongodb-uri" /backup/20260208
```

### Environment Variables Backup

```bash
# Export Heroku config
heroku config --json > config-backup.json

# Never commit this file!
```

---

**Last Updated**: February 2026  
**Maintained by**: devnguyen0111
