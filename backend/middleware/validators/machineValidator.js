const { body } = require('express-validator');

exports.machineValidation = [
  body('machineName')
    .notEmpty()
    .withMessage('Machine name is required')
    .trim(),
  body('serialNumber')
    .notEmpty()
    .withMessage('Serial number is required')
    .trim(),
  body('plantName')
    .notEmpty()
    .withMessage('Plant name is required')
    .trim(),

  body('purchaseDate')
    .notEmpty()
    .withMessage('Purchase date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('cost')
    .notEmpty()
    .withMessage('Cost is required')
    .isNumeric()
    .withMessage('Cost must be a number'),
  body('gstPercentage')
    .optional()
    .isNumeric()
    .withMessage('GST percentage must be a number'),
  body('status')
    .optional()
    .isIn(['In Stock', 'Installed'])
    .withMessage('Invalid status value')
];
