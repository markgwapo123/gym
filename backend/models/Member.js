const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  member_id: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  },
  contact: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: false
  },
  date_of_birth: {
    type: Date,
    required: false
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: false
  },
  address: {
    type: String,
    required: false
  },
  emergency_contact: {
    name: {
      type: String,
      required: false
    },
    phone: {
      type: String,
      required: false
    },
    relationship: {
      type: String,
      required: false
    }
  },
  photo_url: {
    type: String,
    required: false
  },
  id_number: {
    type: String,
    required: false
  },
  membership_type: {
    type: String,
    enum: ['Daily', 'Monthly', 'Quarterly', 'Annual'],
    required: true
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Expiring Soon', 'Expired'],
    default: 'Active'
  },
  notes: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique member ID before saving
memberSchema.pre('save', function(next) {
  if (this.isNew && !this.member_id) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.member_id = `GM${year}${month}${random}`;
  }
  this.updatedAt = Date.now();
  this.status = this.getStatus();
  next();
});

// Update status based on end_date before saving
memberSchema.pre('save', function(next) {
  if (this.isNew && !this.member_id) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.member_id = `GM${year}${month}${random}`;
  }
  this.updatedAt = Date.now();
  this.status = this.getStatus();
  next();
});

memberSchema.methods.getStatus = function() {
  const now = new Date();
  const endDate = new Date(this.end_date);
  const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysLeft < 0) {
    return 'Expired';
  } else if (daysLeft <= 3) {
    return 'Expiring Soon';
  } else {
    return 'Active';
  }
};

module.exports = mongoose.model('Member', memberSchema);
