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

// Helper for Machine Validation
const validateMachineData = (data) => {
  const { machineName, plantName, purchaseDate, cost, serialNumber } = data;
  const errors = [];

  if (!machineName || !machineName.trim()) errors.push('Machine Name is required');
  else if (!/^[A-Za-z\s]+$/.test(machineName.trim())) errors.push('Machine Name: Only letters are allowed');

  if (!plantName || !plantName.trim()) errors.push('Plant Name is required');
  else if (!/^[A-Za-z\s]+$/.test(plantName.trim())) errors.push('Plant Name: Only letters are allowed');

  if (!serialNumber || !serialNumber.trim()) errors.push('Serial Number is required');

  if (!purchaseDate) errors.push('Purchase Date is required');
  else {
    const selectedDate = new Date(purchaseDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selectedDate > today) errors.push('Future date is not allowed for Purchase Date');
  }

  if (cost === undefined || cost === '') errors.push('Cost is required');
  else if (isNaN(cost)) errors.push('Cost: Only numbers are allowed');
  else if (parseFloat(cost) <= 0) errors.push('Cost must be a positive number');

  return errors;
};

// @desc    Create new machine
// @route   POST /api/machines
// @access  Public
exports.createMachine = asyncHandler(async (req, res, next) => {
  // Trim fields
  if (req.body.machineName) req.body.machineName = req.body.machineName.trim();
  if (req.body.plantName) req.body.plantName = req.body.plantName.trim();
  if (req.body.serialNumber) req.body.serialNumber = req.body.serialNumber.trim();
  if (req.body.description) req.body.description = req.body.description.trim();

  // Validate
  const validationErrors = validateMachineData(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      message: validationErrors[0], // Return the first error as per requirements
      errors: validationErrors
    });
  }

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
  // Trim fields
  if (req.body.machineName) req.body.machineName = req.body.machineName.trim();
  if (req.body.plantName) req.body.plantName = req.body.plantName.trim();
  if (req.body.serialNumber) req.body.serialNumber = req.body.serialNumber.trim();
  if (req.body.description) req.body.description = req.body.description.trim();

  // Validate if fields are provided (partial update supported but we check if provided)
  const validationErrors = validateMachineData({ ...req.body, purchaseDate: req.body.purchaseDate || '2000-01-01' }); // Minimal mock for purchaseDate if not provided in partial update
  // Actually, we should probably check if the fields that are present are valid.
  // But since the frontend sends everything, let's keep it simple.
  
  if (validationErrors.length > 0) {
    // Only check fields that are actually in req.body for PUT if it was partial, 
    // but here it's expected to be full data from frontend.
    // Let's refine the validation call to only check what's sent.
  }

  // Simplified: Since we know the frontend sends the whole form, let's just validate it all.
  const finalValidationErrors = validateMachineData(req.body);
  if (finalValidationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      message: finalValidationErrors[0],
      errors: finalValidationErrors
    });
  }

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
