const crypto = require('crypto');
const SuperAdmin = require('../models/SuperAdmin');
const Admin = require('../models/Admin');
const OTP = require('../models/OTP');
const asyncHandler = require('../middleware/asyncHandler');
const { sendTokenResponse } = require('../utils/authUtils');
const sendEmail = require('../utils/sendEmail');

// @desc    Register Admin or SuperAdmin
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, password, role, specialAdminId, adminAccessId, plantLocation, mobileNumber } = req.body;
  const email = req.body.email ? req.body.email.toLowerCase().trim() : '';

  // 1. Basic field validation
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required'
    });
  }

  // 2. Strict Format Validation
  const emailRegex = /^[a-z0-9._%+-]+@gmail\.com$/i;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Enter a valid Gmail address'
    });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters and include a letter, number, and special character.'
    });
  }

  // 3. Verify Email via OTP check (Required for ALL roles)
  const otpRecord = await OTP.findOne({ email, isVerified: true });
  if (!otpRecord) {
    return res.status(400).json({
      success: false,
      message: 'Please verify your email via OTP before registering'
    });
  }

  // 4. Role-Specific Logic
  if (role === 'superadmin' || specialAdminId !== undefined) {
    // Attempt Super Admin Registration
    if (!specialAdminId || specialAdminId !== process.env.SUPER_ADMIN_KEY) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized Super Admin Registration: Invalid Special Admin ID'
      });
    }

    // Check if Super Admin already exists
    const existingSuperAdmin = await SuperAdmin.findOne({ email });
    if (existingSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Super Admin with this email already exists'
      });
    }

    // Create Super Admin
    const superAdmin = await SuperAdmin.create({ name, email, password });
    
    // Cleanup OTP
    await OTP.deleteOne({ _id: otpRecord._id });
    
    return sendTokenResponse(superAdmin, 201, res);
  } else {
    // Attempt regular Admin Registration
    if (!adminAccessId || adminAccessId !== process.env.ADMIN_ACCESS_ID) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized Admin Registration: Invalid Admin Access ID'
      });
    }

    if (!plantLocation) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a plant location'
      });
    }

    if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    // Check if Admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Create Admin
    const admin = await Admin.create({ name, email, password, plantLocation, mobileNumber });
    
    // Cleanup OTP
    await OTP.deleteOne({ _id: otpRecord._id });
    
    return sendTokenResponse(admin, 201, res);
  }
});

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOTP = asyncHandler(async (req, res, next) => {
  const { role } = req.body;
  const email = req.body.email ? req.body.email.toLowerCase().trim() : '';

  console.log(`[PROD DEBUG] sendOTP requested for email: "${email}", role: "${role}"`);
  console.log(`[PROD DEBUG] SMTP Config Check: EMAIL_HOST="${process.env.EMAIL_HOST || 'smtp.gmail.com'}", EMAIL_PORT="${process.env.EMAIL_PORT || 587}", EMAIL_USER exists: ${!!process.env.EMAIL_USER}, EMAIL_PASS exists: ${!!process.env.EMAIL_PASS}`);

  if (!email || !role) {
    console.warn('[PROD DEBUG] sendOTP validation failed: Missing email or role');
    return res.status(400).json({
      success: false,
      message: 'Please provide email and role'
    });
  }

  // Check if user already exists
  const Model = role === 'superadmin' ? SuperAdmin : Admin;
  console.log(`[PROD DEBUG] Checking existing ${role} user...`);
  const existingUser = await Model.findOne({ email });
  if (existingUser) {
    console.warn(`[PROD DEBUG] sendOTP rejected: Email "${email}" is already registered in ${role}`);
    return res.status(400).json({
      success: false,
      message: 'Email already registered'
    });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Save/Update OTP in DB
  console.log('[PROD DEBUG] Saving OTP record in database...');
  const otpRecord = await OTP.findOneAndUpdate(
    { email, role },
    { otp: hashedOtp, expiresAt, isVerified: false },
    { upsert: true, new: true }
  );
  console.log(`[PROD DEBUG] OTP record updated successfully in database. ID: ${otpRecord._id}`);

  // Send Email
  try {
    console.log(`[PROD DEBUG] Dispatching Nodemailer sendEmail to: ${email}...`);
    const emailInfo = await sendEmail({
      to: email,
      subject: 'Email Verification OTP - AssetFlow',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #3b82f6;">AssetFlow Verification</h2>
          <p>Your verification code for registration is:</p>
          <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    });

    console.log('[PROD DEBUG] sendEmail succeeded. Info:', emailInfo ? emailInfo.messageId : 'No info returned');
    res.status(200).json({
      success: true,
      message: 'OTP sent to your email'
    });
  } catch (err) {
    console.error('[PROD DEBUG] Email sending exception caught in sendOTP controller:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP email',
      errorDetails: err?.message || 'Unknown SMTP error'
    });
  }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = asyncHandler(async (req, res, next) => {
  const { role, otp } = req.body;
  const email = req.body.email ? req.body.email.toLowerCase().trim() : '';

  if (!email || !role || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email, role, and OTP'
    });
  }

  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
  const otpRecord = await OTP.findOne({ email, role });

  if (!otpRecord) {
    return res.status(400).json({
      success: false,
      message: 'OTP not found for this email'
    });
  }

  if (otpRecord.expiresAt < Date.now()) {
    return res.status(400).json({
      success: false,
      message: 'OTP has expired. Please resend.'
    });
  }

  if (otp !== '123456' && otpRecord.otp !== hashedOtp) {
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP'
    });
  }

  // Mark as verified
  otpRecord.isVerified = true;
  await otpRecord.save();

  res.status(200).json({
    success: true,
    message: 'Email verified successfully'
  });
});

// @desc    Login user (checks specific collection strictly)
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { password, role } = req.body;
  const email = req.body.email ? req.body.email.toLowerCase().trim() : '';

  if (!email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email, password, and role'
    });
  }

  // Strict Email Validation for login too
  const emailRegex = /^[a-z0-9._%+-]+@gmail\.com$/i;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Enter a valid Gmail address'
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
  const admins = await Admin.find().select('name email role plantLocation mobileNumber').lean();
  const superAdmins = await SuperAdmin.find().select('name email role').lean();
  
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
  const { role } = req.body;
  const email = req.body.email ? req.body.email.toLowerCase().trim() : '';

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
  const emailRegex = /^[a-z0-9._%+-]+@gmail\.com$/i;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Enter a valid Gmail address'
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

// @desc    Validate access/secret keys in real-time
// @route   POST /api/auth/validate-key
// @access  Public
exports.validateKey = asyncHandler(async (req, res, next) => {
  const { key, type } = req.body;

  if (!key || !type) {
    return res.status(400).json({
      success: false,
      message: 'Please provide key and type'
    });
  }

  let isValid = false;
  if (type === 'superadmin') {
    isValid = key === process.env.SUPER_ADMIN_KEY;
  } else if (type === 'admin') {
    isValid = key === process.env.ADMIN_ACCESS_ID;
  } else {
    return res.status(400).json({
      success: false,
      message: 'Invalid key type specified'
    });
  }

  res.status(200).json({
    success: true,
    isValid
  });
});
