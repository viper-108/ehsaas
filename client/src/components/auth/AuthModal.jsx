import { useState } from 'react';
import { X, User, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthModal.css';

const SPECIALIZATIONS = [
  'Individual Therapy', 'Couples Counselling', 'Group Therapy',
  'Trauma-Informed Therapy', 'Neurodivergent-Aware', 'Queer-Affirmative',
  'Sex-Positive Therapy', 'CBT', 'DBT', 'EMDR', 'Art Therapy',
  'Child Therapy', 'Adolescent Therapy', 'Family Therapy',
  'Grief Counselling', 'Anxiety & Depression', 'Addiction Recovery',
  'Stress Management', 'Corporate Wellness'
];

const AuthModal = () => {
  const {
    showAuthModal, authModalType, authModalMode,
    setAuthModalType, setAuthModalMode, closeAuthModal,
    loginTherapist, registerTherapist, loginClient, registerClient
  } = useAuth();

  const [loading, setLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Client signup form
  const [clientForm, setClientForm] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '',
    therapyPreferences: [], concerns: '', preferredLanguage: 'English', gender: ''
  });

  // Therapist signup form
  const [therapistForm, setTherapistForm] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '',
    specializations: [], experience: '', sessionRate: '', languages: 'English', bio: ''
  });

  if (!showAuthModal) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authModalType === 'therapist') {
        await loginTherapist(loginEmail, loginPassword);
      } else {
        await loginClient(loginEmail, loginPassword);
      }
      toast.success('Login successful!');
      resetForms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleClientSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerClient(clientForm);
      toast.success('Account created successfully!');
      resetForms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const handleTherapistSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = {
        ...therapistForm,
        languages: therapistForm.languages.split(',').map(l => l.trim()),
        experience: Number(therapistForm.experience),
        sessionRate: Number(therapistForm.sessionRate)
      };
      await registerTherapist(formData);
      toast.success('Therapist account created!');
      resetForms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const resetForms = () => {
    setLoginEmail('');
    setLoginPassword('');
    setClientForm({ firstName: '', lastName: '', email: '', password: '', phone: '', therapyPreferences: [], concerns: '', preferredLanguage: 'English', gender: '' });
    setTherapistForm({ firstName: '', lastName: '', email: '', password: '', phone: '', specializations: [], experience: '', sessionRate: '', languages: 'English', bio: '' });
  };

  const togglePreference = (pref, formType) => {
    if (formType === 'client') {
      setClientForm(prev => ({
        ...prev,
        therapyPreferences: prev.therapyPreferences.includes(pref)
          ? prev.therapyPreferences.filter(p => p !== pref)
          : [...prev.therapyPreferences, pref]
      }));
    } else {
      setTherapistForm(prev => ({
        ...prev,
        specializations: prev.specializations.includes(pref)
          ? prev.specializations.filter(p => p !== pref)
          : [...prev.specializations, pref]
      }));
    }
  };

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div className={`modal-content ${authModalMode === 'signup' ? 'modal-lg' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={closeAuthModal}>
          <X size={18} />
        </button>

        {/* Type Selector */}
        <div className="auth-type-selector">
          <button
            className={`auth-type-btn ${authModalType === 'client' ? 'active' : ''}`}
            onClick={() => setAuthModalType('client')}
          >
            <User size={18} />
            Client
          </button>
          <button
            className={`auth-type-btn ${authModalType === 'therapist' ? 'active' : ''}`}
            onClick={() => setAuthModalType('therapist')}
          >
            <Stethoscope size={18} />
            Therapist
          </button>
        </div>

        {/* Login Form */}
        {authModalMode === 'login' && (
          <>
            <h2 className="modal-title">
              Welcome back
            </h2>
            <p className="modal-subtitle">
              Sign in as {authModalType === 'therapist' ? 'a therapist' : 'a client'}
            </p>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account?{' '}
              <button onClick={() => setAuthModalMode('signup')}>
                Sign up
              </button>
            </p>
          </>
        )}

        {/* Client Signup */}
        {authModalMode === 'signup' && authModalType === 'client' && (
          <>
            <h2 className="modal-title">Create your account</h2>
            <p className="modal-subtitle">Start your wellness journey today</p>

            <form onSubmit={handleClientSignup}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={clientForm.firstName}
                    onChange={(e) => setClientForm({ ...clientForm, firstName: e.target.value })}
                    placeholder="First name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={clientForm.lastName}
                    onChange={(e) => setClientForm({ ...clientForm, lastName: e.target.value })}
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={clientForm.password}
                  onChange={(e) => setClientForm({ ...clientForm, password: e.target.value })}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone (optional)</label>
                  <input
                    type="tel"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
                <div className="form-group">
                  <label>Gender (optional)</label>
                  <select
                    value={clientForm.gender}
                    onChange={(e) => setClientForm({ ...clientForm, gender: e.target.value })}
                  >
                    <option value="">Prefer not to say</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>What kind of therapy are you looking for?</label>
                <div className="chip-grid">
                  {SPECIALIZATIONS.map(spec => (
                    <button
                      key={spec}
                      type="button"
                      className={`chip ${clientForm.therapyPreferences.includes(spec) ? 'active' : ''}`}
                      onClick={() => togglePreference(spec, 'client')}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Describe your concerns (optional)</label>
                <textarea
                  value={clientForm.concerns}
                  onChange={(e) => setClientForm({ ...clientForm, concerns: e.target.value })}
                  placeholder="Tell us what you're looking for help with..."
                  rows={3}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account?{' '}
              <button onClick={() => setAuthModalMode('login')}>
                Sign in
              </button>
            </p>
          </>
        )}

        {/* Therapist Signup */}
        {authModalMode === 'signup' && authModalType === 'therapist' && (
          <>
            <h2 className="modal-title">Join as a Therapist</h2>
            <p className="modal-subtitle">Get onboarded and start taking sessions</p>

            <form onSubmit={handleTherapistSignup}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={therapistForm.firstName}
                    onChange={(e) => setTherapistForm({ ...therapistForm, firstName: e.target.value })}
                    placeholder="First name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={therapistForm.lastName}
                    onChange={(e) => setTherapistForm({ ...therapistForm, lastName: e.target.value })}
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={therapistForm.email}
                  onChange={(e) => setTherapistForm({ ...therapistForm, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={therapistForm.password}
                  onChange={(e) => setTherapistForm({ ...therapistForm, password: e.target.value })}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={therapistForm.phone}
                    onChange={(e) => setTherapistForm({ ...therapistForm, phone: e.target.value })}
                    placeholder="Phone number"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Years of Experience</label>
                  <input
                    type="number"
                    value={therapistForm.experience}
                    onChange={(e) => setTherapistForm({ ...therapistForm, experience: e.target.value })}
                    placeholder="e.g. 5"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Session Rate (INR)</label>
                  <input
                    type="number"
                    value={therapistForm.sessionRate}
                    onChange={(e) => setTherapistForm({ ...therapistForm, sessionRate: e.target.value })}
                    placeholder="e.g. 1500"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Languages (comma separated)</label>
                  <input
                    type="text"
                    value={therapistForm.languages}
                    onChange={(e) => setTherapistForm({ ...therapistForm, languages: e.target.value })}
                    placeholder="English, Hindi"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Specializations</label>
                <div className="chip-grid">
                  {SPECIALIZATIONS.map(spec => (
                    <button
                      key={spec}
                      type="button"
                      className={`chip ${therapistForm.specializations.includes(spec) ? 'active' : ''}`}
                      onClick={() => togglePreference(spec, 'therapist')}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={therapistForm.bio}
                  onChange={(e) => setTherapistForm({ ...therapistForm, bio: e.target.value })}
                  placeholder="Tell clients about your approach and experience..."
                  rows={3}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Therapist Account'}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account?{' '}
              <button onClick={() => setAuthModalMode('login')}>
                Sign in
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
