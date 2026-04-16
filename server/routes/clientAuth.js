const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/clients/register
// @desc    Register a new client
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, therapyPreferences, concerns, preferredLanguage, gender } = req.body;

    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const client = await Client.create({
      firstName,
      lastName,
      email,
      password,
      phone: phone || '',
      therapyPreferences: therapyPreferences || [],
      concerns: concerns || '',
      preferredLanguage: preferredLanguage || 'English',
      gender: gender || ''
    });

    const token = client.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      client: {
        id: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        therapyPreferences: client.therapyPreferences
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/clients/login
// @desc    Login client
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const client = await Client.findOne({ email }).select('+password');
    if (!client) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await client.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = client.getSignedJwtToken();

    res.json({
      success: true,
      token,
      client: {
        id: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        therapyPreferences: client.therapyPreferences
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/clients/me
// @desc    Get current client profile
router.get('/me', protect, authorize('client'), async (req, res) => {
  try {
    const client = await Client.findById(req.user._id);
    res.json({ success: true, client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/clients/me
// @desc    Update client profile
router.put('/me', protect, authorize('client'), async (req, res) => {
  try {
    const fieldsToUpdate = { ...req.body };
    delete fieldsToUpdate.password;
    delete fieldsToUpdate.email;

    const client = await Client.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/clients/dashboard
// @desc    Get client dashboard data
router.get('/dashboard', protect, authorize('client'), async (req, res) => {
  try {
    const Session = require('../models/Session');

    const sessions = await Session.find({ client: req.user._id })
      .populate('therapist', 'firstName lastName specializations profileImage rating')
      .sort({ date: -1 });

    const pastSessions = sessions.filter(s => s.status === 'completed');
    const upcomingSessions = sessions.filter(s => s.status === 'scheduled' && new Date(s.date) >= new Date());
    const totalSpent = pastSessions.reduce((acc, s) => acc + s.amount, 0);

    res.json({
      success: true,
      dashboard: {
        totalSessions: pastSessions.length,
        totalSpent,
        upcomingSessions,
        pastSessions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
