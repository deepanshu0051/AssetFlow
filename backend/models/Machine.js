const mongoose = require('mongoose');

const MachineSchema = new mongoose.Schema({
  machineName: {
    type: String,
    required: [true, 'Please add a machine name'],
    trim: true,
    match: [/^[a-zA-Z]+$/, 'Machine name can only contain letters (no spaces or special characters)']
  },

  plantName: {
    type: String,
    required: [true, 'Please add a plant name'],
    trim: true
  },
  serialNumber: {
    type: String,
    required: [true, 'Please add a serial number'],
    unique: true,
    trim: true,
    match: [/^[a-zA-Z0-9]+$/, 'Serial number can only contain letters and numbers']
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
    enum: ['In Stock', 'Installed'],
    default: 'In Stock'
  },
  description: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Machine', MachineSchema);
