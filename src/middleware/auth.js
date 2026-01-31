const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config/env");
const ApiResponse = require("../utils/apiResponse");

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists
    if (!token) {
      return res
        .status(401)
        .json(ApiResponse.error("Not authorized to access this route", 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json(ApiResponse.error("User not found", 401));
      }

      next();
    } catch (error) {
      return res
        .status(401)
        .json(ApiResponse.error("Not authorized, token failed", 401));
    }
  } catch (error) {
    next(error);
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(ApiResponse.error("Not authorized", 401));
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json(
          ApiResponse.error(
            `User role '${req.user.role}' is not authorized to access this route`,
            403,
          ),
        );
    }

    next();
  };
};

// Optional authentication - attach user if token is valid but don't fail if missing
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
      } catch (error) {
        // Token is invalid, but we don't fail - just continue without user
        req.user = null;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
