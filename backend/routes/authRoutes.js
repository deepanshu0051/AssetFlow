const express = require('express');
const {
  register,
  login,
  getMe,
  getUsers,
  updateProfile,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

const {
  registerValidation,
  loginValidation
} = require('../middleware/validators/authValidator');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/users', protect, authorize('superadmin'), getUsers);

module.exports = router;
