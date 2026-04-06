const express = require('express');
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} = require('../middleware/validators/authValidator');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/forgotpassword', forgotPasswordValidation, validate, forgotPassword);
router.put('/resetpassword/:resettoken', resetPasswordValidation, validate, resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
