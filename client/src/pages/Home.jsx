import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Heart, Shield, Users, Star, Clock, Globe } from 'lucide-react';
import './Home.css';

const Home = () => {
  const { openAuthModal } = useAuth();

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Your journey to<br />
              <span className="hero-accent">healing</span> starts here
            </h1>
            <p className="hero-subtitle">
              Find the right psychologist for your mental wellness journey.
              Professional, confidential, and accessible therapy.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => openAuthModal('client', 'signup')}>
                Get Started
                <ArrowRight size={18} />
              </button>
              <Link to="/therapists" className="btn btn-secondary btn-lg">
                Find Therapists
              </Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-value">50+</span>
                <span className="hero-stat-label">Expert Therapists</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">1000+</span>
                <span className="hero-stat-label">Sessions Completed</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">4.9</span>
                <span className="hero-stat-label">Average Rating</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-glow"></div>
            <div className="hero-card-stack">
              <div className="hero-float-card card-1">
                <Heart size={24} className="card-icon" />
                <span>Trauma-Informed Care</span>
              </div>
              <div className="hero-float-card card-2">
                <Shield size={24} className="card-icon" />
                <span>100% Confidential</span>
              </div>
              <div className="hero-float-card card-3">
                <Users size={24} className="card-icon" />
                <span>Matched to Your Needs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section services-preview">
        <div className="container">
          <div className="section-header">
            <h2>Our Services</h2>
            <p>Comprehensive mental health support tailored to your unique needs</p>
          </div>
          <div className="services-grid">
            {[
              { icon: <Heart size={28} />, title: 'Individual Therapy', desc: 'One-on-one sessions tailored to your personal healing journey with a matched therapist.' },
              { icon: <Users size={28} />, title: 'Couples Counselling', desc: 'Strengthen your relationship through guided therapeutic conversations and tools.' },
              { icon: <Globe size={28} />, title: 'Group Therapy', desc: 'Shared healing experiences in safe, facilitated group environments.' },
              { icon: <Star size={28} />, title: 'Specialized Care', desc: 'Neurodivergent-aware, queer-affirmative, and trauma-informed therapeutic approaches.' },
              { icon: <Clock size={28} />, title: 'Flexible Scheduling', desc: 'Book sessions at times that work for you with our easy-to-use scheduling system.' },
              { icon: <Shield size={28} />, title: 'Corporate Wellness', desc: 'Mental health workshops and programs designed for workplace well-being.' }
            ].map((service, i) => (
              <div key={i} className="card service-card">
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Getting started with ehsaas is simple</p>
          </div>
          <div className="steps-grid">
            {[
              { step: '01', title: 'Sign Up', desc: 'Create your account and tell us about your therapy preferences and concerns.' },
              { step: '02', title: 'Find Your Match', desc: 'Browse therapists matched to your needs based on expertise, language, and approach.' },
              { step: '03', title: 'Book a Session', desc: 'Choose a convenient time slot and book your session with a few clicks.' },
              { step: '04', title: 'Begin Healing', desc: 'Attend your session and start your journey towards mental wellness.' }
            ].map((item, i) => (
              <div key={i} className="step-card">
                <span className="step-number">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for Therapists */}
      <section className="section therapist-cta">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2>Are you a therapist?</h2>
              <p>
                Join our marketplace and connect with clients who need your expertise.
                Fair compensation, supportive community, and flexible scheduling.
              </p>
              <button className="btn btn-primary btn-lg" onClick={() => openAuthModal('therapist', 'signup')}>
                Join as Therapist
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section testimonials">
        <div className="container">
          <div className="section-header">
            <h2>What Our Clients Say</h2>
            <p>Real experiences from people who found healing with ehsaas</p>
          </div>
          <div className="testimonials-grid">
            {[
              { name: 'A.S.', text: 'The matching process was incredibly thoughtful. My therapist truly understands my needs and I feel safe in every session.', rating: 5 },
              { name: 'R.K.', text: 'As someone from the LGBTQ+ community, finding a queer-affirmative therapist through ehsaas has been life-changing.', rating: 5 },
              { name: 'P.M.', text: 'The booking system is seamless and my therapist is always available when I need them. Highly recommended!', rating: 5 }
            ].map((t, i) => (
              <div key={i} className="card testimonial-card">
                <div className="testimonial-stars">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={16} fill="var(--accent)" color="var(--accent)" />
                  ))}
                </div>
                <p>"{t.text}"</p>
                <span className="testimonial-author">- {t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
