const { body } = require('express-validator');

exports.machineValidation = [
  body('machineName')
    .notEmpty()
    .withMessage('Machine name is required')
    .matches(/^[a-zA-Z]+$/)
    .withMessage('Machine name can only contain letters (no spaces or special characters)')
    .trim(),
  body('serialNumber')
    .notEmpty()
    .withMessage('Serial number is required')
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage('Serial number can only contain letters and numbers')
    .trim(),
  body('plantName')
    .notEmpty()
    .withMessage('Plant name is required')
    .isIn(['Noida', 'Delhi', 'Greater Noida', 'Mumbai'])
    .withMessage('Plant must be one of: Noida, Delhi, Greater Noida, Mumbai')
    .trim(),
  body('purchaseDate')
    .notEmpty()
    .withMessage('Purchase date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('cost')
    .notEmpty()
    .withMessage('Cost is required')
    .isFloat({ min: 5000 })
    .withMessage('Minimum machine cost must be 5000'),
  body('gstPercentage')
    .optional()
    .isNumeric()
    .withMessage('GST percentage must be a number')
];
