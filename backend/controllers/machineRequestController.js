const Notification = require('../models/Notification');
const SuperAdmin = require('../models/SuperAdmin');
const Plant = require('../models/Plant');

// @desc    Create machine request (Embedded in Notification)
// @route   POST /api/machine-requests
// @access  Private (Admin/SuperAdmin)
exports.createMachineRequest = async (req, res, next) => {
  try {
    const adminData = {
      adminId: req.user.id,
      adminName: req.user.name,
      adminMobile: req.user.mobileNumber
    };

    // Create notification for SuperAdmin(s) with literal data
    const superAdmins = await SuperAdmin.find();
    
    for (const sa of superAdmins) {
      await Notification.create({
        recipient: sa._id,
        recipientModel: 'SuperAdmin',
        type: 'machine_request',
        title: 'New Machine Request',
        message: `${req.user.name} requested a new machine: ${req.body.machineName}`,
        data: {
          ...req.body, // machineName, serialNumber, plantName, cost, purchaseDate, gstPercentage, description
          ...adminData
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Request sent to Super Admin'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve machine request (From Notification Data)
// @route   POST /api/machine-requests/:id/approve
// @access  Private (SuperAdmin)
exports.approveMachineRequest = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification || notification.type !== 'machine_request') {
      return res.status(404).json({ success: false, message: 'Machine request notification not found' });
    }

    if (notification.isRead) {
      return res.status(400).json({ success: false, message: 'Request is already processed' });
    }

    const requestData = notification.data;

    // Find the target plant
    const plant = await Plant.findOne({ plantName: requestData.plantName });

    if (!plant) {
      return res.status(404).json({ success: false, message: `Plant ${requestData.plantName} not found` });
    }

    // Check for global duplicate serial number
    const existingPlantWithMachine = await Plant.findOne({
      'machines.serialNumber': requestData.serialNumber
    });

    if (existingPlantWithMachine) {
      return res.status(400).json({ 
        success: false, 
        message: `Machine with serial number ${requestData.serialNumber} already exists in ${existingPlantWithMachine.plantName} plant` 
      });
    }

    // Calculate GST amount if missing
    const cost = parseFloat(requestData.cost);
    const gstPct = parseInt(requestData.gstPercentage || 18);
    const gstAmount = (cost * gstPct) / 100;

    // Prepare machine object for embedding
    const newMachine = {
      machineName: requestData.machineName,
      serialNumber: requestData.serialNumber,
      purchaseDate: requestData.purchaseDate,
      cost: cost,
      gstPercentage: gstPct,
      gstAmount: gstAmount,
      description: requestData.description,
      createdBy: requestData.adminId
    };

    // Embed in plant
    plant.machines.push(newMachine);
    await plant.save();

    // Notify Admin of Approval
    await Notification.create({
      recipient: requestData.adminId,
      recipientModel: 'Admin',
      type: 'request_approved',
      title: 'Machine Request Approved',
      message: `Your request for machine "${requestData.machineName}" has been approved by SuperAdmin ${req.user.name}.`,
      data: {
        machineName: requestData.machineName,
        serialNumber: requestData.serialNumber,
        superAdminName: req.user.name
      }
    });

    // Mark current notification as read (Marking it processed)
    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Machine approved and added to plant successfully',
      data: plant.machines[plant.machines.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject machine request (From Notification)
// @route   POST /api/machine-requests/:id/reject
// @access  Private (SuperAdmin)
exports.rejectMachineRequest = async (req, res, next) => {
  try {
    const { rejectedReason } = req.body;
    const notification = await Notification.findById(req.params.id);

    if (!notification || notification.type !== 'machine_request') {
      return res.status(404).json({ success: false, message: 'Machine request notification not found' });
    }

    const requestData = notification.data;

    // Notify Admin of Rejection
    await Notification.create({
      recipient: requestData.adminId,
      recipientModel: 'Admin',
      type: 'request_rejected',
      title: 'Machine Request Rejected',
      message: `Your request for machine "${requestData.machineName}" has been rejected by SuperAdmin ${req.user.name}. Reason: ${rejectedReason}`,
      data: {
        machineName: requestData.machineName,
        serialNumber: requestData.serialNumber,
        rejectionReason: rejectedReason,
        superAdminName: req.user.name
      }
    });

    // Mark as read
    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Request rejected',
      rejectionReason: rejectedReason
    });
  } catch (error) {
    next(error);
  }
};
