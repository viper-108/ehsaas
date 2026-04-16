const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const availabilitySlotSchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
});

const therapistSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide first name'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Please provide last name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number']
  },
  profileImage: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  specializations: [{
    type: String,
    enum: [
      'Individual Therapy',
      'Couples Counselling',
      'Group Therapy',
      'Trauma-Informed Therapy',
      'Neurodivergent-Aware',
      'Queer-Affirmative',
      'Sex-Positive Therapy',
      'CBT',
      'DBT',
      'EMDR',
      'Art Therapy',
      'Child Therapy',
      'Adolescent Therapy',
      'Family Therapy',
      'Grief Counselling',
      'Anxiety & Depression',
      'Addiction Recovery',
      'Stress Management',
      'Corporate Wellness',
      'Other'
    ]
  }],
  experience: {
    type: Number,
    default: 0
  },
  languages: [{
    type: String
  }],
  sessionRate: {
    type: Number,
    required: [true, 'Please provide session rate'],
    default: 1500
  },
  sessionDuration: {
    type: Number,
    default: 50
  },
  availability: [availabilitySlotSchema],
  isOnboarded: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  stripeAccountId: {
    type: String,
    default: ''
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  totalHours: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

therapistSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

therapistSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

therapistSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: 'therapist' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

module.exports = mongoose.model('Therapist', therapistSchema);
