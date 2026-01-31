const { body, param, query, validationResult } = require("express-validator");
const ApiResponse = require("../utils/apiResponse");

// Middleware to check validation results
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res
      .status(400)
      .json(ApiResponse.error("Validation failed", 400, errorMessages));
  }
  next();
};

// User registration validation
exports.registerValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ max: 50 })
    .withMessage("Username cannot exceed 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("role")
    .optional()
    .isIn(["user", "staff", "manager", "admin"])
    .withMessage("Invalid role"),

  body("preferredLanguage")
    .optional()
    .isIn(["en", "vi"])
    .withMessage("Invalid preferred language"),
];

// User login validation
exports.loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

// Product creation/update validation
exports.productValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ max: 200 })
    .withMessage("Product name cannot exceed 200 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid category ID"),

  body("productType")
    .optional()
    .isIn(["physical", "digital_product", "digital_service"])
    .withMessage("Invalid product type"),

  body("stock")
    .optional()
    .isInt({ min: -1 })
    .withMessage("Stock must be -1 or greater")
    .custom((value, { req }) => {
      // Physical products cannot have unlimited stock (-1)
      if (req.body.productType === "physical" && value === -1) {
        throw new Error("Physical products cannot have unlimited stock");
      }
      return true;
    }),
];

// Category validation
exports.categoryValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ max: 50 })
    .withMessage("Category name cannot exceed 50 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("parent")
    .optional()
    .isMongoId()
    .withMessage("Invalid parent category ID"),
];

// Order creation validation
exports.orderValidation = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("Order must contain at least one item"),

  body("items.*.product")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),

  body("items.*.quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  body("paymentMethod")
    .notEmpty()
    .withMessage("Payment method is required")
    .isIn(["wallet", "payos", "cod"])
    .withMessage("Invalid payment method"),

  // Shipping address is optional for digital-only orders
  // Note: Will be validated by Order model based on orderType
  body("shippingAddress.fullName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),

  body("shippingAddress.phone")
    .optional()
    .notEmpty()
    .withMessage("Phone is required")
    .matches(/^[0-9]{10,15}$/)
    .withMessage("Please provide a valid phone number"),

  body("shippingAddress.street")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Street address is required"),

  body("shippingAddress.city")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("City is required"),

  body("shippingAddress.country")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Country is required"),
];

// Review validation
exports.reviewValidation = [
  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("comment")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Comment cannot exceed 500 characters"),
];

// Wallet add funds validation
exports.addFundsValidation = [
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 1000 })
    .withMessage("Amount must be at least 1000"),
];

// MongoDB ObjectId validation
exports.mongoIdValidation = [
  param("id").isMongoId().withMessage("Invalid ID format"),
];
