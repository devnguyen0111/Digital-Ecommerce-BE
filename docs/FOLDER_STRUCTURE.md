# 📁 Folder Structure

Complete guide to the project's directory organization and file placement conventions.

---

## Table of Contents

1. [Overview](#overview)
2. [Root Directory](#root-directory)
3. [Source Code Structure](#source-code-structure)
4. [Directory Conventions](#directory-conventions)
5. [File Naming Conventions](#file-naming-conventions)
6. [Module Organization](#module-organization)

---

## Overview

The Digital E-Commerce Backend follows a **domain-driven** and **layered architecture** approach:

```
Digital-Ecommerce-BE/
├── 📄 Configuration Files (root)
├── 📁 docs/              # Documentation
├── 📁 .github/           # GitHub workflows & templates
├── 📁 locales/           # Internationalization
├── 📁 scripts/           # Utility scripts
├── 📁 tests/             # Test suites
└── 📁 src/               # Source code
```

---

## Root Directory

```
Digital-Ecommerce-BE/
├── 📄 .env.example           # Environment template
├── 📄 .eslintrc.json         # ESLint configuration
├── 📄 .prettierrc            # Prettier configuration
├── 📄 .editorconfig          # Editor configuration
├── 📄 .gitignore             # Git ignore rules
├── 📄 package.json           # Dependencies & scripts
├── 📄 package-lock.json      # Dependency lock file
├── 📄 server.js              # Application entry point
├── 📄 test-webhook.js        # PayOS webhook test utility
├── 📄 api-endpoints.json     # API documentation (legacy)
├── 📄 ecosystem.config.js    # PM2 configuration
└── 📄 README.md              # Project overview
```

### File Purposes

| File             | Purpose                                   | Required |
| ---------------- | ----------------------------------------- | -------- |
| `.env`           | Environment variables (not committed)     | ✅       |
| `.env.example`   | Environment template for setup            | ✅       |
| `.eslintrc.json` | Code linting rules                        | ✅       |
| `.prettierrc`    | Code formatting rules                     | ✅       |
| `.editorconfig`  | Editor consistency (spaces, line endings) | ⚠️       |
| `.gitignore`     | Files to exclude from Git                 | ✅       |
| `server.js`      | Express server initialization             | ✅       |
| `package.json`   | Project metadata & dependencies           | ✅       |

---

## Source Code Structure

### 📁 `src/` - Complete Structure

```
src/
│
├── 📁 config/                      # Configuration
│   ├── index.js                    # Config registry (centralized access)
│   ├── env.js                      # Environment variable mappings
│   ├── constants.js                # Application constants
│   ├── database.js                 # MongoDB connection setup
│   ├── i18n.js                     # Internationalization config
│   └── validateEnv.js              # Environment validation
│
├── 📁 controllers/                 # Request handlers
│   ├── index.js                    # Controller registry
│   │
│   ├── 📁 product/                 # Product domain
│   │   ├── productController.js
│   │   └── categoryController.js
│   │
│   └── 📁 user/                    # User domain
│       ├── authController.js       # Authentication
│       ├── userController.js       # User management
│       └── walletController.js     # Wallet operations
│
├── 📁 middleware/                  # Express middleware
│   ├── auth.js                     # JWT authentication
│   ├── errorHandler.js             # Global error handler
│   ├── language.js                 # i18n language detection
│   ├── requestLogger.js            # Request/response logging
│   ├── rateLimiter.js              # Rate limiting
│   └── validators.js               # Input validation rules
│
├── 📁 models/                      # Database schemas
│   ├── index.js                    # Model registry
│   ├── User.js                     # User schema
│   ├── Wallet.js                   # Wallet schema
│   ├── WalletTransaction.js        # Transaction schema
│   ├── Payment.js                  # Payment schema
│   ├── Product.js                  # Product schema (planned)
│   └── Order.js                    # Order schema (planned)
│
├── 📁 repositories/                # Data access layer
│   ├── BaseRepository.js           # Base CRUD operations
│   ├── UserRepository.js           # User data access
│   ├── WalletRepository.js         # Wallet data access
│   └── PaymentRepository.js        # Payment data access
│
├── 📁 routes/                      # API routes
│   ├── index.js                    # Main router (combines all)
│   │
│   ├── 📁 product/                 # Product routes
│   │   ├── productRoutes.js
│   │   └── categoryRoutes.js
│   │
│   └── 📁 user/                    # User routes
│       ├── authRoutes.js           # Auth endpoints
│       ├── userRoutes.js           # User endpoints
│       └── walletRoutes.js         # Wallet endpoints
│
├── 📁 services/                    # Business logic
│   │
│   ├── 📁 email/                   # Email service (refactored)
│   │   ├── index.js                # Main email service
│   │   ├── transporter.js          # Nodemailer config
│   │   │
│   │   ├── 📁 templates/           # Email templates (Handlebars)
│   │   │   ├── base.hbs            # Base layout
│   │   │   ├── welcome.hbs         # Welcome email
│   │   │   ├── verification.hbs    # Email verification
│   │   │   ├── reset-password.hbs  # Password reset
│   │   │   ├── order-confirmation.hbs
│   │   │   └── wallet-credit.hbs
│   │   │
│   │   └── 📁 senders/             # Specialized email senders
│   │       ├── AuthEmails.js       # Auth-related emails
│   │       ├── OrderEmails.js      # Order emails
│   │       ├── WalletEmails.js     # Wallet emails
│   │       └── TicketEmails.js     # Support emails
│   │
│   ├── paymentService.js           # PayOS integration
│   ├── walletService.js            # Wallet business logic
│   └── userService.js              # User business logic
│
├── 📁 queues/                      # Background jobs
│   ├── emailQueue.js               # Email sending queue
│   ├── paymentQueue.js             # Payment processing queue
│   └── reportQueue.js              # Report generation queue
│
└── 📁 utils/                       # Helper functions
    ├── apiFeatures.js              # Query helpers (pagination, filtering)
    ├── apiResponse.js              # Standardized API responses
    ├── asyncHandler.js             # Async error wrapper
    ├── cache.js                    # Redis cache wrapper
    └── logger.js                   # Winston logger with sanitization
```

---

## Directory Conventions

### 📁 `config/`

**Purpose**: Centralize all configuration

**Rules**:

- ✅ Environment variables go in `env.js`
- ✅ Constants (roles, statuses) go in `constants.js`
- ✅ Database connection in `database.js`
- ❌ No business logic
- ❌ No hard-coded secrets

**Example**:

```javascript
// config/constants.js
module.exports = {
  ROLES: {
    USER: 'user',
    ADMIN: 'admin',
  },
  PAYOS: {
    STATUS: {
      PAID: 'PAID',
      CANCELLED: 'CANCELLED',
    },
  },
};
```

---

### 📁 `controllers/`

**Purpose**: Handle HTTP requests/responses

**Organization**: By domain (user, product, order)

**Naming Convention**: `{domain}Controller.js`

**Rules**:

- ✅ One controller per domain entity
- ✅ Thin controllers (delegate to services)
- ✅ Use `asyncHandler` for error handling
- ✅ Return `ApiResponse` format
- ❌ No database access
- ❌ No business logic

**Example Structure**:

```
controllers/
├── user/
│   ├── authController.js       # Auth operations
│   ├── userController.js       # User CRUD
│   └── walletController.js     # Wallet operations
└── product/
    ├── productController.js    # Product CRUD
    └── categoryController.js   # Category CRUD
```

---

### 📁 `middleware/`

**Purpose**: Request preprocessing and cross-cutting concerns

**Naming Convention**: `{purpose}.js` or `{purpose}Middleware.js`

**Types**:

1. **Authentication**: `auth.js`
2. **Validation**: `validators.js`
3. **Error Handling**: `errorHandler.js`
4. **Logging**: `requestLogger.js`
5. **Rate Limiting**: `rateLimiter.js`

**Rules**:

- ✅ Each middleware in separate file
- ✅ Export named functions
- ✅ Follow signature: `(req, res, next)`
- ✅ Call `next()` or `next(error)`
- ❌ No business logic

---

### 📁 `models/`

**Purpose**: Define database schemas and validation

**Naming Convention**: PascalCase, singular (`User.js`, `Product.js`)

**Rules**:

- ✅ One model per file
- ✅ Use PascalCase for model names
- ✅ Include validation in schema
- ✅ Add indexes for performance
- ✅ Use virtual fields for computed properties
- ❌ No business logic (except model methods)

**Example**:

```javascript
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

// Instance method
userSchema.methods.generateToken = function () {
  /* ... */
};

// Static method
userSchema.statics.findByEmail = function (email) {
  /* ... */
};

module.exports = mongoose.model('User', userSchema);
```

---

### 📁 `repositories/`

**Purpose**: Abstract data access logic (Repository Pattern)

**Naming Convention**: `{Model}Repository.js`

**Rules**:

- ✅ Extend `BaseRepository`
- ✅ Custom queries only
- ✅ Return model instances or plain objects
- ❌ No business logic
- ❌ No HTTP concerns

**Structure**:

```
repositories/
├── BaseRepository.js       # Base CRUD operations
├── UserRepository.js       # User-specific queries
├── WalletRepository.js     # Wallet queries
└── PaymentRepository.js    # Payment queries
```

---

### 📁 `routes/`

**Purpose**: Define API endpoints

**Organization**: By domain

**Naming Convention**: `{domain}Routes.js`

**Rules**:

- ✅ Group by domain/resource
- ✅ Use Express Router
- ✅ Apply middleware in route definition
- ✅ Follow RESTful conventions
- ❌ No business logic

**RESTful Pattern**:

```javascript
router.get('/', controller.getAll); // GET /api/users
router.get('/:id', controller.getOne); // GET /api/users/:id
router.post('/', controller.create); // POST /api/users
router.put('/:id', controller.update); // PUT /api/users/:id
router.delete('/:id', controller.delete); // DELETE /api/users/:id
```

---

### 📁 `services/`

**Purpose**: Implement business logic

**Naming Convention**: `{domain}Service.js`

**Rules**:

- ✅ One service per domain
- ✅ Pure business logic
- ✅ Coordinate between repositories
- ✅ Handle transactions
- ✅ Integrate with external APIs
- ❌ No HTTP concerns (req, res)
- ❌ No direct database queries (use repositories)

**Complex Services** (like email):

```
services/
├── email/
│   ├── index.js           # Main service
│   ├── transporter.js     # Config
│   ├── templates/         # Email templates
│   └── senders/           # Specialized senders
└── paymentService.js
```

---

### 📁 `queues/`

**Purpose**: Handle background jobs

**Naming Convention**: `{job}Queue.js`

**Rules**:

- ✅ Use Bull for job processing
- ✅ Configure retry logic
- ✅ Add job logging
- ✅ Handle job failures
- ❌ Don't block main thread

**Example**:

```
queues/
├── emailQueue.js       # Email sending
├── paymentQueue.js     # Payment processing
└── reportQueue.js      # Report generation
```

---

### 📁 `utils/`

**Purpose**: Reusable helper functions

**Naming Convention**: `{purpose}.js`

**Rules**:

- ✅ Pure functions (no side effects)
- ✅ Single responsibility
- ✅ Well-documented
- ✅ Fully tested
- ❌ No business logic
- ❌ No state management

**Common Utilities**:

```
utils/
├── apiFeatures.js      # Query helpers
├── apiResponse.js      # Response formatting
├── asyncHandler.js     # Error wrapper
├── cache.js            # Redis wrapper
└── logger.js           # Logging utility
```

---

## File Naming Conventions

### General Rules

| Type             | Convention                     | Example                    |
| ---------------- | ------------------------------ | -------------------------- |
| **Controllers**  | camelCase + Controller suffix  | `userController.js`        |
| **Services**     | camelCase + Service suffix     | `emailService.js`          |
| **Repositories** | PascalCase + Repository suffix | `UserRepository.js`        |
| **Models**       | PascalCase, singular           | `User.js`, `Product.js`    |
| **Routes**       | camelCase + Routes suffix      | `authRoutes.js`            |
| **Middleware**   | camelCase                      | `auth.js`, `validators.js` |
| **Utils**        | camelCase                      | `logger.js`, `cache.js`    |
| **Config**       | camelCase                      | `database.js`, `env.js`    |
| **Tests**        | same as source + .test         | `userService.test.js`      |

### Variable Naming

```javascript
// Constants: UPPER_SNAKE_CASE
const MAX_LOGIN_ATTEMPTS = 5;
const DEFAULT_PAGE_SIZE = 20;

// Functions/Methods: camelCase
function getUserById() {}
const createPayment = async () => {};

// Classes: PascalCase
class UserService {}
class EmailQueue {}

// Private variables: prefix with _
class Example {
  constructor() {
    this._privateVar = 'value';
  }
}

// Boolean variables: is/has prefix
const isValid = true;
const hasPermission = false;
```

---

## Module Organization

### Single Responsibility

Each file should have ONE clear purpose:

```javascript
// ✅ GOOD: userService.js - handles all user business logic
class UserService {
  register() {}
  updateProfile() {}
  deleteAccount() {}
}

// ❌ BAD: userAndWalletService.js - too many concerns
class UserAndWalletService {
  register() {}
  createWallet() {}
  processPayment() {}
}
```

### Grouping by Domain

```
controllers/
├── user/                   # User domain
│   ├── authController.js
│   ├── userController.js
│   └── walletController.js
└── product/                # Product domain
    ├── productController.js
    └── categoryController.js
```

### Import Organization

**Order of imports**:

1. External dependencies
2. Internal modules (by layer)
3. Config/Constants
4. Utils

```javascript
// 1. External dependencies
const express = require('express');
const bcrypt = require('bcryptjs');

// 2. Internal modules
const userService = require('../services/userService');
const userRepository = require('../repositories/UserRepository');

// 3. Config/Constants
const config = require('../config');
const { ROLES } = require('../config/constants');

// 4. Utils
const { asyncHandler } = require('../utils/asyncHandler');
const logger = require('../utils/logger');
```

---

## Special Directories

### 📁 `docs/`

```
docs/
├── README.md                   # Project overview
├── ARCHITECTURE.md             # System design
├── CODEBASE_OVERVIEW.md        # Code organization
├── FOLDER_STRUCTURE.md         # This file
├── CODING_CONVENTIONS.md       # Code standards
├── CONTRIBUTING.md             # Contribution guide
├── ENVIRONMENT_SETUP.md        # Setup instructions
├── DEPLOYMENT_GUIDE.md         # Deployment steps
├── API_REFERENCE.md            # API documentation
├── CHANGELOG.md                # Version history
└── diagrams/                   # System diagrams
    ├── system-overview.mmd
    ├── auth-flow.mmd
    └── payment-flow.mmd
```

---

### 📁 `tests/`

```
tests/
├── setup.js                    # Test environment setup
├── teardown.js                 # Cleanup after tests
├── fixtures/                   # Test data
│   ├── users.json
│   └── products.json
│
├── unit/                       # Unit tests
│   ├── services/
│   │   ├── userService.test.js
│   │   └── walletService.test.js
│   └── utils/
│       └── apiFeatures.test.js
│
├── integration/                # Integration tests
│   ├── auth.test.js
│   ├── wallet.test.js
│   └── user.test.js
│
└── e2e/                        # End-to-end tests
    └── payment-flow.test.js
```

**Naming Convention**: `{filename}.test.js`

---

### 📁 `.github/`

```
.github/
├── workflows/                  # GitHub Actions
│   ├── ci.yml                  # Continuous Integration
│   └── deploy.yml              # Deployment
│
├── ISSUE_TEMPLATE/             # Issue templates
│   ├── bug_report.md
│   └── feature_request.md
│
└── pull_request_template.md    # PR template
```

---

### 📁 `scripts/`

```
scripts/
├── seed-database.js            # Seed initial data
├── migrate-data.js             # Data migration
├── generate-docs.js            # Generate API docs
└── cleanup-logs.js             # Log cleanup
```

**Usage**:

```bash
node scripts/seed-database.js
```

---

## Anti-Patterns to Avoid

### ❌ Don't: Mix concerns

```javascript
// BAD: Controller doing business logic
exports.register = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).json({ error: 'User exists' });
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const newUser = await User.create({ ...req.body, password: hashedPassword });

  // ... more business logic
};
```

```javascript
// GOOD: Delegate to service
exports.register = asyncHandler(async (req, res) => {
  const result = await userService.register(req.body);
  res.status(201).json(ApiResponse.success('User registered', result));
});
```

---

### ❌ Don't: Create god files

```javascript
// BAD: utils.js with everything
module.exports = {
  formatDate() {},
  sendEmail() {},
  hashPassword() {},
  parseJSON() {},
  // ... 50 more functions
};
```

```javascript
// GOOD: Separate files
// utils/dateFormatter.js
// utils/emailSender.js
// utils/passwordHasher.js
```

---

### ❌ Don't: Deep nesting

```javascript
// BAD: Deep directory nesting
src/
└── controllers/
    └── api/
        └── v1/
            └── user/
                └── auth/
                    └── authController.js
```

```javascript
// GOOD: Flat, organized structure
src/
└── controllers/
    └── user/
        └── authController.js
```

---

## Best Practices

### ✅ Group by feature, not by type

```
// GOOD: Feature-based
src/
├── users/
│   ├── userController.js
│   ├── userService.js
│   ├── userRepository.js
│   └── userRoutes.js
└── products/
    ├── productController.js
    └── ...

// ALSO GOOD: Layer-based (current structure)
src/
├── controllers/user/
├── services/userService.js
├── repositories/UserRepository.js
└── routes/user/
```

### ✅ Keep files focused and small

- Max 300 lines per file
- Single responsibility
- Easy to test

### ✅ Use index.js for exports

```javascript
// models/index.js
module.exports = {
  User: require('./User'),
  Wallet: require('./Wallet'),
  Payment: require('./Payment'),
};

// Usage:
const { User, Wallet } = require('./models');
```

---

## Quick Reference

### Where to put...

| What             | Where                               |
| ---------------- | ----------------------------------- |
| New API endpoint | `routes/{domain}/`                  |
| Request handler  | `controllers/{domain}/`             |
| Business logic   | `services/{domain}Service.js`       |
| Database query   | `repositories/{Model}Repository.js` |
| Database schema  | `models/{Model}.js`                 |
| Input validation | `middleware/validators.js`          |
| Authentication   | `middleware/auth.js`                |
| Helper function  | `utils/{purpose}.js`                |
| Configuration    | `config/`                           |
| Background job   | `queues/{job}Queue.js`              |
| Test             | `tests/{type}/{name}.test.js`       |

---

**Last Updated**: February 2026  
**Maintained by**: devnguyen0111
