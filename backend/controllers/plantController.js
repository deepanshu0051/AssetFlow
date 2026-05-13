const Plant = require('../models/Plant');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all plants with machine counts
// @route   GET /api/plants
// @access  Private/SuperAdmin
exports.getPlants = asyncHandler(async (req, res, next) => {
  const plants = await Plant.find();
  
  const plantData = plants.map(p => ({
    plantName: p.plantName,
    machineCount: p.machines?.length || 0
  }));

  res.status(200).json({
    success: true,
    data: plantData
  });
});
