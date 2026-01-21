const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  member_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  payment_date: {
    type: Date,
    default: Date.now
  },
  payment_method: {
    type: String,
    default: 'Cash'
  },
  membership_plan: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Annual'],
    required: true
  },
  staff_name: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
