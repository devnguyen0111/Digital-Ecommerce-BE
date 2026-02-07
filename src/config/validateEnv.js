/**
 * Validate required environment variables at startup
 * Prevents application from starting with missing critical config
 */

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'PAYOS_CLIENT_ID',
  'PAYOS_API_KEY',
  'PAYOS_CHECKSUM_KEY',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASSWORD'
];

const optionalEnvVars = [
  'FRONTEND_URL',
  'PAYOS_SKIP_SIGNATURE',
  'NODE_ENV',
  'PORT'
];

function validateEnv() {
  const missing = [];
  const warnings = [];

  // Check required variables
  requiredEnvVars.forEach(key => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  // Check optional variables
  optionalEnvVars.forEach(key => {
    if (!process.env[key]) {
      warnings.push(key);
    }
  });

  // Report missing required variables
  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease check your .env file and try again.\n');
    process.exit(1);
  }

  // Report missing optional variables
  if (warnings.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn('\n⚠️  Missing optional environment variables:');
    warnings.forEach(key => console.warn(`   - ${key}`));
    console.warn('\nApplication will start, but some features may not work correctly.\n');
  }

  // Validate specific formats
  validateEmailConfig();
  validatePayOSConfig();
  validateMongoDBURI();

  console.log('✅ Environment validation passed\n');
}

function validateEmailConfig() {
  const port = parseInt(process.env.EMAIL_PORT);
  if (isNaN(port) || port < 1 || port > 65535) {
    console.error('❌ EMAIL_PORT must be a valid port number (1-65535)');
    process.exit(1);
  }
}

function validatePayOSConfig() {
  if (process.env.PAYOS_SKIP_SIGNATURE === 'true' && process.env.NODE_ENV === 'production') {
    console.error('❌ PAYOS_SKIP_SIGNATURE cannot be true in production!');
    process.exit(1);
  }
}

function validateMongoDBURI() {
  const uri = process.env.MONGODB_URI;
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    console.error('❌ MONGODB_URI must start with mongodb:// or mongodb+srv://');
    process.exit(1);
  }
}

module.exports = validateEnv;
