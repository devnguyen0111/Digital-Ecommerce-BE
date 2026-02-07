# 🛠️ Environment Setup

Complete guide to setting up your development environment for the Digital E-Commerce Backend.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installing Prerequisites](#installing-prerequisites)
3. [Project Setup](#project-setup)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Email Configuration](#email-configuration)
7. [PayOS Integration](#payos-integration)
8. [Redis Setup](#redis-setup-optional)
9. [Running the Application](#running-the-application)
10. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements

| Component   | Minimum                               | Recommended   |
| ----------- | ------------------------------------- | ------------- |
| **OS**      | Windows 10, macOS 10.15, Ubuntu 20.04 | Latest stable |
| **Node.js** | 14.0.0                                | 18.x LTS      |
| **RAM**     | 4 GB                                  | 8 GB+         |
| **Storage** | 2 GB free                             | 5 GB+ free    |
| **CPU**     | 2 cores                               | 4+ cores      |

### Required Software

- **Node.js** (v14.0.0 or higher)
- **npm** or **yarn**
- **MongoDB** (v4.4 or higher)
- **Git**

### Optional Software

- **Redis** (v6.0+) - for caching and queues
- **Docker** - for containerized development
- **Postman** or **Insomnia** - for API testing
- **MongoDB Compass** - for database GUI

---

## Installing Prerequisites

### Windows

#### 1. Install Node.js

```powershell
# Download from https://nodejs.org/
# Or use Chocolatey
choco install nodejs-lts

# Verify installation
node --version
npm --version
```

#### 2. Install MongoDB

```powershell
# Download from https://www.mongodb.com/try/download/community
# Or use Chocolatey
choco install mongodb

# Start MongoDB service
net start MongoDB

# Verify
mongosh --version
```

#### 3. Install Git

```powershell
# Download from https://git-scm.com/
# Or use Chocolatey
choco install git

# Verify
git --version
```

---

### macOS

#### 1. Install Homebrew (if not installed)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. Install Node.js

```bash
# Install Node.js
brew install node@18

# Verify
node --version
npm --version
```

#### 3. Install MongoDB

```bash
# Install MongoDB Community Edition
brew tap mongodb/brew
brew install mongodb-community@6.0

# Start MongoDB
brew services start mongodb-community@6.0

# Verify
mongosh --version
```

#### 4. Install Git

```bash
# Install Git
brew install git

# Verify
git --version
```

---

### Linux (Ubuntu/Debian)

#### 1. Install Node.js

```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

#### 2. Install MongoDB

```bash
# Import MongoDB GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
mongosh --version
```

#### 3. Install Git

```bash
sudo apt-get install -y git

# Verify
git --version
```

---

## Project Setup

### 1. Clone the Repository

```bash
# Clone the project
git clone https://github.com/devnguyen0111/Digital-Ecommerce-BE.git
cd Digital-Ecommerce-BE
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Or with yarn
yarn install
```

This will install:

- express
- mongoose
- bcryptjs
- jsonwebtoken
- express-validator
- nodemailer
- winston
- i18n
- And other dependencies listed in `package.json`

### 3. Create Environment File

```bash
# Copy the example environment file
cp .env.example .env

# Open .env in your editor
code .env  # VS Code
nano .env  # Terminal editor
```

---

## Environment Variables

### Complete `.env` Configuration

```env
# ================================
# APPLICATION
# ================================
NODE_ENV=development
PORT=5000
APP_NAME="Digital E-Commerce"
APP_URL=http://localhost:5000

# ================================
# DATABASE
# ================================
# Local MongoDB
MONGO_URI=mongodb://localhost:27017/digital-ecommerce

# Or MongoDB Atlas (cloud)
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/digital-ecommerce?retryWrites=true&w=majority

# ================================
# AUTHENTICATION
# ================================
# JWT Access Token (use strong random string, min 32 characters)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# JWT Refresh Token (different from access token)
JWT_REFRESH_SECRET=your-different-refresh-token-secret-key-32-chars

# Token Expiration
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# ================================
# EMAIL SERVICE
# ================================
# Gmail example
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Sender details
EMAIL_FROM_NAME="Digital E-Commerce"
EMAIL_FROM=noreply@digital-ecommerce.com

# For Gmail: Generate App Password at
# https://myaccount.google.com/apppasswords

# ================================
# PAYOS PAYMENT GATEWAY
# ================================
PAYOS_CLIENT_ID=your-payos-client-id
PAYOS_API_KEY=your-payos-api-key
PAYOS_CHECKSUM_KEY=your-payos-checksum-key
PAYOS_RETURN_URL=http://localhost:5000/api/payment/return
PAYOS_CANCEL_URL=http://localhost:5000/api/payment/cancel
PAYOS_WEBHOOK_URL=http://localhost:5000/api/payment/webhook

# Skip signature verification (ONLY for development)
PAYOS_SKIP_SIGNATURE=false

# ================================
# CORS
# ================================
# Comma-separated list of allowed origins
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# ================================
# SECURITY
# ================================
# bcrypt rounds (10 is recommended, higher = slower but more secure)
BCRYPT_ROUNDS=10

# Rate limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# ================================
# LOCALIZATION
# ================================
DEFAULT_LANGUAGE=en
SUPPORTED_LANGUAGES=en,vi

# ================================
# REDIS (Optional - for caching and queues)
# ================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# ================================
# FILE UPLOAD (Future feature)
# ================================
# MAX_FILE_SIZE=5242880
# UPLOAD_DIR=uploads/
```

### Generating Secure Secrets

#### Method 1: Node.js

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Method 2: OpenSSL

```bash
# Generate JWT secret
openssl rand -hex 32
```

#### Method 3: Online

Visit: https://randomkeygen.com/

---

## Database Setup

### MongoDB Connection

#### Local MongoDB

```bash
# Start MongoDB (if not already running)
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### MongoDB Atlas (Cloud)

1. **Create Account**: https://www.mongodb.com/cloud/atlas/register
2. **Create Cluster**: Free tier available
3. **Get Connection String**:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/digital-ecommerce?retryWrites=true&w=majority
```

#### Verify Connection

```bash
# Test connection with mongoose
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => console.log('✅ Connected')).catch(err => console.log('❌ Error:', err.message));"
```

### Create Database Indexes

Indexes will be created automatically when models are loaded, but you can verify:

```javascript
// Connect to MongoDB shell
mongosh

// Use your database
use digital-ecommerce

// Check indexes
db.users.getIndexes()
db.wallets.getIndexes()
db.wallettransactions.getIndexes()
```

---

## Email Configuration

### Gmail Setup

1. **Enable 2-Factor Authentication**
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or other)
   - Copy the 16-character password

3. **Update `.env`**

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # 16-char app password
EMAIL_FROM_NAME="Digital E-Commerce"
EMAIL_FROM=noreply@digital-ecommerce.com
```

### Other Email Providers

#### SendGrid

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

#### Mailgun

```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.com
EMAIL_PASSWORD=your-mailgun-password
```

#### Outlook/Office365

```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Test Email Configuration

```bash
# Create test script: test-email.js
node -e "
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

transporter.verify().then(() => {
  console.log('✅ Email configured correctly');
}).catch(err => {
  console.log('❌ Email error:', err.message);
});
"
```

---

## PayOS Integration

### Getting PayOS Credentials

1. **Sign up**: https://payos.vn/
2. **Get credentials**:
   - Client ID
   - API Key
   - Checksum Key

3. **Update `.env`**:

```env
PAYOS_CLIENT_ID=your-client-id
PAYOS_API_KEY=your-api-key
PAYOS_CHECKSUM_KEY=your-checksum-key
PAYOS_RETURN_URL=http://localhost:5000/api/payment/return
PAYOS_CANCEL_URL=http://localhost:5000/api/payment/cancel
PAYOS_WEBHOOK_URL=http://localhost:5000/api/payment/webhook
```

### Testing PayOS

Use the included test script:

```bash
node test-webhook.js
```

---

## Redis Setup (Optional)

Redis is optional but recommended for:

- Caching user sessions
- Job queues (emails, background tasks)
- Rate limiting

### Install Redis

#### Windows

```powershell
# Using WSL2 (recommended)
wsl --install
# Then follow Linux instructions

# Or download from
# https://github.com/microsoftarchive/redis/releases
```

#### macOS

```bash
brew install redis
brew services start redis
```

#### Linux

```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

### Verify Redis

```bash
# Test connection
redis-cli ping
# Expected: PONG

# Check version
redis-cli --version
```

### Update `.env`

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

---

## Running the Application

### Development Mode

```bash
# Start with hot reload (nodemon)
npm run dev

# Output:
# Server running on port 5000
# MongoDB connected: localhost:27017
# ✅ Environment validated successfully
```

### Production Mode

```bash
# Build and start
npm start

# Or with PM2
npm install -g pm2
pm2 start ecosystem.config.js
pm2 logs
```

### Verify Installation

```bash
# Health check
curl http://localhost:5000/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2026-02-08T...",
  "uptime": 123
}

# Test API
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

---

## Troubleshooting

### MongoDB Connection Issues

```bash
# Error: MongooseServerSelectionError

# Solution 1: Check if MongoDB is running
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Solution 2: Check MongoDB URI in .env
# Make sure MONGO_URI is correct

# Solution 3: Check MongoDB logs
# Windows: C:\Program Files\MongoDB\Server\6.0\log\mongod.log
# macOS: /usr/local/var/log/mongodb/mongo.log
# Linux: /var/log/mongodb/mongod.log
```

### Port Already in Use

```bash
# Error: EADDRINUSE: address already in use :::5000

# Solution 1: Change port in .env
PORT=5001

# Solution 2: Kill process using port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Email Not Sending

```bash
# Error: Invalid login

# Solutions:
# 1. Enable "Less secure app access" (Gmail)
# 2. Use App Password instead of regular password
# 3. Check EMAIL_HOST and EMAIL_PORT
# 4. Verify credentials
```

### JWT Authentication Issues

```bash
# Error: JsonWebTokenError

# Solutions:
# 1. Ensure JWT_SECRET is set in .env
# 2. JWT_SECRET must be at least 32 characters
# 3. Check token expiration (JWT_EXPIRES_IN)
# 4. Clear browser cookies/tokens and login again
```

### Module Not Found

```bash
# Error: Cannot find module 'express'

# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loading

```bash
# Error: undefined environment variables

# Solutions:
# 1. Ensure .env file exists in root directory
# 2. Check .env file has no syntax errors
# 3. Restart the server after changing .env
# 4. Check file is named exactly ".env" (not .env.txt)
```

---

## Development Tools

### Recommended VS Code Extensions

```
- ESLint
- Prettier
- REST Client
- MongoDB for VS Code
- Thunder Client (API testing)
- GitLens
- Error Lens
```

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript"]
}
```

---

## Next Steps

After successful setup:

1. ✅ Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system
2. ✅ Review [CODING_CONVENTIONS.md](CODING_CONVENTIONS.md) for code standards
3. ✅ Check [API_REFERENCE.md](API_REFERENCE.md) for available endpoints
4. ✅ Start developing!

---

## Getting Help

If you encounter issues not covered here:

1. Check existing [GitHub Issues](https://github.com/devnguyen0111/Digital-Ecommerce-BE/issues)
2. Search [GitHub Discussions](https://github.com/devnguyen0111/Digital-Ecommerce-BE/discussions)
3. Create a new issue with:
   - OS and versions
   - Error message
   - Steps to reproduce

---

**Last Updated**: February 2026  
**Maintained by**: devnguyen0111
