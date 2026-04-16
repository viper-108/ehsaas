import { useState, useEffect } from 'react';
import { Search, Filter, Star, Clock, Globe, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/booking/BookingModal';
import api from '../api/axios';
import './TherapistsList.css';

const SPECIALIZATIONS = [
  'All', 'Individual Therapy', 'Couples Counselling', 'Group Therapy',
  'Trauma-Informed Therapy', 'Neurodivergent-Aware', 'Queer-Affirmative',
  'CBT', 'DBT', 'EMDR', 'Anxiety & Depression', 'Grief Counselling'
];

const TherapistsList = () => {
  const { user, role, openAuthModal } = useAuth();
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('All');
  const [showBooking, setShowBooking] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);

  useEffect(() => {
    fetchTherapists();
  }, [selectedSpec]);

  const fetchTherapists = async () => {
    try {
      const params = {};
      if (selectedSpec !== 'All') params.specialization = selectedSpec;

      const { data } = await api.get('/therapists/public', { params });
      setTherapists(data.therapists || []);
    } catch (err) {
      // If API not available, show sample data
      setTherapists(getSampleTherapists());
    }
    setLoading(false);
  };

  const getSampleTherapists = () => [
    { _id: '1', firstName: 'Priyadarshini', lastName: 'S.', specializations: ['Trauma-Informed Therapy', 'Individual Therapy'], experience: 5, sessionRate: 1500, languages: ['English', 'Hindi'], rating: 4.9, reviewCount: 48, bio: 'Experienced trauma-informed therapist specializing in helping individuals navigate life transitions and emotional healing.', sessionDuration: 50 },
    { _id: '2', firstName: 'Rasika', lastName: 'G.', specializations: ['Queer-Affirmative', 'Couples Counselling'], experience: 3, sessionRate: 1200, languages: ['English', 'Marathi'], rating: 4.8, reviewCount: 35, bio: 'Queer-affirmative therapist passionate about creating safe spaces for all identities and relationship dynamics.', sessionDuration: 50 },
    { _id: '3', firstName: 'Prakshita', lastName: 'K.', specializations: ['CBT', 'Anxiety & Depression'], experience: 4, sessionRate: 1300, languages: ['English', 'Hindi', 'Kannada'], rating: 4.7, reviewCount: 52, bio: 'Clinical psychologist using evidence-based CBT approaches to help clients manage anxiety, depression, and stress.', sessionDuration: 50 },
    { _id: '4', firstName: 'Ananya', lastName: 'R.', specializations: ['Neurodivergent-Aware', 'Child Therapy'], experience: 6, sessionRate: 1800, languages: ['English', 'Tamil'], rating: 4.9, reviewCount: 41, bio: 'Neurodivergent-aware therapist with expertise in supporting children and adults on the spectrum.', sessionDuration: 50 },
    { _id: '5', firstName: 'Meera', lastName: 'P.', specializations: ['EMDR', 'Trauma-Informed Therapy'], experience: 8, sessionRate: 2000, languages: ['English', 'Hindi', 'Gujarati'], rating: 5.0, reviewCount: 67, bio: 'EMDR certified therapist specializing in trauma processing and post-traumatic growth.', sessionDuration: 50 },
    { _id: '6', firstName: 'Rohan', lastName: 'D.', specializations: ['Couples Counselling', 'Family Therapy'], experience: 7, sessionRate: 1600, languages: ['English', 'Hindi'], rating: 4.8, reviewCount: 39, bio: 'Family systems therapist helping couples and families build stronger, healthier relationships.', sessionDuration: 50 }
  ];

  const filteredTherapists = therapists.filter(t => {
    const name = `${t.firstName} ${t.lastName}`.toLowerCase();
    const specs = (t.specializations || []).join(' ').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || specs.includes(query);
  });

  const handleBookSession = (therapist) => {
    if (!user || role !== 'client') {
      openAuthModal('client', 'login');
      return;
    }
    setSelectedTherapist(therapist);
    setShowBooking(true);
  };

  return (
    <div className="therapists-page">
      <section className="page-hero">
        <div className="container">
          <h1>Find Your Therapist</h1>
          <p>Browse our network of qualified mental health professionals</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Search & Filters */}
          <div className="therapists-filters">
            <div className="search-bar">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by name or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-chips">
              {SPECIALIZATIONS.map(spec => (
                <button
                  key={spec}
                  className={`chip ${selectedSpec === spec ? 'active' : ''}`}
                  onClick={() => setSelectedSpec(spec)}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="loading-screen"><div className="spinner"></div></div>
          ) : (
            <>
              <p className="results-count">{filteredTherapists.length} therapists found</p>
              <div className="therapists-grid">
                {filteredTherapists.map(therapist => (
                  <div key={therapist._id} className="card therapist-card">
                    <div className="therapist-card-header">
                      <div className="therapist-avatar">
                        {therapist.firstName[0]}{therapist.lastName[0]}
                      </div>
                      <div className="therapist-card-info">
                        <h3>{therapist.firstName} {therapist.lastName}</h3>
                        <div className="therapist-meta">
                          {therapist.rating > 0 && (
                            <span className="therapist-rating">
                              <Star size={14} fill="var(--accent)" color="var(--accent)" />
                              {therapist.rating} ({therapist.reviewCount})
                            </span>
                          )}
                          <span><Clock size={14} /> {therapist.experience} yrs exp</span>
                        </div>
                      </div>
                    </div>

                    <p className="therapist-bio">{therapist.bio}</p>

                    <div className="therapist-specs">
                      {(therapist.specializations || []).slice(0, 3).map((spec, i) => (
                        <span key={i} className="badge">{spec}</span>
                      ))}
                    </div>

                    <div className="therapist-languages">
                      <Globe size={14} />
                      {(therapist.languages || []).join(', ')}
                    </div>

                    <div className="therapist-card-footer">
                      <div className="therapist-rate">
                        <span className="rate-amount">&#8377;{therapist.sessionRate}</span>
                        <span className="rate-duration">/{therapist.sessionDuration} min</span>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleBookSession(therapist)}
                      >
                        Book Session
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {showBooking && selectedTherapist && (
        <BookingModal
          therapist={selectedTherapist}
          onClose={() => { setShowBooking(false); setSelectedTherapist(null); }}
        />
      )}
    </div>
  );
};

export default TherapistsList;
