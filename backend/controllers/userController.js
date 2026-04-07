const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({ success: true, message: 'Users fetched successfully', data: users });
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found', data: null });
  res.status(200).json({ success: true, message: 'User fetched successfully', data: user });
});

exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(201).json({ success: true, message: 'User created successfully', data: user });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  // Allow only the user themselves to update
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
  }

  const { name, email, phoneNumber, companyName } = req.body;
  const errors = [];

  // Trimming and Validation
  const trimmedName = name ? name.trim() : '';
  const trimmedEmail = email ? email.trim() : '';
  const trimmedPhone = phoneNumber ? phoneNumber.trim() : '';
  const trimmedCompany = companyName ? companyName.trim() : '';

  if (!trimmedName) errors.push('Name is required');
  else if (!/^[A-Za-z\s]+$/.test(trimmedName)) errors.push('Name: Only letters are allowed');

  if (!trimmedEmail) errors.push('Email is required');
  else if (!/^[^\s@]+@gmail\.com$/.test(trimmedEmail)) errors.push('Enter a valid Gmail address');

  if (!trimmedPhone) errors.push('Phone Number is required');
  else if (!/^\+?\d+$/.test(trimmedPhone)) errors.push('Phone Number: Only numbers are allowed');

  if (trimmedCompany && !/^[A-Za-z\s]+$/.test(trimmedCompany)) {
    errors.push('Company Name: Only letters are allowed');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0], errors });
  }

  const updateData = {
    name: trimmedName,
    email: trimmedEmail,
    phoneNumber: trimmedPhone,
    companyName: trimmedCompany
  };

  const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found', data: null });
  res.status(200).json({ success: true, message: 'User updated successfully', data: user });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found', data: null });
  res.status(200).json({ success: true, message: 'User deleted successfully', data: null });
});
