const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Therapist = require('../models/Therapist');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/sessions/book
// @desc    Book a new session
router.post('/book', protect, authorize('client'), async (req, res) => {
  try {
    const { therapistId, date, startTime, endTime, sessionType } = req.body;

    const therapist = await Therapist.findById(therapistId);
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }

    if (!therapist.isApproved || !therapist.isOnboarded) {
      return res.status(400).json({ success: false, message: 'Therapist is not available' });
    }

    // Check for conflicting sessions
    const conflicting = await Session.findOne({
      therapist: therapistId,
      date: new Date(date),
      startTime,
      status: { $in: ['scheduled'] }
    });

    if (conflicting) {
      return res.status(400).json({ success: false, message: 'This time slot is already booked' });
    }

    // Check therapist availability for the day
    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay();
    const isAvailable = therapist.availability.some(
      slot => slot.dayOfWeek === dayOfWeek && slot.isAvailable && slot.startTime <= startTime && slot.endTime >= endTime
    );

    if (!isAvailable) {
      return res.status(400).json({ success: false, message: 'Therapist is not available at this time' });
    }

    const session = await Session.create({
      therapist: therapistId,
      client: req.user._id,
      date: new Date(date),
      startTime,
      endTime,
      duration: therapist.sessionDuration,
      sessionType: sessionType || 'Individual Therapy',
      amount: therapist.sessionRate,
      status: 'scheduled',
      paymentStatus: 'pending'
    });

    const populatedSession = await Session.findById(session._id)
      .populate('therapist', 'firstName lastName email specializations')
      .populate('client', 'firstName lastName email');

    res.status(201).json({ success: true, session: populatedSession });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/sessions/my-sessions
// @desc    Get all sessions for current user (therapist or client)
router.get('/my-sessions', protect, async (req, res) => {
  try {
    const filter = req.userRole === 'therapist'
      ? { therapist: req.user._id }
      : { client: req.user._id };

    const sessions = await Session.find(filter)
      .populate('therapist', 'firstName lastName email specializations profileImage')
      .populate('client', 'firstName lastName email')
      .sort({ date: -1 });

    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/sessions/:id
// @desc    Get single session
router.get('/:id', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('therapist', 'firstName lastName email specializations profileImage')
      .populate('client', 'firstName lastName email');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Ensure user is part of this session
    const isTherapist = session.therapist._id.toString() === req.user._id.toString();
    const isClient = session.client._id.toString() === req.user._id.toString();

    if (!isTherapist && !isClient) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/sessions/:id/status
// @desc    Update session status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    session.status = status;

    if (status === 'completed') {
      // Update therapist stats
      const therapist = await Therapist.findById(session.therapist);
      therapist.totalSessions += 1;
      therapist.totalHours += session.duration / 60;
      therapist.totalEarnings += session.amount;
      await therapist.save();
    }

    await session.save();

    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/sessions/:id/cancel
// @desc    Cancel a session
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.status !== 'scheduled') {
      return res.status(400).json({ success: false, message: 'Only scheduled sessions can be cancelled' });
    }

    session.status = 'cancelled';
    await session.save();

    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/sessions/:id/review
// @desc    Add review and rating
router.put('/:id/review', protect, authorize('client'), async (req, res) => {
  try {
    const { rating, review } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed sessions' });
    }

    session.rating = rating;
    session.review = review;
    await session.save();

    // Update therapist average rating
    const allReviewed = await Session.find({
      therapist: session.therapist,
      rating: { $ne: null }
    });

    const avgRating = allReviewed.reduce((acc, s) => acc + s.rating, 0) / allReviewed.length;

    await Therapist.findByIdAndUpdate(session.therapist, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: allReviewed.length
    });

    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/sessions/available-slots/:therapistId
// @desc    Get available slots for a therapist on a specific date
router.get('/available-slots/:therapistId', async (req, res) => {
  try {
    const { date } = req.query;
    const therapist = await Therapist.findById(req.params.therapistId);

    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }

    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay();

    // Get therapist's availability for this day
    const daySlots = therapist.availability.filter(
      slot => slot.dayOfWeek === dayOfWeek && slot.isAvailable
    );

    // Get already booked sessions for this date
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedSessions = await Session.find({
      therapist: req.params.therapistId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['scheduled'] }
    });

    const bookedTimes = bookedSessions.map(s => s.startTime);

    // Generate available time slots
    const availableSlots = [];
    for (const slot of daySlots) {
      let currentTime = slot.startTime;
      while (currentTime < slot.endTime) {
        if (!bookedTimes.includes(currentTime)) {
          const [hours, minutes] = currentTime.split(':').map(Number);
          const endMinutes = minutes + therapist.sessionDuration;
          const endHours = hours + Math.floor(endMinutes / 60);
          const endMins = endMinutes % 60;
          const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

          if (endTime <= slot.endTime) {
            availableSlots.push({
              startTime: currentTime,
              endTime
            });
          }
        }
        // Move to next slot (session duration)
        const [h, m] = currentTime.split(':').map(Number);
        const nextMin = m + therapist.sessionDuration;
        const nextHour = h + Math.floor(nextMin / 60);
        const nextMinute = nextMin % 60;
        currentTime = `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`;
      }
    }

    res.json({ success: true, availableSlots, sessionDuration: therapist.sessionDuration, sessionRate: therapist.sessionRate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
