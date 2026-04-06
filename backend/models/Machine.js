const mongoose = require('mongoose');

const MachineSchema = new mongoose.Schema({
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
    unique: true,
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
    enum: ['In Stock', 'Installed'],
    default: 'In Stock'
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Machine', MachineSchema);
