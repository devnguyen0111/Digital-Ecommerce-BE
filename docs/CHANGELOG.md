# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned

- GraphQL API support
- WebSocket for real-time notifications
- Redis caching layer
- Elasticsearch integration
- Advanced analytics dashboard
- Multi-vendor marketplace features
- Inventory management system
- Order tracking system
- Social authentication (Google, Facebook)
- AI-powered product recommendations

---

## [0.2.1] - 2026-02-08

### Added

- Comprehensive documentation suite
  - ARCHITECTURE.md - System design and patterns
  - CODEBASE_OVERVIEW.md - Code organization guide
  - CODING_CONVENTIONS.md - Code standards
  - CONTRIBUTING.md - Contribution guidelines
  - ENVIRONMENT_SETUP.md - Setup instructions
  - DEPLOYMENT_GUIDE.md - Production deployment guide
  - API_REFERENCE.md - Complete API documentation
  - FOLDER_STRUCTURE.md - Directory organization
- ESLint configuration for code linting
- Prettier configuration for code formatting
- EditorConfig for editor consistency
- GitHub Actions CI/CD workflow
- GitHub issue templates (bug report, feature request)
- GitHub pull request template
- Docker support with Dockerfile and docker-compose.yml
- PM2 ecosystem configuration for production

### Improved

- Enhanced README.md with better structure and examples
- Better error handling across all controllers
- Improved logging with sanitization
- More comprehensive API endpoint documentation

### Fixed

- Documentation inconsistencies
- Missing JSDoc comments

---

## [0.2.0] - 2026-01-20

### Added

- Digital wallet system
  - Wallet creation on user registration
  - Add funds functionality
  - Transaction history
  - Balance management
- PayOS payment gateway integration
  - Payment link creation
  - Webhook handling
  - Payment verification
  - Signature validation
- Email notification system
  - Welcome emails
  - Email verification
  - Password reset emails
  - Transaction notifications
- Multi-language support (i18n)
  - English (en)
  - Vietnamese (vi)
  - Language detection middleware
  - User language preferences

### Changed

- Improved authentication system
  - Added refresh token support
  - Enhanced token expiration handling
  - Better session management
- Enhanced security measures
  - Rate limiting implementation
  - Input validation improvements
  - CORS configuration
  - Helmet for secure headers

### Fixed

- Authentication middleware edge cases
- Email sending error handling
- Database connection stability issues

---

## [0.1.0] - 2026-01-01

### Added

- Initial project setup
- Express.js server configuration
- MongoDB database integration with Mongoose
- User authentication system
  - User registration
  - Login/logout
  - JWT token generation
  - Password hashing with bcrypt
- User management
  - Profile retrieval
  - Profile updates
  - Password change
  - Email verification
- Role-based access control (RBAC)
  - User roles: user, staff, manager, admin
  - Authorization middleware
- API endpoint structure
  - RESTful API design
  - Standardized response format
  - Error handling middleware
- Input validation
  - express-validator integration
  - Custom validation rules
- Basic project documentation
  - README.md
  - API endpoints (api-endpoints.json)
- Development environment setup
  - Environment variables configuration
  - dotenv integration
  - Development scripts

### Security

- Password hashing with bcrypt (10 rounds)
- JWT authentication
- Environment-based configuration
- Input sanitization

---

## [0.0.1] - 2025-12-15

### Added

- Project initialization
- Basic Express server setup
- Package.json with core dependencies
- Git repository initialization
- .gitignore configuration
- Initial folder structure

---

## Version Numbering

This project follows Semantic Versioning (SemVer):

**MAJOR.MINOR.PATCH**

- **MAJOR**: Incompatible API changes
- **MINOR**: New functionality (backward-compatible)
- **PATCH**: Bug fixes (backward-compatible)

---

## Types of Changes

- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

---

## Links

- [GitHub Repository](https://github.com/devnguyen0111/Digital-Ecommerce-BE)
- [Issue Tracker](https://github.com/devnguyen0111/Digital-Ecommerce-BE/issues)
- [Pull Requests](https://github.com/devnguyen0111/Digital-Ecommerce-BE/pulls)

---

**Maintained by**: devnguyen0111
