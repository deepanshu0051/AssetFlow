const express = require('express');
const { userValidation } = require('../middleware/validators/userValidator');
const { validate } = require('../middleware/validation');
const { protect } = require('../middleware/authMiddleware');
const { getUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/userController');

const router = express.Router();

router.use(protect);

// Routes for all authenticated users (with specific checks in controllers/middleware if needed)
router.route('/:id')
  .get(getUser)
  .put(userValidation, validate, updateUser);


router.route('/').get(getUsers).post(userValidation, validate, createUser);
router.route('/:id').delete(deleteUser);

module.exports = router;
