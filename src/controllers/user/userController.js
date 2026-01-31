const User = require("../../models/User");
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const ApiFeatures = require("../../utils/apiFeatures");

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("wallet")
    .select("-password");

  if (!user) {
    return res.status(404).json(ApiResponse.error("User not found", 404));
  }

  res.json(ApiResponse.success("Profile retrieved successfully", { user }));
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const { username } = req.body;
  const user = await User.findById(req.user._id);

  if (username) user.username = username;

  await user.save();

  res.json(
    ApiResponse.success("Profile updated successfully", {
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    }),
  );
});

/**
 * @desc    Change password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res
      .status(400)
      .json(ApiResponse.error("Current password is incorrect", 400));
  }

  user.password = newPassword;
  await user.save();

  res.json(ApiResponse.success("Password changed successfully"));
});

/**
 * @desc    Get all users (Admin)
 * @route   GET /api/users
 * @access  Private/Admin
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query.select("-password");
  const total = await User.countDocuments();

  res.json(
    ApiResponse.paginated(
      users,
      features.page,
      features.limit,
      total,
      "Users retrieved successfully",
    ),
  );
});

/**
 * @desc    Get user by ID (Admin)
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate("wallet")
    .select("-password");

  if (!user) {
    return res.status(404).json(ApiResponse.error("User not found", 404));
  }

  res.json(ApiResponse.success("User retrieved successfully", { user }));
});

/**
 * @desc    Delete user (Admin)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json(ApiResponse.error("User not found", 404));
  }

  await user.deleteOne();

  res.json(ApiResponse.success("User deleted successfully"));
});

/**
 * @desc   add point to user
 * @route   POST /api/users/add-point
 * @access  Private/Admin
 */
exports.addPoint = asyncHandler(async (req, res) => {
  const { userId, points } = req.body;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json(ApiResponse.error("User not found", 404));
  }
  user.crnPoint += points;
  await user.save();
  res.json(ApiResponse.success("Points added successfully", { user }));
});
