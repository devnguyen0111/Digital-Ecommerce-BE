# 📐 Coding Conventions

Official coding standards and best practices for the Digital E-Commerce Backend project.

---

## Table of Contents

1. [JavaScript Style Guide](#javascript-style-guide)
2. [Naming Conventions](#naming-conventions)
3. [Code Structure](#code-structure)
4. [Error Handling](#error-handling)
5. [Async/Await Patterns](#asyncawait-patterns)
6. [Database Patterns](#database-patterns)
7. [API Design](#api-design)
8. [Testing Standards](#testing-standards)
9. [Documentation](#documentation)
10. [Git Workflow](#git-workflow)

---

## JavaScript Style Guide

### General Rules

- ✅ Use **ES6+ features** (const, let, arrow functions, destructuring)
- ✅ Use **semicolons** (enforced by ESLint)
- ✅ Use **single quotes** for strings
- ✅ **2 spaces** for indentation
- ✅ Max **100 characters** per line
- ✅ **Trailing commas** in multi-line objects/arrays

### Example

```javascript
// ✅ GOOD
const userData = {
  username: 'john',
  email: 'john@example.com',
  role: 'user',
};

const greetUser = (name) => {
  return `Hello, ${name}!`;
};

// ❌ BAD
var userData = {
  username: 'john',
  email: 'john@example.com',
  role: 'user',
};

function greetUser(name) {
  return 'Hello, ' + name + '!';
}
```

---

## Naming Conventions

### Variables and Functions

```javascript
// camelCase for variables and functions
const userName = 'John';
const isAuthenticated = true;
const getUserById = (id) => {
  /* ... */
};

// UPPER_SNAKE_CASE for constants
const MAX_LOGIN_ATTEMPTS = 5;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_PAGE_SIZE = 20;

// Boolean variables: use is/has/can prefix
const isActive = true;
const hasPermission = false;
const canDelete = true;
```

### Classes

```javascript
// PascalCase for classes
class UserService {
  constructor() {
    this._privateVar = 'private'; // prefix with _ for private
    this.publicVar = 'public';
  }
}

class EmailQueue {}
class PaymentProcessor {}
```

### Files and Directories

```javascript
// Files: camelCase (except Models)
userController.js
emailService.js
apiFeatures.js

// Models: PascalCase
User.js
Product.js
WalletTransaction.js

// Directories: lowercase
controllers/
services/
middleware/
```

### Database Fields

```javascript
// camelCase for field names
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  emailVerified: Boolean,
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date,
});
```

---

## Code Structure

### Function Organization

```javascript
// 1. Export at the top (for clarity)
exports.register = asyncHandler(async (req, res) => {
  // 2. Destructure early
  const { username, email, password } = req.body;

  // 3. Early returns for validation
  if (!username) {
    return res.status(400).json(ApiResponse.error('Username required'));
  }

  // 4. Main logic
  const user = await userService.register({ username, email, password });

  // 5. Return response
  res.status(201).json(ApiResponse.success('User created', { user }));
});
```

### Class Structure

```javascript
class UserService {
  // 1. Constructor
  constructor(userRepository, emailService) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }

  // 2. Public methods (alphabetically)
  async deleteUser(userId) {}

  async register(userData) {}

  async updateProfile(userId, data) {}

  // 3. Private methods (at the end)
  _hashPassword(password) {}

  _validateUserData(data) {}
}
```

### Import Organization

```javascript
// 1. External dependencies (sorted alphabetically)
const bcrypt = require('bcryptjs');
const express = require('express');
const jwt = require('jsonwebtoken');

// 2. Internal modules (by layer)
const userController = require('../controllers/user/userController');
const userService = require('../services/userService');
const userRepository = require('../repositories/UserRepository');

// 3. Models
const User = require('../models/User');

// 4. Config & Constants
const config = require('../config');
const { ROLES, STATUS } = require('../config/constants');

// 5. Utils
const { asyncHandler } = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');
```

---

## Error Handling

### Use try-catch with async/await

```javascript
// ✅ GOOD: Use asyncHandler wrapper
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new Error('User not found');
  }

  res.json(ApiResponse.success('User retrieved', { user }));
});

// ❌ BAD: No error handling
exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json({ user });
};
```

### Custom Error Classes

```javascript
// utils/errors.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404);
  }
}

// Usage
throw new NotFoundError('User');
throw new ValidationError('Invalid email format');
```

### Error Response Format

```javascript
// Standardized error response
{
  "success": false,
  "message": "User not found",
  "error": {
    "statusCode": 404,
    "details": null
  }
}
```

---

## Async/Await Patterns

### Always use async/await (not callbacks or .then())

```javascript
// ✅ GOOD: async/await
const createUser = async (userData) => {
  const user = await User.create(userData);
  const wallet = await Wallet.create({ user: user._id });
  await emailQueue.add({ userId: user._id });
  return user;
};

// ❌ BAD: Callbacks
const createUser = (userData, callback) => {
  User.create(userData, (err, user) => {
    if (err) return callback(err);
    Wallet.create({ user: user._id }, (err, wallet) => {
      // Callback hell
    });
  });
};

// ❌ BAD: .then() chains
const createUser = (userData) => {
  return User.create(userData)
    .then((user) => Wallet.create({ user: user._id }))
    .then((wallet) => emailQueue.add({ userId: wallet.user }));
};
```

### Parallel Execution

```javascript
// ✅ GOOD: Parallel execution for independent operations
const [user, products, orders] = await Promise.all([
  User.findById(userId),
  Product.find({ category: 'electronics' }),
  Order.find({ user: userId }),
]);

// ❌ BAD: Sequential when not needed
const user = await User.findById(userId);
const products = await Product.find({ category: 'electronics' });
const orders = await Order.find({ user: userId });
```

### Error Handling in Async

```javascript
// ✅ GOOD: Handle errors properly
const processPayment = async (paymentData) => {
  try {
    const result = await paymentService.charge(paymentData);
    return result;
  } catch (error) {
    logger.error('Payment failed', error);
    throw new AppError('Payment processing failed', 500);
  }
};
```

---

## Database Patterns

### Query Best Practices

```javascript
// ✅ GOOD: Use lean() for read-only, select fields, use indexes
const users = await User.find({ role: 'user' }).select('username email createdAt').lean().limit(50);

// ❌ BAD: Fetch all fields, no pagination
const users = await User.find({ role: 'user' });
```

### Conditional Population

```javascript
// ✅ GOOD: Populate only when needed
const getUser = async (userId, includeWallet = false) => {
  let query = User.findById(userId).select('-password');

  if (includeWallet) {
    query = query.populate('wallet');
  }

  return query.exec();
};

// ❌ BAD: Always populate
const user = await User.findById(userId).populate('wallet orders products');
```

### Transactions for Critical Operations

```javascript
// ✅ GOOD: Use transactions for multi-document updates
const transferFunds = async (fromWalletId, toWalletId, amount) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Debit sender
    await Wallet.findByIdAndUpdate(fromWalletId, { $inc: { balance: -amount } }, { session });

    // Credit recipient
    await Wallet.findByIdAndUpdate(toWalletId, { $inc: { balance: amount } }, { session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
```

### Indexing

```javascript
// Add indexes for frequently queried fields
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1, isActive: 1 });

// Compound index for common queries
orderSchema.index({ user: 1, createdAt: -1 });
```

---

## API Design

### RESTful Routes

```javascript
// ✅ GOOD: RESTful naming
GET    /api/users              # List users
GET    /api/users/:id          # Get single user
POST   /api/users              # Create user
PUT    /api/users/:id          # Update user (full)
PATCH  /api/users/:id          # Update user (partial)
DELETE /api/users/:id          # Delete user

// Nested resources
GET    /api/users/:id/orders   # Get user's orders
POST   /api/users/:id/orders   # Create order for user

// Actions on resources
POST   /api/orders/:id/cancel  # Cancel order
POST   /api/wallet/add-funds   # Add funds to wallet
```

### Request Validation

```javascript
// ✅ GOOD: Validate at middleware layer
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
];

router.post('/register', registerValidation, validate, authController.register);
```

### Standardized Response Format

```javascript
// ✅ GOOD: Consistent response structure
// Success Response
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "john",
      "email": "john@example.com"
    }
  }
}

// Error Response
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "statusCode": 400,
    "details": {
      "email": "Invalid email format",
      "password": "Password too weak"
    }
  }
}

// Implementation
class ApiResponse {
  static success(message, data = null) {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message, statusCode = 500, details = null) {
    return {
      success: false,
      message,
      error: {
        statusCode,
        details,
      },
    };
  }
}
```

### Pagination

```javascript
// ✅ GOOD: Standard pagination format
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalPages": 5,
      "totalItems": 100,
      "hasNext": true,
      "hasPrev": false
    }
  }
}

// Implementation
class ApiFeatures {
  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 20;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.page = page;
    this.limit = limit;

    return this;
  }
}
```

---

## Testing Standards

### Test Structure

```javascript
// ✅ GOOD: Descriptive tests with setup/teardown
describe('User Service', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('register()', () => {
    it('should create user with hashed password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123!',
      };

      const user = await userService.register(userData);

      expect(user).toHaveProperty('id');
      expect(user.password).not.toBe(userData.password);
      expect(await bcrypt.compare(userData.password, user.password)).toBe(true);
    });

    it('should throw error for duplicate email', async () => {
      await User.create({
        username: 'existing',
        email: 'test@example.com',
        password: 'Test123!',
      });

      await expect(
        userService.register({
          username: 'newuser',
          email: 'test@example.com',
          password: 'Test123!',
        })
      ).rejects.toThrow('User already exists');
    });
  });
});
```

### Test Naming

```javascript
// Pattern: "should [expected behavior] when [condition]"
it('should return 401 when token is missing', async () => {});
it('should create wallet when user registers', async () => {});
it('should reject invalid email format', async () => {});
```

### Mocking

```javascript
// ✅ GOOD: Mock external dependencies
jest.mock('../services/emailService');
const emailService = require('../services/emailService');

it('should send welcome email after registration', async () => {
  emailService.sendWelcome.mockResolvedValue(true);

  await userService.register(userData);

  expect(emailService.sendWelcome).toHaveBeenCalledWith(
    userData.email,
    expect.objectContaining({ username: userData.username })
  );
});
```

---

## Documentation

### JSDoc Comments

```javascript
/**
 * Register a new user
 *
 * @param {Object} userData - User registration data
 * @param {string} userData.username - Unique username
 * @param {string} userData.email - Valid email address
 * @param {string} userData.password - Strong password (min 8 chars)
 * @returns {Promise<Object>} Created user object with JWT token
 * @throws {ValidationError} When validation fails
 * @throws {ConflictError} When user already exists
 *
 * @example
 * const user = await userService.register({
 *   username: 'john',
 *   email: 'john@example.com',
 *   password: 'SecurePass123!'
 * });
 */
async register(userData) {
  // Implementation
}
```

### Inline Comments

```javascript
// ✅ GOOD: Explain WHY, not WHAT
// Using bcrypt with 10 rounds for optimal security/performance balance
const hashedPassword = await bcrypt.hash(password, 10);

// Soft delete instead of hard delete to maintain referential integrity
user.isDeleted = true;
await user.save();

// ❌ BAD: Obvious comments
// Hash the password
const hashedPassword = await bcrypt.hash(password, 10);

// Set user to deleted
user.isDeleted = true;
```

### Controller Route Documentation

```javascript
/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
exports.getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(ApiResponse.success('User retrieved', { user }));
});
```

---

## Git Workflow

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
<type>(<scope>): <subject>

# Types
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Code formatting (no logic change)
refactor: Code restructuring
test:     Add/update tests
chore:    Build, dependencies, tooling

# Examples
feat(auth): add JWT refresh token rotation
fix(wallet): prevent race condition in transfers
docs(api): update authentication endpoints
refactor(email): extract templates to separate files
test(user): add integration tests for registration
chore(deps): update mongoose to v9.1.0
```

### Branch Naming

```bash
# Format: <type>/<short-description>

feature/user-authentication
feature/payment-integration
fix/wallet-transaction-bug
refactor/email-service
docs/api-reference
chore/update-dependencies
```

### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally
```

---

## Code Review Checklist

### For Reviewers

- [ ] Code follows project conventions
- [ ] No hardcoded values (use config/constants)
- [ ] Error handling implemented
- [ ] Input validation present
- [ ] Security considerations addressed
- [ ] Performance optimized (indexes, queries)
- [ ] Tests included and passing
- [ ] Documentation updated
- [ ] No console.log() statements
- [ ] Secrets not committed

### For Authors

Before requesting review:

- [ ] Run linter: `npm run lint`
- [ ] Run formatter: `npm run format`
- [ ] Run tests: `npm test`
- [ ] Test locally
- [ ] Update documentation
- [ ] Self-review changes
- [ ] Rebase on latest main
- [ ] Meaningful commit messages

---

## Security Best Practices

### Never commit secrets

```javascript
// ❌ BAD
const API_KEY = 'sk_live_1234567890';

// ✅ GOOD
const API_KEY = process.env.API_KEY;
```

### Validate and sanitize all input

```javascript
// ✅ GOOD
const email = validator.normalizeEmail(req.body.email);
const username = validator.escape(req.body.username);
```

### Use parameterized queries

```javascript
// ✅ GOOD: Mongoose protects against injection
User.findOne({ email: userInput });

// ❌ BAD: Raw query vulnerable to injection
db.collection.find({ email: userInput });
```

### Hash passwords properly

```javascript
// ✅ GOOD: bcrypt with appropriate rounds
const hashedPassword = await bcrypt.hash(password, 10);

// ❌ BAD: Weak hashing
const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
```

---

## Performance Guidelines

### Database Optimization

```javascript
// ✅ GOOD: Select only needed fields
const users = await User.find().select('username email').lean().limit(100);

// ✅ GOOD: Use indexes
userSchema.index({ email: 1 });

// ✅ GOOD: Batch operations
await User.bulkWrite(operations);
```

### Avoid N+1 Queries

```javascript
// ❌ BAD: N+1 queries
const orders = await Order.find();
for (const order of orders) {
  order.user = await User.findById(order.userId);
}

// ✅ GOOD: Single query with populate
const orders = await Order.find().populate('user');
```

### Cache Expensive Operations

```javascript
// ✅ GOOD: Cache frequently accessed data
const getCachedUser = async (userId) => {
  const cacheKey = `user:${userId}`;

  let user = await cache.get(cacheKey);
  if (user) return user;

  user = await User.findById(userId);
  await cache.set(cacheKey, user, 3600); // 1 hour TTL

  return user;
};
```

---

## ESLint Configuration

```json
{
  "env": {
    "node": true,
    "es2021": true
  },
  "extends": ["eslint:recommended"],
  "parserOptions": {
    "ecmaVersion": 12
  },
  "rules": {
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "no-console": "warn",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "arrow-spacing": "error",
    "comma-dangle": ["error", "always-multiline"]
  }
}
```

---

## Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100,
  "arrowParens": "always"
}
```

---

**Last Updated**: February 2026  
**Maintained by**: devnguyen0111
