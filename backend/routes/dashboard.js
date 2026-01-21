const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const { auth } = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
  try {
    // Total members
    const total_members = await Member.countDocuments();
    
    // Active members
    const active_members = await Member.countDocuments({ status: 'Active' });
    
    // Expiring soon
    const expiring_soon = await Member.countDocuments({ status: 'Expiring Soon' });
    
    // Today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const today_attendance = await Attendance.countDocuments({
      check_in_time: { $gte: today }
    });
    
    // Currently checked in
    const currently_checked_in = await Attendance.countDocuments({
      check_in_time: { $gte: today },
      check_out_time: null
    });
    
    // This month's revenue
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const payments = await Payment.find({
      payment_date: { $gte: monthStart }
    });
    
    const monthly_revenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    res.json({
      total_members,
      active_members,
      expiring_soon,
      today_attendance,
      currently_checked_in,
      monthly_revenue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
