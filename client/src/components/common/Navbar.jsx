import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, role, logout, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const handleDashboard = () => {
    setShowDropdown(false);
    if (role === 'therapist') {
      navigate('/therapist/dashboard');
    } else {
      navigate('/client/dashboard');
    }
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          ehsaas
        </Link>

        <div className={`navbar-links ${isOpen ? 'active' : ''}`}>
          <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/about" onClick={() => setIsOpen(false)}>About</Link>
          <Link to="/services" onClick={() => setIsOpen(false)}>Services</Link>
          <Link to="/therapists" onClick={() => setIsOpen(false)}>Find Therapists</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)}>Contact</Link>
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="user-menu">
              <button
                className="user-menu-trigger"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <User size={18} />
                <span>{user.firstName}</span>
              </button>
              {showDropdown && (
                <div className="user-dropdown">
                  <button onClick={handleDashboard}>
                    <LayoutDashboard size={16} />
                    Dashboard
                  </button>
                  <button onClick={handleLogout}>
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => openAuthModal('client', 'login')}
              >
                Client Login
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => openAuthModal('therapist', 'login')}
              >
                Therapist Login
              </button>
            </div>
          )}

          <button className="navbar-toggle" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
