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

  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found', data: null });
  res.status(200).json({ success: true, message: 'User updated successfully', data: user });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found', data: null });
  res.status(200).json({ success: true, message: 'User deleted successfully', data: null });
});
