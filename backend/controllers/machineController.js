const Machine = require('../models/Machine');
const DeletedMachine = require('../models/DeletedMachine');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all machines
// @route   GET /api/machines
// @access  Public
exports.getMachines = asyncHandler(async (req, res, next) => {
  const machines = await Machine.find();
  
  res.status(200).json({
    success: true,
    message: 'Machines fetched successfully',
    data: machines
  });
});

// @desc    Get single machine
// @route   GET /api/machines/:id
// @access  Public
exports.getMachine = asyncHandler(async (req, res, next) => {
  const machine = await Machine.findById(req.params.id);

  if (!machine) {
    return res.status(404).json({
      success: false,
      message: `Machine not found with id of ${req.params.id}`,
      data: null
    });
  }

  res.status(200).json({
    success: true,
    message: 'Machine fetched successfully',
    data: machine
  });
});

// @desc    Create new machine
// @route   POST /api/machines
// @access  Public
exports.createMachine = asyncHandler(async (req, res, next) => {
  const { cost, gstPercentage } = req.body;
  if (cost && gstPercentage) {
    req.body.gstAmount = (parseFloat(cost) * parseFloat(gstPercentage)) / 100;
  }

  const machine = await Machine.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Machine created successfully',
    data: machine
  });
});

// @desc    Update machine
// @route   PUT /api/machines/:id
// @access  Public
exports.updateMachine = asyncHandler(async (req, res, next) => {
  const { cost, gstPercentage } = req.body;
  if (cost !== undefined && gstPercentage !== undefined) {
    req.body.gstAmount = (parseFloat(cost) * parseFloat(gstPercentage)) / 100;
  }

  const machine = await Machine.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!machine) {
    return res.status(404).json({
      success: false,
      message: `Machine not found with id of ${req.params.id}`,
      data: null
    });
  }

  res.status(200).json({
    success: true,
    message: 'Machine updated successfully',
    data: machine
  });
});

// @desc    Delete machine
// @route   DELETE /api/machines/:id
// @access  Public
exports.deleteMachine = asyncHandler(async (req, res, next) => {
  const machine = await Machine.findById(req.params.id);

  if (!machine) {
    return res.status(404).json({
      success: false,
      message: `Machine not found with id of ${req.params.id}`,
      data: null
    });
  }

  const machineName = machine.machineName;

  // Create DeletedMachine record (Soft Delete)
  await DeletedMachine.create({
    originalId: machine._id,
    machineName: machine.machineName,

    plantName: machine.plantName,
    serialNumber: machine.serialNumber,
    purchaseDate: machine.purchaseDate,
    cost: machine.cost,
    gstPercentage: machine.gstPercentage,
    gstAmount: machine.gstAmount,
    status: machine.status,
    description: machine.description,
    deletedBy: req.user.id
  });

  await machine.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Machine deleted successfully',
    data: null
  });
});
