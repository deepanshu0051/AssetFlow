const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.ObjectId,
    refPath: 'recipientModel',
    required: true
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ['Admin', 'SuperAdmin']
  },
  type: {
    type: String,
    enum: ['machine_request', 'request_approved', 'request_rejected', 'machine_deleted'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    machineName: String,
    serialNumber: String,
    plantName: String,
    cost: Number,
    purchaseDate: Date,
    gstPercentage: Number,
    description: String,
    adminName: String,
    adminMobile: String,
    adminId: mongoose.Schema.ObjectId,
    rejectionReason: String,
    superAdminName: String,
    requestId: mongoose.Schema.ObjectId // Keep briefly for compatibility during migration if needed
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', NotificationSchema);
