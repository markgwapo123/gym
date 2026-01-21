const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Member = require('../models/Member');
const { auth } = require('../middleware/auth');

// Get all payments
router.get('/', auth, async (req, res) => {
  try {
    const { member_id } = req.query;
    
    let query = {};
    if (member_id) {
      query.member_id = member_id;
    }
    
    const payments = await Payment.find(query)
      .populate('member_id', 'name')
      .sort({ payment_date: -1 })
      .limit(100);
    
    const formattedPayments = payments.map(payment => ({
      _id: payment._id,
      member_id: payment.member_id._id,
      member_name: payment.member_id.name,
      amount: payment.amount,
      payment_date: payment.payment_date,
      payment_method: payment.payment_method,
      membership_plan: payment.membership_plan,
      staff_name: payment.staff_name
    }));
    
    res.json(formattedPayments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Record payment and activate/extend membership
router.post('/', auth, async (req, res) => {
  try {
    const { member_id, amount, membership_plan } = req.body;
    
    // Get member
    const member = await Member.findById(member_id);
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    // Calculate new end date
    const startDate = new Date();
    let endDate = new Date(startDate);
    
    switch (membership_plan) {
      case 'Monthly':
        endDate.setDate(endDate.getDate() + 30);
        break;
      case 'Quarterly':
        endDate.setDate(endDate.getDate() + 90);
        break;
      case 'Annual':
        endDate.setDate(endDate.getDate() + 365);
        break;
      default:
        return res.status(400).json({ message: 'Invalid membership plan' });
    }
    
    // Update member
    member.membership_type = membership_plan;
    member.start_date = startDate;
    member.end_date = endDate;
    member.status = 'Active';
    await member.save();
    
    // Create payment record
    const payment = new Payment({
      member_id,
      amount,
      membership_plan,
      staff_name: req.user.name
    });
    
    await payment.save();
    
    res.status(201).json({
      message: 'Payment recorded and membership activated',
      payment_id: payment._id,
      end_date: endDate
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
