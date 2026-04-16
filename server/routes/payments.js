const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const Session = require('../models/Session');
const Payment = require('../models/Payment');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/payments/create-payment-intent
// @desc    Create a Stripe payment intent for a session
router.post('/create-payment-intent', protect, authorize('client'), async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await Session.findById(sessionId)
      .populate('therapist', 'firstName lastName stripeAccountId');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Session already paid' });
    }

    // Amount in smallest currency unit (paise for INR)
    const amount = session.amount * 100;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'inr',
      metadata: {
        sessionId: session._id.toString(),
        clientId: req.user._id.toString(),
        therapistId: session.therapist._id.toString()
      }
    });

    // Create payment record
    await Payment.create({
      session: session._id,
      client: req.user._id,
      therapist: session.therapist._id,
      amount: session.amount,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending'
    });

    session.paymentIntentId = paymentIntent.id;
    await session.save();

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: session.amount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/payments/confirm
// @desc    Confirm payment after successful charge
router.post('/confirm', protect, authorize('client'), async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    payment.status = 'succeeded';
    const platformFee = Math.round(payment.amount * 0.1);
    payment.platformFee = platformFee;
    payment.therapistPayout = payment.amount - platformFee;
    await payment.save();

    // Update session payment status
    await Session.findByIdAndUpdate(payment.session, { paymentStatus: 'paid' });

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Stripe webhooks
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });
        if (payment) {
          payment.status = 'succeeded';
          payment.stripeChargeId = paymentIntent.latest_charge;
          const platformFee = Math.round(payment.amount * 0.1);
          payment.platformFee = platformFee;
          payment.therapistPayout = payment.amount - platformFee;
          await payment.save();

          await Session.findByIdAndUpdate(payment.session, { paymentStatus: 'paid' });
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const failedIntent = event.data.object;
        const failedPayment = await Payment.findOne({ stripePaymentIntentId: failedIntent.id });
        if (failedPayment) {
          failedPayment.status = 'failed';
          await failedPayment.save();

          await Session.findByIdAndUpdate(failedPayment.session, { paymentStatus: 'failed' });
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ success: false, message: `Webhook Error: ${error.message}` });
  }
});

// @route   GET /api/payments/my-payments
// @desc    Get payment history
router.get('/my-payments', protect, async (req, res) => {
  try {
    const filter = req.userRole === 'therapist'
      ? { therapist: req.user._id }
      : { client: req.user._id };

    const payments = await Payment.find(filter)
      .populate('session', 'date startTime endTime sessionType')
      .populate('therapist', 'firstName lastName')
      .populate('client', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
