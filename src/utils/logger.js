const config = require('../config/env');

/**
 * Logger utility to replace console.log statements
 * Handles different log levels and sanitizes sensitive data
 */

const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

class Logger {
  constructor() {
    this.isDevelopment = config.NODE_ENV === 'development';
  }

  /**
   * Sanitize data before logging
   * Removes/truncates sensitive information
   */
  sanitize(data) {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = Array.isArray(data) ? [...data] : { ...data };
    
    // List of sensitive keys to sanitize
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'signature'];
    
    Object.keys(sanitized).forEach(key => {
      const lowerKey = key.toLowerCase();
      
      // Check if key contains sensitive data
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        if (typeof sanitized[key] === 'string') {
          // Keep first 10 chars for debugging
          sanitized[key] = sanitized[key].substring(0, 10) + '...';
        } else {
          sanitized[key] = '***';
        }
      }
      
      // Recursively sanitize nested objects
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitize(sanitized[key]);
      }
    });

    return sanitized;
  }

  /**
   * Format log message
   */
  format(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const sanitizedMeta = this.sanitize(meta);
    
    return {
      timestamp,
      level,
      message,
      ...(Object.keys(sanitizedMeta).length > 0 && { meta: sanitizedMeta })
    };
  }

  /**
   * Log info level messages
   */
  info(message, meta = {}) {
    if (this.isDevelopment) {
      console.log('ℹ️', message, meta ? this.sanitize(meta) : '');
    } else {
      console.log(JSON.stringify(this.format(LogLevel.INFO, message, meta)));
    }
  }

  /**
   * Log warning level messages
   */
  warn(message, meta = {}) {
    console.warn('⚠️', message, meta ? this.sanitize(meta) : '');
  }

  /**
   * Log error level messages
   */
  error(message, error, meta = {}) {
    const errorInfo = error instanceof Error
      ? {
          message: error.message,
          stack: this.isDevelopment ? error.stack : undefined,
          ...meta
        }
      : { error, ...meta };

    console.error('❌', message, this.sanitize(errorInfo));
  }

  /**
   * Log debug level messages (only in development)
   */
  debug(message, meta = {}) {
    if (this.isDevelopment) {
      console.debug('🐛', message, this.sanitize(meta));
    }
  }

  /**
   * Log webhook events (special formatting)
   */
  webhook(event, data = {}) {
    this.info(`📨 Webhook: ${event}`, data);
  }

  /**
   * Log payment events (special formatting)
   */
  payment(event, data = {}) {
    this.info(`💰 Payment: ${event}`, data);
  }

  /**
   * Log wallet events (special formatting)
   */
  walletEvent(event, data = {}) {
    this.info(`👛 Wallet: ${event}`, data);
  }
}

module.exports = new Logger();
