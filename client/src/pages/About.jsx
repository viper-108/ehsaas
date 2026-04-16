import { Heart, Shield, Users, Star, Target, Sparkles } from 'lucide-react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <section className="page-hero">
        <div className="container">
          <h1>About ehsaas</h1>
          <p>Accessible, compassionate, and transformative mental health care</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="about-intro">
            <div className="about-intro-text">
              <h2>Our Mission</h2>
              <p>
                At ehsaas, we believe that healing should be accessible to everyone.
                We are a psychologist marketplace that connects individuals with
                qualified mental health professionals who understand their unique needs.
              </p>
              <p>
                Founded in 2025, ehsaas was born from the vision that therapy should be
                inclusive, affordable, and matched to each person's journey. We carefully
                match clients with therapists based on expertise, language, cultural
                sensitivity, and lived experiences.
              </p>
            </div>
            <div className="about-intro-visual">
              <div className="about-value-card">
                <Heart size={32} className="value-icon" />
                <h3>Compassionate Care</h3>
                <p>Every interaction is grounded in empathy and understanding</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Values</h2>
            <p>The principles that guide everything we do</p>
          </div>
          <div className="values-grid">
            {[
              { icon: <Heart size={24} />, title: 'Empathy First', desc: 'We lead with compassion in every client-therapist match we facilitate.' },
              { icon: <Shield size={24} />, title: 'Safe Spaces', desc: 'Every session is confidential, judgment-free, and tailored to your comfort.' },
              { icon: <Users size={24} />, title: 'Inclusivity', desc: 'Queer-affirmative, neurodivergent-aware, and culturally sensitive care.' },
              { icon: <Star size={24} />, title: 'Quality', desc: 'All therapists are verified professionals with proven expertise.' },
              { icon: <Target size={24} />, title: 'Accessibility', desc: 'Making mental health support available and affordable for everyone.' },
              { icon: <Sparkles size={24} />, title: 'Therapist Well-being', desc: 'Fair compensation and emotionally supportive work environment for our therapists.' }
            ].map((value, i) => (
              <div key={i} className="card value-card">
                <div className="value-card-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section approach-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Therapeutic Approaches</h2>
            <p>Diverse modalities to support your unique healing journey</p>
          </div>
          <div className="approach-grid">
            {[
              'Trauma-Informed Therapy', 'Cognitive Behavioral Therapy (CBT)',
              'Dialectical Behavior Therapy (DBT)', 'EMDR',
              'Art Therapy', 'Queer-Affirmative Therapy',
              'Sex-Positive Therapy', 'Neurodivergent-Aware Practice',
              'Family Systems Therapy', 'Grief Counselling',
              'Mindfulness-Based Therapy', 'Solution-Focused Therapy'
            ].map((approach, i) => (
              <div key={i} className="approach-tag">{approach}</div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
