const Plant = require('../models/Plant');
const DeletedMachine = require('../models/DeletedMachine');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all machines (Plant-wise filtering)
// @route   GET /api/machines
// @access  Private
exports.getMachines = asyncHandler(async (req, res, next) => {
  let plants;

  if (req.user.role === 'superadmin') {
    // SuperAdmin sees everything
    plants = await Plant.find().populate('machines.createdBy', 'name email');
  } else {
    // Admin only sees their plant
    plants = await Plant.find({ plantName: req.user.plantLocation }).populate('machines.createdBy', 'name email');
  }

  // Flatten machines for the frontend data table if needed, or return grouped by plant
  let allMachines = [];
  plants.forEach(p => {
    const pMachines = p.machines.map(m => ({
      ...m.toObject(),
      plantName: p.plantName,
      plantId: p._id
    }));
    allMachines = [...allMachines, ...pMachines];
  });

  res.status(200).json({
    success: true,
    message: 'Machines fetched successfully',
    count: allMachines.length,
    data: allMachines,
    groupedData: plants // Optional: if frontend wants nested structure
  });
});

// @desc    Get single machine
// @route   GET /api/machines/:id
// @access  Private
exports.getMachine = asyncHandler(async (req, res, next) => {
  // We have to find the plant first, then the machine inside it
  const plant = await Plant.findOne({
    'machines._id': req.params.id
  });

  if (!plant) {
    return res.status(404).json({
      success: false,
      message: 'Machine not found'
    });
  }

  const machine = plant.machines.id(req.params.id);

  // Authorization check
  if (req.user.role !== 'superadmin' && plant.plantName !== req.user.plantLocation) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view machines from this plant'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      ...machine.toObject(),
      plantName: plant.plantName
    }
  });
});

// @desc    Create new machine (Embedded in Plant)
// @route   POST /api/machines
// @access  Private (Admin/SuperAdmin)
exports.createMachine = asyncHandler(async (req, res, next) => {
  const { machineName, serialNumber, purchaseDate, cost, gstPercentage, description } = req.body;
  const plantLocation = req.user.role === 'superadmin' ? req.body.plantName : req.user.plantLocation;

  if (!plantLocation) {
    return res.status(400).json({
      success: false,
      message: 'Plant location is required'
    });
  }

  const plant = await Plant.findOne({ plantName: plantLocation });

  if (!plant) {
    return res.status(404).json({
      success: false,
      message: `Plant ${plantLocation} does not exist in the system`
    });
  }

  // Create machine object
  const newMachine = {
    machineName,
    serialNumber,
    purchaseDate,
    cost,
    gstPercentage,
    description,
    createdBy: req.user.id
  };

  plant.machines.push(newMachine);
  await plant.save();

  res.status(201).json({
    success: true,
    message: 'Machine added to plant successfully',
    data: plant.machines[plant.machines.length - 1]
  });
});

// @desc    Delete machine (Move to DeletedMachines)
// @route   DELETE /api/machines/:id
// @access  Private
exports.deleteMachine = asyncHandler(async (req, res, next) => {
  const plant = await Plant.findOne({ 'machines._id': req.params.id });

  if (!plant) {
    return res.status(404).json({
      success: false,
      message: 'Machine not found'
    });
  }

  // Auth check
  if (req.user.role !== 'superadmin' && plant.plantName !== req.user.plantLocation) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete machines from this plant'
    });
  }

  const machine = plant.machines.id(req.params.id);
  
  // Create Deleted record
  await DeletedMachine.create({
    machineName: machine.machineName,
    serialNumber: machine.serialNumber,
    plantName: plant.plantName,
    purchaseDate: machine.purchaseDate,
    cost: machine.cost,
    gstPercentage: machine.gstPercentage,
    gstAmount: machine.gstAmount,
    description: machine.description,
    createdBy: machine.createdBy,
    deletedBy: req.user.id,
    deleterModel: req.user.role === 'superadmin' ? 'SuperAdmin' : 'Admin'
  });

  // Remove from plant
  machine.remove();
  await plant.save();

  res.status(200).json({
    success: true,
    message: 'Machine moved to DeletedMachines successfully'
  });
});

// @desc    Update single machine
// @route   PUT /api/machines/:id
// @access  Private
exports.updateMachine = asyncHandler(async (req, res, next) => {
  const { machineName, serialNumber, purchaseDate, cost, gstPercentage, description, plantName } = req.body;
  
  let plant = await Plant.findOne({ 'machines._id': req.params.id });

  if (!plant) {
    return res.status(404).json({
      success: false,
      message: 'Machine not found'
    });
  }

  // Auth check
  if (req.user.role !== 'superadmin' && plant.plantName !== req.user.plantLocation) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to edit machines in this plant'
    });
  }

  let machine = plant.machines.id(req.params.id);

  // Check if plantName is being changed (SuperAdmin only)
  if (req.user.role === 'superadmin' && plantName && plantName !== plant.plantName) {
    const newPlant = await Plant.findOne({ plantName });
    if (!newPlant) {
      return res.status(404).json({
        success: false,
        message: `Plant ${plantName} not found`
      });
    }

    // Copy machine with updated fields
    const updatedMachine = {
      ...machine.toObject(),
      machineName: machineName || machine.machineName,
      serialNumber: serialNumber || machine.serialNumber,
      purchaseDate: purchaseDate || machine.purchaseDate,
      cost: cost || machine.cost,
      gstPercentage: gstPercentage || machine.gstPercentage,
      description: description !== undefined ? description : machine.description,
    };

    // Remove _id so mongoose generates a new one safely, or keep it if allowed.
    // Keeping the original _id is generally safe for subdocuments, but usually better to delete if we face duplicate issues.
    delete updatedMachine._id;
    
    newPlant.machines.push(updatedMachine);
    await newPlant.save();

    // Remove from old plant
    machine.remove();
    await plant.save();

    return res.status(200).json({
      success: true,
      message: 'Machine moved and updated successfully',
      data: newPlant.machines[newPlant.machines.length - 1]
    });
  }

  // Same plant update
  if (machineName) machine.machineName = machineName;
  if (serialNumber) machine.serialNumber = serialNumber;
  if (purchaseDate) machine.purchaseDate = purchaseDate;
  if (cost) machine.cost = cost;
  if (gstPercentage) machine.gstPercentage = gstPercentage;
  if (description !== undefined) machine.description = description;

  await plant.save();

  res.status(200).json({
    success: true,
    message: 'Machine updated successfully',
    data: machine
  });
});

