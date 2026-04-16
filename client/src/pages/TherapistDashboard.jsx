import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, DollarSign, Users, Star, Settings,
  ChevronRight, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Dashboard.css';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TherapistDashboard = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState([]);
  const [editingAvailability, setEditingAvailability] = useState(false);

  useEffect(() => {
    if (!user || role !== 'therapist') {
      navigate('/');
      return;
    }
    fetchDashboard();
    fetchProfile();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/therapists/dashboard');
      setDashboard(data.dashboard);
    } catch {
      setDashboard(getSampleDashboard());
    }
    setLoading(false);
  };

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/therapists/me');
      setProfile(data.therapist);
      setAvailability(data.therapist.availability || []);
    } catch {
      setProfile(getSampleProfile());
      setAvailability(getSampleProfile().availability);
    }
  };

  const getSampleDashboard = () => ({
    totalSessions: 48,
    totalHours: 40,
    totalEarnings: 72000,
    rating: 4.9,
    reviewCount: 48,
    upcomingSessions: [
      { _id: '1', client: { firstName: 'Amit', lastName: 'S.' }, date: new Date(Date.now() + 86400000).toISOString(), startTime: '10:00', endTime: '10:50', sessionType: 'Individual Therapy', amount: 1500, status: 'scheduled' },
      { _id: '2', client: { firstName: 'Priya', lastName: 'K.' }, date: new Date(Date.now() + 172800000).toISOString(), startTime: '14:00', endTime: '14:50', sessionType: 'Couples Counselling', amount: 1500, status: 'scheduled' }
    ],
    pastSessions: [
      { _id: '3', client: { firstName: 'Rahul', lastName: 'M.' }, date: new Date(Date.now() - 86400000).toISOString(), startTime: '11:00', endTime: '11:50', sessionType: 'Individual Therapy', amount: 1500, status: 'completed', rating: 5 },
      { _id: '4', client: { firstName: 'Sneha', lastName: 'P.' }, date: new Date(Date.now() - 172800000).toISOString(), startTime: '15:00', endTime: '15:50', sessionType: 'Individual Therapy', amount: 1500, status: 'completed', rating: 4 }
    ]
  });

  const getSampleProfile = () => ({
    firstName: user?.firstName || 'Therapist',
    lastName: user?.lastName || '',
    email: user?.email || '',
    specializations: ['Individual Therapy', 'Trauma-Informed Therapy'],
    sessionRate: 1500,
    sessionDuration: 50,
    experience: 5,
    languages: ['English', 'Hindi'],
    bio: 'Experienced therapist specializing in trauma-informed care.',
    availability: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
      { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true }
    ]
  });

  const handleMarkCompleted = async (sessionId) => {
    try {
      await api.put(`/sessions/${sessionId}/status`, { status: 'completed' });
      toast.success('Session marked as completed');
      fetchDashboard();
    } catch {
      toast.error('Failed to update session');
    }
  };

  const handleCancelSession = async (sessionId) => {
    try {
      await api.put(`/sessions/${sessionId}/cancel`);
      toast.success('Session cancelled');
      fetchDashboard();
    } catch {
      toast.error('Failed to cancel session');
    }
  };

  const handleSaveAvailability = async () => {
    try {
      await api.put('/therapists/availability', { availability });
      toast.success('Availability updated!');
      setEditingAvailability(false);
    } catch {
      toast.error('Failed to update availability');
    }
  };

  const toggleDayAvailability = (dayOfWeek) => {
    const existing = availability.find(a => a.dayOfWeek === dayOfWeek);
    if (existing) {
      setAvailability(availability.map(a =>
        a.dayOfWeek === dayOfWeek ? { ...a, isAvailable: !a.isAvailable } : a
      ));
    } else {
      setAvailability([...availability, { dayOfWeek, startTime: '09:00', endTime: '17:00', isAvailable: true }]);
    }
  };

  const updateDayTime = (dayOfWeek, field, value) => {
    setAvailability(availability.map(a =>
      a.dayOfWeek === dayOfWeek ? { ...a, [field]: value } : a
    ));
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
            <h1>Welcome, {user?.firstName || 'Therapist'}</h1>
            <p>Here's your practice overview</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>Upcoming Sessions</button>
          <button className={`tab ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}>Past Sessions</button>
          <button className={`tab ${activeTab === 'availability' ? 'active' : ''}`} onClick={() => setActiveTab('availability')}>Availability</button>
          <button className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-icon"><Calendar size={20} /></div>
                <div className="stat-value">{data.totalSessions}</div>
                <div className="stat-label">Total Sessions</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon"><Clock size={20} /></div>
                <div className="stat-value">{data.totalHours}h</div>
                <div className="stat-label">Total Hours</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon"><DollarSign size={20} /></div>
                <div className="stat-value">&#8377;{data.totalEarnings?.toLocaleString()}</div>
                <div className="stat-label">Total Earnings</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon"><Star size={20} /></div>
                <div className="stat-value">{data.rating}</div>
                <div className="stat-label">{data.reviewCount} Reviews</div>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-section">
                <h3>Upcoming Sessions</h3>
                {data.upcomingSessions?.length === 0 ? (
                  <p className="empty-state">No upcoming sessions</p>
                ) : (
                  <div className="session-list">
                    {data.upcomingSessions?.slice(0, 5).map(session => (
                      <div key={session._id} className="session-item">
                        <div className="session-item-info">
                          <h4>{session.client?.firstName} {session.client?.lastName}</h4>
                          <p>
                            {new Date(session.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            {' '}{session.startTime} - {session.endTime}
                          </p>
                          <span className="badge">{session.sessionType}</span>
                        </div>
                        <div className="session-item-actions">
                          <button className="btn btn-sm btn-ghost" title="Mark completed" onClick={() => handleMarkCompleted(session._id)}>
                            <CheckCircle size={16} />
                          </button>
                          <button className="btn btn-sm btn-ghost" title="Cancel" onClick={() => handleCancelSession(session._id)}>
                            <XCircle size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="dashboard-section">
                <h3>Recent Sessions</h3>
                {data.pastSessions?.length === 0 ? (
                  <p className="empty-state">No past sessions</p>
                ) : (
                  <div className="session-list">
                    {data.pastSessions?.slice(0, 5).map(session => (
                      <div key={session._id} className="session-item">
                        <div className="session-item-info">
                          <h4>{session.client?.firstName} {session.client?.lastName}</h4>
                          <p>
                            {new Date(session.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            {' '}{session.startTime} - {session.endTime}
                          </p>
                          <div className="session-item-meta">
                            <span className="badge badge-success">Completed</span>
                            {session.rating && (
                              <span className="session-rating">
                                <Star size={12} fill="var(--accent)" color="var(--accent)" />
                                {session.rating}
                              </span>
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
              <p className="empty-state">No upcoming sessions scheduled</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.upcomingSessions?.map(session => (
                      <tr key={session._id}>
                        <td>{session.client?.firstName} {session.client?.lastName}</td>
                        <td>{new Date(session.date).toLocaleDateString('en-IN')}</td>
                        <td>{session.startTime} - {session.endTime}</td>
                        <td>{session.sessionType}</td>
                        <td>&#8377;{session.amount}</td>
                        <td><span className="badge">{session.status}</span></td>
                        <td>
                          <div className="table-actions">
                            <button className="btn btn-sm btn-ghost" onClick={() => handleMarkCompleted(session._id)}>Complete</button>
                            <button className="btn btn-sm btn-ghost" onClick={() => handleCancelSession(session._id)}>Cancel</button>
                          </div>
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
              <p className="empty-state">No past sessions</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Rating</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pastSessions?.map(session => (
                      <tr key={session._id}>
                        <td>{session.client?.firstName} {session.client?.lastName}</td>
                        <td>{new Date(session.date).toLocaleDateString('en-IN')}</td>
                        <td>{session.startTime} - {session.endTime}</td>
                        <td>{session.sessionType}</td>
                        <td>&#8377;{session.amount}</td>
                        <td>
                          {session.rating ? (
                            <span className="session-rating">
                              <Star size={12} fill="var(--accent)" color="var(--accent)" />
                              {session.rating}
                            </span>
                          ) : '-'}
                        </td>
                        <td><span className="badge badge-success">{session.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Availability Tab */}
        {activeTab === 'availability' && (
          <div className="dashboard-section full-width">
            <div className="section-header-row">
              <h3>Set Your Availability</h3>
              {editingAvailability ? (
                <div className="section-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditingAvailability(false)}>Cancel</button>
                  <button className="btn btn-primary btn-sm" onClick={handleSaveAvailability}>Save Changes</button>
                </div>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={() => setEditingAvailability(true)}>
                  <Settings size={14} /> Edit Availability
                </button>
              )}
            </div>

            <div className="availability-grid">
              {DAYS.map((day, index) => {
                const daySlot = availability.find(a => a.dayOfWeek === index);
                return (
                  <div key={index} className={`availability-day ${daySlot?.isAvailable ? 'active' : ''}`}>
                    <div className="availability-day-header">
                      {editingAvailability && (
                        <input
                          type="checkbox"
                          checked={daySlot?.isAvailable || false}
                          onChange={() => toggleDayAvailability(index)}
                        />
                      )}
                      <span className="day-name">{day}</span>
                      {daySlot?.isAvailable ? (
                        <span className="badge badge-success">Available</span>
                      ) : (
                        <span className="badge">Unavailable</span>
                      )}
                    </div>
                    {daySlot?.isAvailable && (
                      <div className="availability-times">
                        {editingAvailability ? (
                          <>
                            <input
                              type="time"
                              value={daySlot.startTime}
                              onChange={(e) => updateDayTime(index, 'startTime', e.target.value)}
                            />
                            <span>to</span>
                            <input
                              type="time"
                              value={daySlot.endTime}
                              onChange={(e) => updateDayTime(index, 'endTime', e.target.value)}
                            />
                          </>
                        ) : (
                          <span>{daySlot.startTime} - {daySlot.endTime}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && profile && (
          <div className="dashboard-section full-width">
            <h3>Your Profile</h3>
            <div className="profile-card">
              <div className="profile-header">
                <div className="therapist-avatar large">
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </div>
                <div>
                  <h2>{profile.firstName} {profile.lastName}</h2>
                  <p>{profile.email}</p>
                </div>
              </div>
              <div className="profile-details">
                <div className="profile-detail-row">
                  <span className="profile-label">Bio</span>
                  <p>{profile.bio || 'No bio set'}</p>
                </div>
                <div className="profile-detail-row">
                  <span className="profile-label">Specializations</span>
                  <div className="chip-grid">
                    {(profile.specializations || []).map((s, i) => (
                      <span key={i} className="badge">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="profile-detail-row">
                  <span className="profile-label">Experience</span>
                  <p>{profile.experience} years</p>
                </div>
                <div className="profile-detail-row">
                  <span className="profile-label">Session Rate</span>
                  <p>&#8377;{profile.sessionRate} / {profile.sessionDuration} min</p>
                </div>
                <div className="profile-detail-row">
                  <span className="profile-label">Languages</span>
                  <p>{(profile.languages || []).join(', ')}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapistDashboard;
