const mongoose = require('mongoose');

const MachineRequestSchema = new mongoose.Schema({
  machineName: {
    type: String,
    required: [true, 'Please add a machine name'],
    trim: true
  },
  plantName: {
    type: String,
    required: [true, 'Please add a plant name'],
    trim: true
  },
  serialNumber: {
    type: String,
    required: [true, 'Please add a serial number'],
    trim: true
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Please add a purchase date']
  },
  cost: {
    type: Number,
    required: [true, 'Please add a cost']
  },
  gstPercentage: {
    type: Number,
    required: [true, 'Please add GST percentage'],
    default: 18
  },
  gstAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  description: {
    type: String,
    trim: true
  },
  admin: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectedReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MachineRequest', MachineRequestSchema);
