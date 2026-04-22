const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    match: [/^[A-Za-z ]+$/, 'Name can only contain letters and spaces']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^(?=[^@]*[a-z])[a-z0-9]+(\.[a-z0-9]+)?@gmail\.com$/,
      'Enter a valid Gmail (lowercase letters required, only one dot allowed, must include at least one letter)'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    match: [
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/,
      'Password must be at least 6 characters and include a letter, number, and special character'
    ],
    select: false
  },
  role: {
    type: String,
    default: 'admin',
    immutable: true
  },
  plantLocation: {
    type: String,
    required: [true, 'Please specify plant location'],
    enum: ['Noida', 'Delhi', 'Greater Noida', 'Mumbai']
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true,
  collection: 'admins'
});

// Encrypt password using bcrypt
AdminSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
AdminSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT and return
AdminSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Generate and hash password token
AdminSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

module.exports = mongoose.model('Admin', AdminSchema);
