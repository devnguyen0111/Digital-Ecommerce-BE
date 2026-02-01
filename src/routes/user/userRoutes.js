const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user/userController");
const { protect, authorize } = require("../../middleware/auth");
const { mongoIdValidation, validate } = require("../../middleware/validators");

router.get("/profile", protect, userController.getProfile);

router.put("/profile", protect, userController.updateProfile);

router.put("/change-password", protect, userController.changePassword);

router.get(
  "/",
  protect,
  authorize("admin", "manager"),
  userController.getAllUsers,
);

router.get(
  "/:id",
  protect,
  authorize("admin", "manager"),
  mongoIdValidation,
  validate,
  userController.getUserById,
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  mongoIdValidation,
  validate,
  userController.deleteUser,
);

router.post(
  "/:id/add-points",
  protect,
  authorize("staff", "manager", "admin"),
  mongoIdValidation,
  validate,
  userController.addPoint,
);

module.exports = router;
