const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  therapist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please provide session date']
  },
  startTime: {
    type: String,
    required: [true, 'Please provide start time']
  },
  endTime: {
    type: String,
    required: [true, 'Please provide end time']
  },
  duration: {
    type: Number,
    default: 50
  },
  sessionType: {
    type: String,
    enum: ['Individual Therapy', 'Couples Counselling', 'Group Therapy', 'Other'],
    default: 'Individual Therapy'
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show', 'rescheduled'],
    default: 'scheduled'
  },
  notes: {
    therapistNotes: { type: String, default: '' },
    clientFeedback: { type: String, default: '' }
  },
  amount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentIntentId: {
    type: String,
    default: ''
  },
  meetingLink: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  review: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

sessionSchema.index({ therapist: 1, date: 1 });
sessionSchema.index({ client: 1, date: 1 });

module.exports = mongoose.model('Session', sessionSchema);
