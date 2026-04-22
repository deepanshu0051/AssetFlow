const Plant = require('../models/Plant');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all plants
// @route   GET /api/plants
// @access  Public
exports.getPlants = asyncHandler(async (req, res, next) => {
  const plants = await Plant.find().select('plantName -_id'); // We only need plant names

  res.status(200).json({
    success: true,
    data: plants.map(p => p.plantName)
  });
});
