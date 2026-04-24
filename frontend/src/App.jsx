import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { socket } from './socket';
import { useAuth } from './context/AuthContext';
import toast from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Restaurant from './pages/Restaurant';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import PaymentSuccess from './pages/PaymentSuccess';


// Persona-based separations
import CustomerProfile from './pages/CustomerProfile';
import CustomerDashboard from './pages/CustomerDashboard';
import BusinessProfile from './pages/BusinessProfile';
import BusinessDashboard from './pages/BusinessDashboard';

const AppContent = () => {
  const location = useLocation();
  const { userInfo } = useAuth();
  const isWideLayout = ['/dashboard', '/business-profile', '/admin'].includes(location.pathname);
  const hideNavbar = ['/login', '/register', '/forgot-password'].includes(location.pathname);


  useEffect(() => {
    if (userInfo) {
      socket.connect();
      socket.emit('join', userInfo._id);

      socket.on('orderStatusUpdate', (order) => {
        toast.success(`Order Status: ${order.status}`, {
          icon: '🍕',
          duration: 6000,
          style: { background: 'var(--secondary)', color: 'white' }
        });
        new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3').play().catch(e => {});
      });

      socket.on('reservationStatusUpdate', (res) => {
        toast(`Reservation ${res.status}`, {
          icon: '📅',
          duration: 6000,
          style: { background: 'var(--primary)', color: 'white' }
        });
        new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3').play().catch(e => {});
      });
      
      return () => {
        socket.off('orderStatusUpdate');
        socket.off('reservationStatusUpdate');
        socket.disconnect();
      };
    }
  }, [userInfo]);

  return (
    <>
      <Toaster position="top-center" toastOptions={{ 
        style: { background: 'var(--glass-bg)', color: 'var(--text-primary)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)', borderRadius: '16px', boxShadow: 'var(--glass-shadow)' } 
      }} />
      {!hideNavbar && <Navbar />}
      <main className={isWideLayout ? "container-wide" : "container"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurant/:id" element={<Restaurant />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Customer Routes */}

          <Route path="/profile" element={<CustomerProfile />} />
          <Route path="/user-dashboard" element={<CustomerDashboard />} />
          
          {/* Owner Routes */}
          <Route path="/dashboard" element={<BusinessDashboard />} />
          <Route path="/business-profile" element={<BusinessProfile />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Routes>

      </main>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
