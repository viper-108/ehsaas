const express = require('express');
const router = express.Router();
const Therapist = require('../models/Therapist');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/therapists/register
// @desc    Register a new therapist
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, specializations, experience, sessionRate, languages, bio, qualifications } = req.body;

    const existingTherapist = await Therapist.findOne({ email });
    if (existingTherapist) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const therapist = await Therapist.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      specializations: specializations || [],
      experience: experience || 0,
      sessionRate: sessionRate || 1500,
      languages: languages || ['English'],
      bio: bio || '',
      qualifications: qualifications || []
    });

    const token = therapist.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      therapist: {
        id: therapist._id,
        firstName: therapist.firstName,
        lastName: therapist.lastName,
        email: therapist.email,
        isOnboarded: therapist.isOnboarded,
        isApproved: therapist.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/therapists/login
// @desc    Login therapist
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const therapist = await Therapist.findOne({ email }).select('+password');
    if (!therapist) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await therapist.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = therapist.getSignedJwtToken();

    res.json({
      success: true,
      token,
      therapist: {
        id: therapist._id,
        firstName: therapist.firstName,
        lastName: therapist.lastName,
        email: therapist.email,
        isOnboarded: therapist.isOnboarded,
        isApproved: therapist.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/therapists/me
// @desc    Get current therapist profile
router.get('/me', protect, authorize('therapist'), async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.user._id);
    res.json({ success: true, therapist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/therapists/me
// @desc    Update therapist profile
router.put('/me', protect, authorize('therapist'), async (req, res) => {
  try {
    const fieldsToUpdate = { ...req.body };
    delete fieldsToUpdate.password;
    delete fieldsToUpdate.email;
    delete fieldsToUpdate.totalSessions;
    delete fieldsToUpdate.totalHours;
    delete fieldsToUpdate.totalEarnings;

    const therapist = await Therapist.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, therapist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/therapists/onboard
// @desc    Complete therapist onboarding
router.put('/onboard', protect, authorize('therapist'), async (req, res) => {
  try {
    const { bio, qualifications, specializations, experience, sessionRate, languages, availability } = req.body;

    const therapist = await Therapist.findByIdAndUpdate(
      req.user._id,
      {
        bio,
        qualifications,
        specializations,
        experience,
        sessionRate,
        languages,
        availability,
        isOnboarded: true
      },
      { new: true, runValidators: true }
    );

    res.json({ success: true, therapist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/therapists/availability
// @desc    Update availability
router.put('/availability', protect, authorize('therapist'), async (req, res) => {
  try {
    const { availability } = req.body;

    const therapist = await Therapist.findByIdAndUpdate(
      req.user._id,
      { availability },
      { new: true }
    );

    res.json({ success: true, therapist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/therapists/dashboard
// @desc    Get therapist dashboard data
router.get('/dashboard', protect, authorize('therapist'), async (req, res) => {
  try {
    const Session = require('../models/Session');
    const therapist = await Therapist.findById(req.user._id);

    const sessions = await Session.find({ therapist: req.user._id })
      .populate('client', 'firstName lastName email')
      .sort({ date: -1 });

    const pastSessions = sessions.filter(s => s.status === 'completed');
    const upcomingSessions = sessions.filter(s => s.status === 'scheduled' && new Date(s.date) >= new Date());
    const totalHours = pastSessions.reduce((acc, s) => acc + (s.duration / 60), 0);
    const totalEarnings = pastSessions.reduce((acc, s) => acc + s.amount, 0);

    res.json({
      success: true,
      dashboard: {
        totalSessions: pastSessions.length,
        totalHours: Math.round(totalHours * 10) / 10,
        totalEarnings,
        upcomingSessions,
        pastSessions,
        rating: therapist.rating,
        reviewCount: therapist.reviewCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/therapists/public
// @desc    Get all approved therapists (public)
router.get('/public', async (req, res) => {
  try {
    const { specialization, language, minRate, maxRate } = req.query;

    const filter = { isOnboarded: true, isApproved: true };

    if (specialization) {
      filter.specializations = { $in: [specialization] };
    }
    if (language) {
      filter.languages = { $in: [language] };
    }
    if (minRate || maxRate) {
      filter.sessionRate = {};
      if (minRate) filter.sessionRate.$gte = Number(minRate);
      if (maxRate) filter.sessionRate.$lte = Number(maxRate);
    }

    const therapists = await Therapist.find(filter)
      .select('firstName lastName bio specializations experience sessionRate languages rating reviewCount profileImage sessionDuration availability');

    res.json({ success: true, therapists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/therapists/public/:id
// @desc    Get single therapist profile (public)
router.get('/public/:id', async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.params.id)
      .select('firstName lastName bio specializations experience sessionRate languages rating reviewCount profileImage sessionDuration availability qualifications');

    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }

    res.json({ success: true, therapist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
