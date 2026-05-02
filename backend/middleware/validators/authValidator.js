const { body } = require('express-validator');

exports.registerValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim(),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .matches(/^(?=[^@]*[a-z])[a-z0-9]+(\.[a-z0-9]+)?@gmail\.com$/)
    .withMessage('Enter a valid Gmail (lowercase letters required, only one dot allowed, must include at least one letter)'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('plantLocation')
    .optional()
    .isIn(['Noida', 'Delhi', 'Greater Noida', 'Mumbai'])
    .withMessage('Plant location must be one of: Noida, Delhi, Greater Noida, Mumbai')
];

exports.loginValidation = [
  body('email', 'Enter a valid Gmail').matches(/^(?=[^@]*[a-z])[a-z0-9]+(\.[a-z0-9]+)?@gmail\.com$/),
  body('password', 'Password is required').exists()
];

exports.forgotPasswordValidation = [
  body('email', 'Enter a valid Gmail').matches(/^(?=[^@]*[a-z])[a-z0-9]+(\.[a-z0-9]+)?@gmail\.com$/)
];

exports.resetPasswordValidation = [
  body('password', 'Password is required').notEmpty(),
  body('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];
