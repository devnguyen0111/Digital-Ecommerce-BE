const crypto = require("crypto");
const config = require("../../config/env");
const User = require("../../models/User");
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const emailService = require("../../services/emailService");
const walletService = require("../../services/walletService");

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    return res
      .status(400)
      .json(
        ApiResponse.error(
          "User already exists with this email or username",
          400,
        ),
      );
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
  });

  // Generate email verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Create verification URL
  const verificationUrl = `${config.FRONTEND_URL}/verify-email/${verificationToken}`;

  // Send verification email
  try {
    await emailService.sendVerificationEmail(user, verificationUrl);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // Don't fail registration if email fails
  }

  //Create wallet for user
  await walletService.createWallet(user._id);

  // Generate tokens
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  res.status(201).json(
    ApiResponse.success(
      "User registered successfully. Please check your email to verify your account.",
      {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isVerified: user.isVerified,
        },
        token,
        refreshToken,
      },
    ),
  );
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password field
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json(ApiResponse.error("Invalid user", 401));
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json(ApiResponse.error("Invalid password", 401));
  }

  // Optional: Check if email is verified
  // Uncomment below lines if you want to enforce email verification before login
  // if (!user.isVerified) {
  //   return res
  //     .status(401)
  //     .json(
  //       ApiResponse.error(
  //         "Please verify your email before logging in. Check your inbox for verification link.",
  //         401,
  //       ),
  //     );
  // }

  // Generate tokens
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  res.json(
    ApiResponse.success("Login successful", {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
      refreshToken,
    }),
  );
});

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("wallet")
    .select("-password");

  res.json(ApiResponse.success("User retrieved successfully", { user }));
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res
      .status(400)
      .json(ApiResponse.error("Refresh token is required", 400));
  }

  try {
    // Verify refresh token
    const jwt = require("jsonwebtoken");
    const config = require("../config/env");
    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json(ApiResponse.error("Invalid refresh token", 401));
    }

    // Generate new access token
    const newToken = user.generateAuthToken();

    res.json(
      ApiResponse.success("Token refreshed successfully", {
        token: newToken,
      }),
    );
  } catch (error) {
    return res
      .status(401)
      .json(ApiResponse.error("Invalid or expired refresh token", 401));
  }
});

/**
 * @desc    Request password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(404)
      .json(ApiResponse.error("User not found with this email", 404));
  }

  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const config = require("../config/env");
  const resetUrl = `${config.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await emailService.sendPasswordResetEmail(user, resetUrl);

    res.json(ApiResponse.success("Password reset email sent"));
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return res
      .status(500)
      .json(ApiResponse.error("Email could not be sent", 500));
  }
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password/:resetToken
 * @access  Public
 */
exports.resetPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  // Hash token from URL
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Find user with valid reset token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json(ApiResponse.error("Invalid or expired reset token", 400));
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Generate new tokens
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  res.json(
    ApiResponse.success("Password reset successful", {
      token,
      refreshToken,
    }),
  );
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res) => {
  // In a stateless JWT setup, logout is handled on the client side
  // by removing the token. You could implement token blacklisting here
  // if you have a Redis or similar caching system.

  res.json(ApiResponse.success("Logout successful"));
});

/**
 * @desc    Verify email
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  // Hash token from URL
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user with valid verification token
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json(ApiResponse.error("Invalid or expired verification token", 400));
  }

  // Verify user
  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  // Send welcome email after verification
  emailService
    .sendWelcomeEmail(user)
    .catch((err) => console.error("Failed to send welcome email:", err));

  res.json(
    ApiResponse.success(
      "Email verified successfully! Welcome to DN-Ecommerce.",
      {
        isVerified: true,
      },
    ),
  );
});

/**
 * @desc    Resend verification email
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
exports.resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json(ApiResponse.error("Email is required", 400));
  }

  // Find user
  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(404)
      .json(ApiResponse.error("User not found with this email", 404));
  }

  // Check if already verified
  if (user.isVerified) {
    return res
      .status(400)
      .json(ApiResponse.error("Email is already verified", 400));
  }

  // Generate new verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Create verification URL
  const verificationUrl = `${config.FRONTEND_URL}/verify-email/${verificationToken}`;

  try {
    await emailService.sendVerificationEmail(user, verificationUrl);
    res.json(ApiResponse.success("Verification email sent successfully"));
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return res
      .status(500)
      .json(ApiResponse.error("Email could not be sent", 500));
  }
});
