/**
 * Application constants
 * Centralized location for all magic numbers and configuration values
 */

module.exports = {
  // Wallet Configuration
  WALLET: {
    MIN_AMOUNT: 1000, // 1,000 VND minimum
    MAX_AMOUNT: 100000000, // 100,000,000 VND maximum
    CURRENCY: 'VND',
    DEFAULT_BALANCE: 0
  },

  // Security Configuration
  SECURITY: {
    BCRYPT_ROUNDS: 10,
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_MAX_LENGTH: 128,
    TOKEN_EXPIRY_MINUTES: 15,
    EMAIL_TOKEN_EXPIRY_HOURS: 24,
    RESET_TOKEN_EXPIRY_MINUTES: 15
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
    WEBHOOK_MAX: 100,
    WEBHOOK_WINDOW_MS: 60 * 1000 // 1 minute
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },

  // File Upload
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
  },

  // User Roles
  ROLES: {
    USER: 'user',
    STAFF: 'staff',
    MANAGER: 'manager',
    ADMIN: 'admin'
  },

  // Payment Status
  PAYMENT_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SUCCESS: 'success',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
  },

  // PayOS Status Codes
  PAYOS: {
    CODE_SUCCESS: '00',
    CODE_CANCELLED: '02',
    STATUS_PAID: 'PAID',
    STATUS_CANCELLED: 'CANCELLED',
    STATUS_EXPIRED: 'EXPIRED',
    PAYMENT_EXPIRY_MINUTES: 15
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  }
};
