const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  member_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  check_in_time: {
    type: Date,
    required: true
  },
  check_out_time: {
    type: Date,
    default: null
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

module.exports = mongoose.model('Attendance', attendanceSchema);
