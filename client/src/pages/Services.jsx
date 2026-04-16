import { Link } from 'react-router-dom';
import { Heart, Users, Globe, Briefcase, Brain, BookOpen, ArrowRight } from 'lucide-react';
import './Services.css';

const services = [
  {
    icon: <Heart size={32} />,
    title: 'Individual Therapy',
    desc: 'Personalized one-on-one sessions designed to address your unique mental health needs. Our therapists create a safe, confidential space where you can explore your thoughts, feelings, and behaviors.',
    features: ['Anxiety & Depression', 'Trauma & PTSD', 'Self-Esteem', 'Life Transitions', 'Stress Management']
  },
  {
    icon: <Users size={32} />,
    title: 'Couples Counselling',
    desc: 'Strengthen your relationship through guided conversations. Our couple therapists help partners improve communication, resolve conflicts, and rebuild trust.',
    features: ['Communication Skills', 'Conflict Resolution', 'Trust Building', 'Intimacy Issues', 'Pre-Marital Counselling']
  },
  {
    icon: <Globe size={32} />,
    title: 'Group Therapy',
    desc: 'Experience shared healing in safe, facilitated group environments. Connect with others who share similar experiences and learn from collective wisdom.',
    features: ['Peer Support', 'Shared Experiences', 'Social Skills', 'Community Healing', 'Cost-Effective']
  },
  {
    icon: <Brain size={32} />,
    title: 'Specialized Care',
    desc: 'Tailored therapeutic approaches for specific needs including neurodivergent-aware, queer-affirmative, and sex-positive therapy.',
    features: ['Neurodivergent-Aware', 'Queer-Affirmative', 'Sex-Positive', 'Trauma-Informed', 'EMDR & CBT']
  },
  {
    icon: <Briefcase size={32} />,
    title: 'Corporate Wellness',
    desc: 'Mental health workshops and programs designed for workplace well-being. Help your team thrive with professional mental health support.',
    features: ['Workshops', 'Team Building', 'Stress Management', 'Burnout Prevention', 'EAP Programs']
  },
  {
    icon: <BookOpen size={32} />,
    title: 'Supervision & Mentorship',
    desc: 'Professional development support for mental health practitioners. Peer supervision, mentorship, and continuing education opportunities.',
    features: ['Peer Supervision', 'Clinical Mentorship', 'Case Discussions', 'Skill Development', 'Ethical Guidance']
  }
];

const Services = () => {
  return (
    <div className="services-page">
      <section className="page-hero">
        <div className="container">
          <h1>Our Services</h1>
          <p>Comprehensive mental health support for every stage of your journey</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="services-list">
            {services.map((service, i) => (
              <div key={i} className={`service-detail-card ${i % 2 === 1 ? 'reverse' : ''}`}>
                <div className="service-detail-content">
                  <div className="service-detail-icon">{service.icon}</div>
                  <h2>{service.title}</h2>
                  <p>{service.desc}</p>
                  <div className="service-features">
                    {service.features.map((f, j) => (
                      <span key={j} className="badge">{f}</span>
                    ))}
                  </div>
                  <Link to="/therapists" className="btn btn-primary">
                    Find Therapists <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
