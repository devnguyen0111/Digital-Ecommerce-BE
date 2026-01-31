const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user/userController");
const { protect, authorize } = require("../../middleware/auth");
const { mongoIdValidation, validate } = require("../../middleware/validators");

// Get user profile
router.get("/profile", protect, userController.getProfile);

// Update user profile
router.put("/profile", protect, userController.updateProfile);

// Change password
router.put("/change-password", protect, userController.changePassword);

// Get all users (admin, manager)
router.get(
  "/",
  protect,
  authorize("admin", "manager"),
  userController.getAllUsers,
);

// Get user by ID (admin, manager)
router.get(
  "/:id",
  protect,
  authorize("admin", "manager"),
  mongoIdValidation,
  validate,
  userController.getUserById,
);

// Delete user by ID (admin)
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  mongoIdValidation,
  validate,
  userController.deleteUser,
);

// Add points to user (staff, manager, admin)
router.post(
  "/:id/add-points",
  protect,
  authorize("staff", "manager", "admin"),
  mongoIdValidation,
  validate,
  userController.addPoint,
);

module.exports = router;
