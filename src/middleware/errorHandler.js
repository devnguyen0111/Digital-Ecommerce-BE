const config = require("../config/env");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // log for debugging (development only)
  if (config.NODE_ENV === "development") {
    console.log("Error: ", err);
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error.message = message;
    error.statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${
      field.charAt(0).toUpperCase() + field.slice(1)
    } already exists`;
    error.message = message;
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error.message = message;
    error.statusCode = 400;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error.message = "Invalid token";
    error.statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    error.message = "Token expired";
    error.statusCode = 401;
  }

  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || "Server Error";

  // Response format
  const response = {
    success: false,
    message,
    ...(config.NODE_ENV === "development" && {
      error: err,
      stack: err.stack,
    }),
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
