module.exports = {
  // Server
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,

  // Database
  MONGODB_URI: process.env.MONGODB_URI,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || "7d",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || "30d",

  // PayOS
  PAYOS_CLIENT_ID: process.env.PAYOS_CLIENT_ID,
  PAYOS_API_KEY: process.env.PAYOS_API_KEY,
  PAYOS_CHECKSUM_KEY: process.env.PAYOS_CHECKSUM_KEY,
  PAYOS_RETURN_URL: process.env.PAYOS_RETURN_URL,
  PAYOS_CANCEL_URL: process.env.PAYOS_CANCEL_URL,

  // Email
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM,

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  // Wallet
  DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY || "VND",
};
