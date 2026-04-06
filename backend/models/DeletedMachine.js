const mongoose = require('mongoose');

const DeletedMachineSchema = new mongoose.Schema({
  originalId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  machineName: String,

  plantName: String,
  serialNumber: String,
  purchaseDate: Date,
  cost: Number,
  gstPercentage: Number,
  gstAmount: Number,
  status: String,
  description: String,
  deletedAt: {
    type: Date,
    default: Date.now
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'deleted_machines'
});

module.exports = mongoose.model('DeletedMachine', DeletedMachineSchema);
