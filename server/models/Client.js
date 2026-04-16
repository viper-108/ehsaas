const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const clientSchema = new mongoose.Schema({
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
    default: ''
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Non-Binary', 'Prefer not to say', ''],
    default: ''
  },
  therapyPreferences: [{
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
  concerns: {
    type: String,
    default: ''
  },
  preferredLanguage: {
    type: String,
    default: 'English'
  },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relationship: { type: String, default: '' }
  },
  stripeCustomerId: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

clientSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

clientSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

clientSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: 'client' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

module.exports = mongoose.model('Client', clientSchema);
