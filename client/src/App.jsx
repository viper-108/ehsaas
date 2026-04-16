import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AuthModal from './components/auth/AuthModal';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import TherapistsList from './pages/TherapistsList';
import TherapistDashboard from './pages/TherapistDashboard';
import ClientDashboard from './pages/ClientDashboard';
import { useAuth } from './context/AuthContext';

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#242424',
            color: '#c5c1b9',
            border: '1px solid rgba(197, 193, 185, 0.12)',
            fontFamily: 'var(--font-family)'
          }
        }}
      />
      <AuthModal />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/therapists" element={<TherapistsList />} />
          <Route path="/therapist/dashboard" element={<TherapistDashboard />} />
          <Route path="/client/dashboard" element={<ClientDashboard />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default App;
