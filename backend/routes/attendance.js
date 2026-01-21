const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const { auth } = require('../middleware/auth');

// Check-in
router.post('/checkin', auth, async (req, res) => {
  try {
    const { member_id } = req.body;
    
    // Get member
    const member = await Member.findById(member_id);
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    // Update and check status
    member.status = member.getStatus();
    await member.save();
    
    if (member.status === 'Expired') {
      return res.status(400).json({ message: 'Member subscription has expired. Please renew.' });
    }
    
    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingCheckIn = await Attendance.findOne({
      member_id,
      check_in_time: { $gte: today },
      check_out_time: null
    });
    
    if (existingCheckIn) {
      return res.status(400).json({ message: 'Member is already checked in' });
    }
    
    // Create check-in
    const attendance = new Attendance({
      member_id,
      check_in_time: new Date(),
      staff_name: req.user.name
    });
    
    await attendance.save();
    
    res.status(201).json({
      message: 'Check-in successful',
      attendance_id: attendance._id,
      member_name: member.name,
      check_in_time: attendance.check_in_time
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check-out
router.post('/checkout', auth, async (req, res) => {
  try {
    const { member_id } = req.body;
    
    // Find active check-in
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await Attendance.findOne({
      member_id,
      check_in_time: { $gte: today },
      check_out_time: null
    });
    
    if (!attendance) {
      return res.status(404).json({ message: 'No active check-in found for this member' });
    }
    
    attendance.check_out_time = new Date();
    await attendance.save();
    
    res.json({
      message: 'Check-out successful',
      check_out_time: attendance.check_out_time
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get attendance records
router.get('/', auth, async (req, res) => {
  try {
    const { member_id, date } = req.query;
    
    let query = {};
    
    if (member_id) {
      query.member_id = member_id;
    }
    
    if (date) {
      const dateObj = new Date(date);
      const nextDay = new Date(dateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      query.check_in_time = { $gte: dateObj, $lt: nextDay };
    }
    
    const attendance = await Attendance.find(query)
      .populate('member_id', 'name contact')
      .sort({ check_in_time: -1 })
      .limit(100);
    
    const formattedAttendance = attendance.map(record => ({
      _id: record._id,
      member_id: record.member_id._id,
      member_name: record.member_id.name,
      member_contact: record.member_id.contact,
      check_in_time: record.check_in_time,
      check_out_time: record.check_out_time,
      staff_name: record.staff_name,
      createdAt: record.createdAt
    }));
    
    res.json(formattedAttendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get today's attendance
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await Attendance.find({
      check_in_time: { $gte: today }
    })
      .populate('member_id', 'name contact')
      .sort({ check_in_time: -1 });
    
    const formattedAttendance = attendance.map(record => ({
      _id: record._id,
      member_id: record.member_id._id,
      member_name: record.member_id.name,
      member_contact: record.member_id.contact,
      check_in_time: record.check_in_time,
      check_out_time: record.check_out_time,
      staff_name: record.staff_name
    }));
    
    res.json(formattedAttendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
