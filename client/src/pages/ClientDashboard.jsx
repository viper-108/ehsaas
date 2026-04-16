import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar, Clock, DollarSign, Star, Search,
  CheckCircle, XCircle, MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Dashboard.css';

const ClientDashboard = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewSession, setReviewSession] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    if (!user || role !== 'client') {
      navigate('/');
      return;
    }
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/clients/dashboard');
      setDashboard(data.dashboard);
    } catch {
      setDashboard(getSampleDashboard());
    }
    setLoading(false);
  };

  const getSampleDashboard = () => ({
    totalSessions: 12,
    totalSpent: 18000,
    upcomingSessions: [
      { _id: '1', therapist: { firstName: 'Priyadarshini', lastName: 'S.', specializations: ['Trauma-Informed Therapy'], rating: 4.9 }, date: new Date(Date.now() + 86400000).toISOString(), startTime: '10:00', endTime: '10:50', sessionType: 'Individual Therapy', amount: 1500, status: 'scheduled', paymentStatus: 'paid' },
      { _id: '2', therapist: { firstName: 'Rasika', lastName: 'G.', specializations: ['Queer-Affirmative'], rating: 4.8 }, date: new Date(Date.now() + 259200000).toISOString(), startTime: '14:00', endTime: '14:50', sessionType: 'Individual Therapy', amount: 1200, status: 'scheduled', paymentStatus: 'paid' }
    ],
    pastSessions: [
      { _id: '3', therapist: { firstName: 'Priyadarshini', lastName: 'S.', specializations: ['Trauma-Informed Therapy'], rating: 4.9 }, date: new Date(Date.now() - 604800000).toISOString(), startTime: '10:00', endTime: '10:50', sessionType: 'Individual Therapy', amount: 1500, status: 'completed', rating: 5, review: 'Amazing session!' },
      { _id: '4', therapist: { firstName: 'Prakshita', lastName: 'K.', specializations: ['CBT'], rating: 4.7 }, date: new Date(Date.now() - 1209600000).toISOString(), startTime: '15:00', endTime: '15:50', sessionType: 'Individual Therapy', amount: 1300, status: 'completed', rating: null }
    ]
  });

  const handleCancelSession = async (sessionId) => {
    try {
      await api.put(`/sessions/${sessionId}/cancel`);
      toast.success('Session cancelled');
      fetchDashboard();
    } catch {
      toast.error('Failed to cancel session');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/sessions/${reviewSession._id}/review`, {
        rating: reviewRating,
        review: reviewText
      });
      toast.success('Review submitted!');
      setReviewSession(null);
      setReviewRating(5);
      setReviewText('');
      fetchDashboard();
    } catch {
      toast.error('Failed to submit review');
    }
  };

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div></div>;
  }

  const data = dashboard || getSampleDashboard();

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome, {user?.firstName || 'Client'}</h1>
            <p>Manage your therapy sessions and wellness journey</p>
          </div>
          <Link to="/therapists" className="btn btn-primary">
            <Search size={16} /> Find Therapists
          </Link>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>Upcoming Sessions</button>
          <button className={`tab ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}>Past Sessions</button>
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-icon"><Calendar size={20} /></div>
                <div className="stat-value">{data.totalSessions}</div>
                <div className="stat-label">Total Sessions</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon"><DollarSign size={20} /></div>
                <div className="stat-value">&#8377;{data.totalSpent?.toLocaleString()}</div>
                <div className="stat-label">Total Spent</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon"><Calendar size={20} /></div>
                <div className="stat-value">{data.upcomingSessions?.length || 0}</div>
                <div className="stat-label">Upcoming</div>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-section">
                <h3>Upcoming Sessions</h3>
                {data.upcomingSessions?.length === 0 ? (
                  <div className="empty-state">
                    <p>No upcoming sessions</p>
                    <Link to="/therapists" className="btn btn-primary btn-sm">Book a Session</Link>
                  </div>
                ) : (
                  <div className="session-list">
                    {data.upcomingSessions?.slice(0, 5).map(session => (
                      <div key={session._id} className="session-item">
                        <div className="session-item-info">
                          <h4>{session.therapist?.firstName} {session.therapist?.lastName}</h4>
                          <p>
                            {new Date(session.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                            {' '}{session.startTime} - {session.endTime}
                          </p>
                          <div className="session-item-meta">
                            <span className="badge">{session.sessionType}</span>
                            <span className={`badge ${session.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                              {session.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
                            </span>
                          </div>
                        </div>
                        <button className="btn btn-sm btn-ghost" onClick={() => handleCancelSession(session._id)}>
                          <XCircle size={16} /> Cancel
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="dashboard-section">
                <h3>Recent Sessions</h3>
                {data.pastSessions?.length === 0 ? (
                  <p className="empty-state">No past sessions yet</p>
                ) : (
                  <div className="session-list">
                    {data.pastSessions?.slice(0, 5).map(session => (
                      <div key={session._id} className="session-item">
                        <div className="session-item-info">
                          <h4>{session.therapist?.firstName} {session.therapist?.lastName}</h4>
                          <p>
                            {new Date(session.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            {' '}{session.startTime}
                          </p>
                          <div className="session-item-meta">
                            <span className="badge badge-success">Completed</span>
                            {session.rating ? (
                              <span className="session-rating">
                                <Star size={12} fill="var(--accent)" color="var(--accent)" /> {session.rating}
                              </span>
                            ) : (
                              <button className="btn btn-sm btn-ghost" onClick={() => setReviewSession(session)}>
                                <MessageSquare size={14} /> Leave Review
                              </button>
                            )}
                          </div>
                        </div>
                        <span className="session-amount">&#8377;{session.amount}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Upcoming Sessions Tab */}
        {activeTab === 'upcoming' && (
          <div className="dashboard-section full-width">
            <h3>Upcoming Sessions</h3>
            {data.upcomingSessions?.length === 0 ? (
              <div className="empty-state">
                <p>No upcoming sessions</p>
                <Link to="/therapists" className="btn btn-primary btn-sm">Book a Session</Link>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Therapist</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.upcomingSessions?.map(session => (
                      <tr key={session._id}>
                        <td>{session.therapist?.firstName} {session.therapist?.lastName}</td>
                        <td>{new Date(session.date).toLocaleDateString('en-IN')}</td>
                        <td>{session.startTime} - {session.endTime}</td>
                        <td>{session.sessionType}</td>
                        <td>&#8377;{session.amount}</td>
                        <td>
                          <span className={`badge ${session.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                            {session.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-ghost" onClick={() => handleCancelSession(session._id)}>
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Past Sessions Tab */}
        {activeTab === 'past' && (
          <div className="dashboard-section full-width">
            <h3>Past Sessions</h3>
            {data.pastSessions?.length === 0 ? (
              <p className="empty-state">No past sessions yet</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Therapist</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pastSessions?.map(session => (
                      <tr key={session._id}>
                        <td>{session.therapist?.firstName} {session.therapist?.lastName}</td>
                        <td>{new Date(session.date).toLocaleDateString('en-IN')}</td>
                        <td>{session.startTime} - {session.endTime}</td>
                        <td>{session.sessionType}</td>
                        <td>&#8377;{session.amount}</td>
                        <td>
                          {session.rating ? (
                            <span className="session-rating"><Star size={12} fill="var(--accent)" color="var(--accent)" /> {session.rating}</span>
                          ) : '-'}
                        </td>
                        <td>
                          {!session.rating && (
                            <button className="btn btn-sm btn-ghost" onClick={() => setReviewSession(session)}>
                              Review
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Review Modal */}
        {reviewSession && (
          <div className="modal-overlay" onClick={() => setReviewSession(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setReviewSession(null)}><XCircle size={18} /></button>
              <h2 className="modal-title">Rate Your Session</h2>
              <p className="modal-subtitle">
                Session with {reviewSession.therapist?.firstName} {reviewSession.therapist?.lastName}
              </p>

              <form onSubmit={handleSubmitReview}>
                <div className="form-group">
                  <label>Rating</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${star <= reviewRating ? 'active' : ''}`}
                        onClick={() => setReviewRating(star)}
                      >
                        <Star size={24} fill={star <= reviewRating ? 'var(--accent)' : 'none'} color="var(--accent)" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Your Review (optional)</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience..."
                    rows={4}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-full">
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
