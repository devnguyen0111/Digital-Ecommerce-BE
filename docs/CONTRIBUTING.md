# 🤝 Contributing to Digital E-Commerce Backend

Thank you for considering contributing to our project! This guide will help you get started.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing Requirements](#testing-requirements)
8. [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for everyone, regardless of:

- Experience level
- Gender identity
- Sexual orientation
- Disability
- Personal appearance
- Race or ethnicity
- Age
- Religion

### Expected Behavior

- ✅ Be respectful and constructive
- ✅ Accept constructive criticism gracefully
- ✅ Focus on what's best for the community
- ✅ Show empathy towards others

### Unacceptable Behavior

- ❌ Harassment or discriminatory language
- ❌ Personal attacks or insults
- ❌ Trolling or inflammatory comments
- ❌ Publishing others' private information

---

## Getting Started

### Prerequisites

- Node.js ≥ 14.0.0
- MongoDB ≥ 4.4
- Git
- npm or yarn
- Code editor (VS Code recommended)

### Fork and Clone

```bash
# 1. Fork the repository on GitHub
# Click the "Fork" button at https://github.com/devnguyen0111/Digital-Ecommerce-BE

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/Digital-Ecommerce-BE.git
cd Digital-Ecommerce-BE

# 3. Add upstream remote
git remote add upstream https://github.com/devnguyen0111/Digital-Ecommerce-BE.git

# 4. Verify remotes
git remote -v
# origin    https://github.com/YOUR_USERNAME/Digital-Ecommerce-BE.git (fetch)
# origin    https://github.com/YOUR_USERNAME/Digital-Ecommerce-BE.git (push)
# upstream  https://github.com/devnguyen0111/Digital-Ecommerce-BE.git (fetch)
# upstream  https://github.com/devnguyen0111/Digital-Ecommerce-BE.git (push)
```

### Initial Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Configure .env with your settings
# Edit .env with your MongoDB URI, JWT secrets, etc.

# 4. Start MongoDB (if not already running)
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# 5. Run the development server
npm run dev

# 6. Verify server is running
curl http://localhost:5000/health
```

---

## Development Workflow

### 1. Create a Feature Branch

```bash
# Always create a new branch from the latest main
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

### Branch Naming Convention

```
feature/    New feature
fix/        Bug fix
refactor/   Code refactoring
docs/       Documentation
test/       Testing
chore/      Maintenance tasks

Examples:
feature/user-authentication
fix/wallet-transaction-bug
refactor/email-service
docs/api-reference
test/user-integration-tests
chore/update-dependencies
```

### 2. Make Your Changes

```bash
# Make code changes
# Add tests
# Update documentation

# Check status
git status

# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat(auth): add JWT refresh token rotation"
```

### 3. Keep Your Branch Updated

```bash
# Regularly sync with upstream
git fetch upstream
git rebase upstream/main

# Resolve conflicts if any
# Then continue rebase
git rebase --continue
```

### 4. Push to Your Fork

```bash
# Push your branch
git push origin feature/your-feature-name

# If rebased, force push (only on your fork)
git push origin feature/your-feature-name --force-with-lease
```

### 5. Create Pull Request

1. Go to GitHub
2. Navigate to your fork
3. Click "Compare & pull request"
4. Fill in the PR template
5. Submit for review

---

## Coding Standards

### Follow Project Conventions

- Read [CODING_CONVENTIONS.md](CODING_CONVENTIONS.md)
- Use ESLint and Prettier
- Follow existing code structure
- Write meaningful variable/function names

### Code Quality Checks

```bash
# Run linter
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Pre-Commit Checklist

Before committing:

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] No ESLint warnings/errors
- [ ] Code is properly formatted
- [ ] No `console.log()` statements
- [ ] No commented-out code
- [ ] Secrets not committed

---

## Commit Guidelines

### Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type       | Description                       |
| ---------- | --------------------------------- |
| `feat`     | New feature                       |
| `fix`      | Bug fix                           |
| `docs`     | Documentation only                |
| `style`    | Code formatting (no logic change) |
| `refactor` | Code restructuring                |
| `perf`     | Performance improvement           |
| `test`     | Add or update tests               |
| `chore`    | Tooling, dependencies, configs    |

### Scopes

| Scope     | Description        |
| --------- | ------------------ |
| `auth`    | Authentication     |
| `user`    | User management    |
| `wallet`  | Wallet operations  |
| `payment` | Payment processing |
| `email`   | Email service      |
| `api`     | API endpoints      |
| `db`      | Database           |
| `config`  | Configuration      |

### Examples

```bash
# Feature
git commit -m "feat(auth): add JWT refresh token rotation"

# Bug fix
git commit -m "fix(wallet): prevent race condition in fund transfers"

# Documentation
git commit -m "docs(api): update authentication endpoints"

# Refactor
git commit -m "refactor(email): extract templates to separate files"

# Test
git commit -m "test(user): add integration tests for registration flow"

# Chore
git commit -m "chore(deps): update mongoose to v9.1.0"

# With body and footer
git commit -m "feat(payment): integrate PayOS webhook handling

Add webhook endpoint to receive payment status updates from PayOS.
Implements signature verification and transaction updates.

Closes #42"
```

### Commit Message Rules

- ✅ Use present tense ("add feature" not "added feature")
- ✅ Use imperative mood ("move cursor to" not "moves cursor to")
- ✅ Capitalize first letter of subject
- ✅ No period at the end of subject
- ✅ Limit subject line to 72 characters
- ✅ Reference issues/PRs when applicable

---

## Pull Request Process

### Before Submitting

1. **Sync with upstream**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run quality checks**

   ```bash
   npm run lint
   npm test
   ```

3. **Update documentation**
   - Update README if needed
   - Add JSDoc comments
   - Update API documentation

4. **Self-review**
   - Review your own code
   - Check for sensitive data
   - Verify formatting

### PR Template

When creating a PR, fill out this template:

```markdown
## Description

[Brief description of changes]

## Motivation

[Why is this change needed?]

## Type of Change

- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to break)
- [ ] Documentation update

## Changes Made

- [Change 1]
- [Change 2]
- [Change 3]

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

**Test Instructions:**

1. Step 1
2. Step 2
3. Expected result

## Screenshots (if applicable)

[Add screenshots or GIFs]

## Checklist

- [ ] Code follows project conventions
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests pass locally
- [ ] No new warnings
- [ ] Lint passes
- [ ] Branch is up to date with main

## Related Issues

Closes #[issue number]
```

### PR Review Process

1. **Automated Checks** (CI)
   - Linting
   - Tests
   - Code coverage

2. **Code Review** (Maintainer)
   - Code quality
   - Architecture
   - Security
   - Performance

3. **Revisions** (You)
   - Address feedback
   - Make requested changes
   - Push updates

4. **Approval & Merge** (Maintainer)
   - Squash and merge
   - Update changelog

### Responding to Feedback

```bash
# Make requested changes
# Commit changes
git add .
git commit -m "refactor: address review feedback"

# Push updates
git push origin feature/your-feature-name

# PR will automatically update
```

---

## Testing Requirements

### Test Coverage

All PRs should include tests:

- **New features**: Add tests for new functionality
- **Bug fixes**: Add regression tests
- **Refactors**: Ensure existing tests still pass

### Test Types

#### Unit Tests

Test individual functions/methods:

```javascript
// tests/unit/services/userService.test.js
describe('UserService', () => {
  describe('hashPassword', () => {
    it('should hash password with bcrypt', async () => {
      const password = 'Test123!';
      const hashed = await userService.hashPassword(password);

      expect(hashed).not.toBe(password);
      expect(await bcrypt.compare(password, hashed)).toBe(true);
    });
  });
});
```

#### Integration Tests

Test API endpoints:

```javascript
// tests/integration/auth.test.js
describe('POST /api/auth/register', () => {
  it('should register new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test123!',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- userService.test.js

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

### Coverage Requirements

- Minimum 70% overall coverage
- 80%+ for critical paths (auth, payment, wallet)
- 100% for utility functions

---

## Documentation

### What to Document

1. **Code Comments**
   - JSDoc for public functions
   - Inline comments for complex logic

2. **API Documentation**
   - Update `docs/API_REFERENCE.md`
   - Include request/response examples

3. **README**
   - Update if adding new features
   - Update installation steps if needed

4. **Changelog**
   - Maintainer will update
   - You can suggest entry

### JSDoc Example

```javascript
/**
 * Transfer funds between two wallets
 *
 * @param {string} fromWalletId - Source wallet ID
 * @param {string} toWalletId - Destination wallet ID
 * @param {number} amount - Amount to transfer (VND)
 * @param {string} description - Transfer description
 * @returns {Promise<Object>} Transaction details
 * @throws {InsufficientFundsError} When source wallet has insufficient balance
 * @throws {NotFoundError} When wallet not found
 *
 * @example
 * const transaction = await walletService.transfer(
 *   '507f1f77bcf86cd799439011',
 *   '507f1f77bcf86cd799439012',
 *   100000,
 *   'Payment for order #123'
 * );
 */
async transfer(fromWalletId, toWalletId, amount, description) {
  // Implementation
}
```

---

## Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:

1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened.

**Screenshots**
If applicable, add screenshots.

**Environment:**

- OS: [e.g., Windows 10]
- Node.js version: [e.g., 16.14.0]
- MongoDB version: [e.g., 4.4]

**Additional context**
Any other context about the problem.
```

### Feature Requests

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Any other context or screenshots.
```

---

## Getting Help

### Resources

- 📖 [Documentation](/docs)
- 💬 [GitHub Discussions](https://github.com/devnguyen0111/Digital-Ecommerce-BE/discussions)
- 🐛 [Issue Tracker](https://github.com/devnguyen0111/Digital-Ecommerce-BE/issues)

### Questions

Before asking:

1. Check existing documentation
2. Search closed issues
3. Search GitHub Discussions

If still stuck, open a Discussion (not an Issue).

---

## Recognition

Contributors will be:

- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in the project

---

## License

By contributing, you agree that your contributions will be licensed under the ISC License.

---

## Thank You! 🎉

Your contributions make this project better for everyone. We appreciate your time and effort!

---

**Last Updated**: February 2026  
**Maintained by**: devnguyen0111
