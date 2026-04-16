import { useState } from 'react';
import { X, Calendar, Clock, CreditCard } from 'lucide-react';
import api from '../../api/axios';
import PaymentForm from '../payment/PaymentForm';
import toast from 'react-hot-toast';
import './BookingModal.css';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const BookingModal = ({ therapist, onClose }) => {
  const [step, setStep] = useState(1); // 1: date, 2: time, 3: confirm, 4: payment
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [sessionType, setSessionType] = useState('Individual Therapy');
  const [loading, setLoading] = useState(false);
  const [bookedSession, setBookedSession] = useState(null);

  // Generate next 14 days
  const getAvailableDates = () => {
    const dates = [];
    for (let i = 1; i <= 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const handleDateSelect = async (date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setSelectedSlot(null);

    try {
      const { data } = await api.get(`/sessions/available-slots/${therapist._id}`, {
        params: { date: dateStr }
      });
      setAvailableSlots(data.availableSlots || []);
    } catch (err) {
      // Generate sample slots if API not available
      const dayOfWeek = date.getDay();
      const sampleSlots = [];
      if (dayOfWeek > 0 && dayOfWeek < 6) {
        for (let h = 9; h < 18; h++) {
          sampleSlots.push({
            startTime: `${String(h).padStart(2, '0')}:00`,
            endTime: `${String(h).padStart(2, '0')}:50`
          });
        }
      } else {
        for (let h = 10; h < 15; h++) {
          sampleSlots.push({
            startTime: `${String(h).padStart(2, '0')}:00`,
            endTime: `${String(h).padStart(2, '0')}:50`
          });
        }
      }
      setAvailableSlots(sampleSlots);
    }
    setStep(2);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const handleBookSession = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/sessions/book', {
        therapistId: therapist._id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        sessionType
      });
      setBookedSession(data.session);
      toast.success('Session booked successfully!');
      setStep(4);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={18} /></button>

        {/* Progress Steps */}
        <div className="booking-steps">
          <div className={`booking-step ${step >= 1 ? 'active' : ''}`}>
            <Calendar size={16} /> Date
          </div>
          <div className="booking-step-line"></div>
          <div className={`booking-step ${step >= 2 ? 'active' : ''}`}>
            <Clock size={16} /> Time
          </div>
          <div className="booking-step-line"></div>
          <div className={`booking-step ${step >= 3 ? 'active' : ''}`}>
            Confirm
          </div>
          <div className="booking-step-line"></div>
          <div className={`booking-step ${step >= 4 ? 'active' : ''}`}>
            <CreditCard size={16} /> Pay
          </div>
        </div>

        {/* Therapist Info */}
        <div className="booking-therapist-info">
          <div className="therapist-avatar">
            {therapist.firstName[0]}{therapist.lastName[0]}
          </div>
          <div>
            <h3>{therapist.firstName} {therapist.lastName}</h3>
            <p>{(therapist.specializations || []).slice(0, 2).join(', ')}</p>
          </div>
          <div className="booking-rate">&#8377;{therapist.sessionRate}</div>
        </div>

        {/* Step 1: Date Selection */}
        {step === 1 && (
          <div className="booking-section">
            <h3>Select a Date</h3>
            <div className="date-grid">
              {getAvailableDates().map((date, i) => (
                <button
                  key={i}
                  className={`date-btn ${selectedDate === date.toISOString().split('T')[0] ? 'active' : ''}`}
                  onClick={() => handleDateSelect(date)}
                >
                  <span className="date-day">{DAYS[date.getDay()].slice(0, 3)}</span>
                  <span className="date-num">{date.getDate()}</span>
                  <span className="date-month">{date.toLocaleString('default', { month: 'short' })}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Time Selection */}
        {step === 2 && (
          <div className="booking-section">
            <h3>Select a Time</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>
              Change date
            </button>
            {availableSlots.length === 0 ? (
              <p className="no-slots">No available slots for this date. Try another date.</p>
            ) : (
              <div className="time-grid">
                {availableSlots.map((slot, i) => (
                  <button
                    key={i}
                    className={`time-btn ${selectedSlot?.startTime === slot.startTime ? 'active' : ''}`}
                    onClick={() => handleSlotSelect(slot)}
                  >
                    {slot.startTime} - {slot.endTime}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="booking-section">
            <h3>Confirm Your Booking</h3>

            <div className="booking-summary">
              <div className="summary-row">
                <span>Date</span>
                <span>{new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="summary-row">
                <span>Time</span>
                <span>{selectedSlot?.startTime} - {selectedSlot?.endTime}</span>
              </div>
              <div className="summary-row">
                <span>Duration</span>
                <span>{therapist.sessionDuration || 50} minutes</span>
              </div>
              <div className="summary-row">
                <span>Session Type</span>
                <span>
                  <select value={sessionType} onChange={(e) => setSessionType(e.target.value)}>
                    <option>Individual Therapy</option>
                    <option>Couples Counselling</option>
                    <option>Group Therapy</option>
                  </select>
                </span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>&#8377;{therapist.sessionRate}</span>
              </div>
            </div>

            <div className="booking-actions">
              <button className="btn btn-secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button className="btn btn-primary" onClick={handleBookSession} disabled={loading}>
                {loading ? 'Booking...' : 'Confirm & Pay'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Payment */}
        {step === 4 && (
          <div className="booking-section">
            <h3>Payment</h3>
            <PaymentForm
              session={bookedSession}
              amount={therapist.sessionRate}
              onSuccess={() => {
                toast.success('Payment successful!');
                onClose();
              }}
              onError={() => {
                toast.error('Payment failed. You can pay later from your dashboard.');
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
