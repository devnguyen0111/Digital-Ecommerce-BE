require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");

const connectDB = require("./src/config/database");
const errorHandler = require("./src/middleware/errorHandler");
const routes = require("./src/routes");

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Config CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
});
app.use("/api/", limiter);

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Language Middleware
const languageMiddleware = require("./src/middleware/language");
app.use(languageMiddleware);

// Health Check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy and running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api", routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global Error Handler
app.use(errorHandler);

// Start app
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`
        ║═══════════════════════════════════════════════════════════║
            Back-End Ecommerce API
            Enviroment: ${process.env.NODE_ENV || "development"}
            Port: ${port}
            Time: ${new Date().toLocaleString()}
        ║═══════════════════════════════════════════════════════════║
        `);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
});

module.exports = app;
