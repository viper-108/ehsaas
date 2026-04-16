import { useState } from 'react';
import { Mail, MapPin, Instagram, Linkedin, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import './Contact.css';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate form submission
    setTimeout(() => {
      toast.success('Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="contact-page">
      <section className="page-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Reach out anytime.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Get in Touch</h2>
              <p>Have questions about our services or want to learn more? Feel free to reach out.</p>

              <div className="contact-details">
                <div className="contact-item">
                  <Mail size={20} />
                  <div>
                    <h4>Email</h4>
                    <a href="mailto:sessions@ehsaastherapycentre.com">sessions@ehsaastherapycentre.com</a>
                  </div>
                </div>
                <div className="contact-item">
                  <MapPin size={20} />
                  <div>
                    <h4>Location</h4>
                    <p>Bangalore, India</p>
                  </div>
                </div>
              </div>

              <div className="contact-socials">
                <h4>Follow Us</h4>
                <div className="social-links">
                  <a href="https://instagram.com/ehsaastherapycentre" target="_blank" rel="noopener noreferrer">
                    <Instagram size={20} /> Instagram
                  </a>
                  <a href="https://linkedin.com/company/ehsaas-therapy-centre" target="_blank" rel="noopener noreferrer">
                    <Linkedin size={20} /> LinkedIn
                  </a>
                </div>
              </div>
            </div>

            <div className="contact-form-wrapper">
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="How can we help?"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us more..."
                    rows={5}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Sending...' : <>Send Message <Send size={16} /></>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
