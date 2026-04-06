const express = require('express');
const {
  getMachines,
  getMachine,
  createMachine,
  updateMachine,
  deleteMachine
} = require('../controllers/machineController');

const { machineValidation } = require('../middleware/validators/machineValidator');
const { validate } = require('../middleware/validation');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected all routes
router.use(protect);

router
  .route('/')
  .get(getMachines)
  .post(machineValidation, validate, createMachine);

router
  .route('/:id')
  .get(getMachine)
  .put(machineValidation, validate, updateMachine)
  .delete(deleteMachine);

module.exports = router;
