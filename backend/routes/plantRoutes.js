const express = require('express');
const { getPlants } = require('../controllers/plantController');

const router = express.Router();

router.route('/').get(getPlants);

module.exports = router;
