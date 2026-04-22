const mongoose = require('mongoose');

const MachineSchema = new mongoose.Schema({
  machineName: {
    type: String,
    required: [true, 'Please add a machine name'],
    trim: true
  },
  serialNumber: {
    type: String,
    required: [true, 'Please add a serial number'],
    unique: true,
    sparse: true,
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
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

const PlantSchema = new mongoose.Schema({
  plantName: {
    type: String,
    required: [true, 'Please specify plant name'],
    unique: true,
    enum: ['Noida', 'Delhi', 'Greater Noida', 'Mumbai']
  },
  machines: [MachineSchema]
}, {
  timestamps: true,
  collection: 'plants'
});

// Calculate GST Amount before saving a plant (if machines updated)
PlantSchema.pre('save', function() {
  if (this.machines && this.machines.length > 0) {
    this.machines.forEach(machine => {
      if (machine.cost && machine.gstPercentage) {
        machine.gstAmount = (machine.cost * machine.gstPercentage) / 100;
      }
    });
  }
});

module.exports = mongoose.model('Plant', PlantSchema);
