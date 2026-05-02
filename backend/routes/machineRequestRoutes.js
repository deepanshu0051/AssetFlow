const express = require('express');
const {
  createMachineRequest
} = require('../controllers/machineRequestController');

const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

const router = express.Router();

const { machineValidation } = require('../middleware/validators/machineValidator');
const { validate } = require('../middleware/validation');

router.use(protect);

router
  .route('/')
  .post(machineValidation, validate, createMachineRequest);

router.post('/:id/approve', authorize('superadmin'), require('../controllers/machineRequestController').approveMachineRequest);
router.post('/:id/reject', authorize('superadmin'), require('../controllers/machineRequestController').rejectMachineRequest);

module.exports = router;
