import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Linkedin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3 className="footer-logo">ehsaas</h3>
            <p>Find the right psychologist for your mental wellness journey. Professional, confidential, and accessible therapy.</p>
            <div className="footer-socials">
              <a href="https://instagram.com/ehsaastherapycentre" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="https://linkedin.com/company/ehsaas-therapy-centre" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/services">Services</Link>
            <Link to="/therapists">Find Therapists</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div className="footer-links">
            <h4>Services</h4>
            <Link to="/services">Individual Therapy</Link>
            <Link to="/services">Couples Counselling</Link>
            <Link to="/services">Group Therapy</Link>
            <Link to="/services">Corporate Workshops</Link>
          </div>

          <div className="footer-contact">
            <h4>Contact Us</h4>
            <a href="mailto:sessions@ehsaastherapycentre.com">
              <Mail size={16} />
              sessions@ehsaastherapycentre.com
            </a>
            <div className="footer-contact-item">
              <MapPin size={16} />
              <span>Bangalore, India</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} ehsaas Therapy Centre. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
