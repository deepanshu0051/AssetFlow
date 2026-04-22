const crypto = require('crypto');
const SuperAdmin = require('../models/SuperAdmin');
const Admin = require('../models/Admin');
const asyncHandler = require('../middleware/asyncHandler');
const { sendTokenResponse } = require('../utils/authUtils');

// @desc    Register Admin or SuperAdmin
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, specialAdminId, plantLocation } = req.body;

  // Basic empty field validation
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required'
    });
  }

  // Strict Validation Rules
  const emailRegex = /^(?=[^@]*[a-z])[a-z0-9]+(\.[a-z0-9]+)?@gmail\.com$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Enter a valid Gmail (lowercase letters required, only one dot allowed, must include at least one letter)'
    });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters and include a letter, number, and special character.'
    });
  }

  // If specialAdminId is provided -> Attempt Super Admin Registration
  if (specialAdminId !== undefined) {
    if (specialAdminId !== 'SPADMIN2026') {
      return res.status(403).json({
        success: false,
        message: 'Invalid Super Admin Key'
      });
    }

    const superAdmin = await SuperAdmin.create({ name, email, password });
    return sendTokenResponse(superAdmin, 201, res);
  }

  // Otherwise, register as regular Admin
  if (!plantLocation) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a plant location'
    });
  }

  const admin = await Admin.create({ name, email, password, plantLocation });
  sendTokenResponse(admin, 201, res);
});

// @desc    Login user (checks specific collection strictly)
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email, password, and role'
    });
  }

  // Strict Email Validation for login too
  const emailRegex = /^(?=[^@]*[a-z])[a-z0-9]+(\.[a-z0-9]+)?@gmail\.com$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Enter a valid Gmail (lowercase letters required, only one dot allowed, must include at least one letter)'
    });
  }

  let user = null;

  if (role === 'superadmin') {
    user = await SuperAdmin.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Super Admin credentials'
      });
    }
  } else if (role === 'admin') {
    user = await Admin.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin credentials'
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: 'Invalid role specified'
    });
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: `Invalid ${role === 'superadmin' ? 'Super Admin' : 'Admin'} credentials`
    });
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  // Middleware should have already attached user
  res.status(200).json({
    success: true,
    user: req.user
  });
});

// @desc    Get all admins (Super Admin only)
// @route   GET /api/auth/users
// @access  Private/SuperAdmin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const admins = await Admin.find();
  const superAdmins = await SuperAdmin.find();
  
  res.status(200).json({
    success: true,
    count: admins.length + superAdmins.length,
    data: [...superAdmins, ...admins]
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, password } = req.body;
  const userRole = req.user.role;
  const Model = userRole === 'superadmin' ? SuperAdmin : Admin;

  const user = await Model.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (name) user.name = name;
  if (password) user.password = password;

  await user.save(); // This triggers the pre-save hook for password hashing

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: userRole,
      plantLocation: user.plantLocation // Will be undefined for SuperAdmin, which is fine
    }
  });
});

// @desc    Forgot password - verify email exists and generate reset token
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email, role } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Please enter email first'
    });
  }

  if (!role) {
    return res.status(400).json({
      success: false,
      message: 'Role is required'
    });
  }

  // Strict Gmail validation
  const emailRegex = /^(?=[^@]*[a-z])[a-z0-9]+(\.[a-z0-9]+)?@gmail\.com$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Enter a valid gmail'
    });
  }

  let user = null;

  // Role-based strict lookup — NEVER check both collections
  if (role === 'superadmin') {
    user = await SuperAdmin.findOne({ email });
  } else if (role === 'admin') {
    user = await Admin.findOne({ email });
  } else {
    return res.status(400).json({
      success: false,
      message: 'Invalid role specified'
    });
  }

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Email not registered'
    });
  }

  // Generate reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Reset token generated successfully',
    resetToken
  });
});

// @desc    Reset password using token
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { password, confirmPassword, role } = req.body;

  if (!password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide password and confirm password'
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match'
    });
  }

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  let user = null;

  if (role === 'superadmin') {
    user = await SuperAdmin.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
  } else {
    user = await Admin.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
  }

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successful'
  });
});
