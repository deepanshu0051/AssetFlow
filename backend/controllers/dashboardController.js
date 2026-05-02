const SuperAdmin = require('../models/SuperAdmin');
const Admin = require('../models/Admin');
const Plant = require('../models/Plant');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get top-level dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  const isSuperAdmin = req.user.role === 'superadmin';
  
  let stats = {};

  if (isSuperAdmin) {
    // Parallelize counts for SuperAdmin
    const [adminCount, superAdminCount, plantCount] = await Promise.all([
      Admin.countDocuments(),
      SuperAdmin.countDocuments(),
      Plant.countDocuments()
    ]);

    // Aggregate total machines across all plants
    const machinesAggregate = await Plant.aggregate([
      { $project: { machineCount: { $size: "$machines" } } },
      { $group: { _id: null, total: { $sum: "$machineCount" } } }
    ]);

    stats = {
      totalUsers: adminCount + superAdminCount,
      totalMachines: machinesAggregate[0]?.total || 0,
      activePlants: plantCount
    };
  } else {
    // Simple state for regular Admin (scoped to their plant)
    const plant = await Plant.findOne({ plantName: req.user.plantLocation });
    
    stats = {
      totalMachines: plant?.machines?.length || 0,
      plantName: req.user.plantLocation
    };
  }

  res.status(200).json({
    success: true,
    data: stats
  });
});
