const mongoose = require('mongoose');

const DeletedMachineSchema = new mongoose.Schema({
  machineName: {
    type: String,
    required: true,
    match: [/^[a-zA-Z]+$/, 'Machine name can only contain letters']
  },
  serialNumber: {
    type: String,
    required: true,
    match: [/^[a-zA-Z0-9]+$/, 'Serial number can only contain letters and numbers']
  },
  plantName: {
    type: String,
    required: true
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  gstPercentage: {
    type: Number,
    required: true
  },
  gstAmount: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin'
  },
  deletedAt: {
    type: Date,
    default: Date.now
  },
  deletedBy: {
    type: mongoose.Schema.ObjectId,
    refPath: 'deleterModel',
    required: true
  },
  deleterModel: {
    type: String,
    required: true,
    enum: ['Admin', 'SuperAdmin']
  }
}, {
  timestamps: true,
  collection: 'deleted_machines'
});

module.exports = mongoose.model('DeletedMachine', DeletedMachineSchema);
