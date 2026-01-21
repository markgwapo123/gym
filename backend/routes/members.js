const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const { auth, adminOnly } = require('../middleware/auth');

// Get all members
router.get('/', auth, async (req, res) => {
  try {
    const members = await Member.find();
    
    // Update status for each member
    members.forEach(member => {
      member.status = member.getStatus();
    });
    
    await Promise.all(members.map(m => m.save()));
    
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single member
router.get('/:id', auth, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    member.status = member.getStatus();
    await member.save();
    
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create member (Admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { 
      name, 
      email, 
      contact, 
      age, 
      date_of_birth, 
      gender, 
      address, 
      emergency_contact, 
      photo_url, 
      id_number, 
      membership_type, 
      start_date, 
      end_date,
      notes 
    } = req.body;
    
    const member = new Member({
      name,
      email,
      contact,
      age,
      date_of_birth,
      gender,
      address,
      emergency_contact,
      photo_url,
      id_number,
      membership_type,
      start_date,
      end_date,
      notes
    });
    
    await member.save();
    
    res.status(201).json({
      message: 'Member created successfully',
      member_id: member._id,
      generated_member_id: member.member_id
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update member (Admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { 
      name, 
      email, 
      contact, 
      age, 
      date_of_birth, 
      gender, 
      address, 
      emergency_contact, 
      photo_url, 
      id_number, 
      membership_type, 
      start_date, 
      end_date,
      notes 
    } = req.body;
    
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    if (name) member.name = name;
    if (email !== undefined) member.email = email;
    if (contact) member.contact = contact;
    if (age !== undefined) member.age = age;
    if (date_of_birth !== undefined) member.date_of_birth = date_of_birth;
    if (gender !== undefined) member.gender = gender;
    if (address !== undefined) member.address = address;
    if (emergency_contact !== undefined) member.emergency_contact = emergency_contact;
    if (photo_url !== undefined) member.photo_url = photo_url;
    if (id_number !== undefined) member.id_number = id_number;
    if (membership_type) member.membership_type = membership_type;
    if (start_date) member.start_date = start_date;
    if (end_date) member.end_date = end_date;
    if (notes !== undefined) member.notes = notes;
    
    await member.save();
    
    res.json({ message: 'Member updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete member (Admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
