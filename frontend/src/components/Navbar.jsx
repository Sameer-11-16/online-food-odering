import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Utensils, ShoppingBag, User, Sun, Moon, Search, LogOut, Home, MapPin, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import useGeoLocation from '../hooks/useGeoLocation';

const Navbar = () => {
  const [searchKw, setSearchKw] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartItems, clearCart } = useCart();
  const { userInfo, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const navigate = useNavigate();
  const location = useGeoLocation();
  const [address, setAddress] = useState('Locating...');

  useEffect(() => {
    if (location.lat && location.lng) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.address) {
                // Try to get a meaningful short address
                const shortAddr = data.address.suburb || data.address.neighbourhood || data.address.city_district || data.address.city || data.address.town;
                const city = data.address.city || data.address.state_district || data.address.state;
                setAddress(`${shortAddr ? shortAddr + ', ' : ''}${city}`);
            } else {
                setAddress('Location Found');
            }
        })
        .catch(() => setAddress('Location Found'));
    } else if (location.error) {
        setAddress('Location Disabled');
    }
  }, [location.lat, location.lng, location.error]);


  const handleSearch = (e) => {
    e.preventDefault();
    if(searchKw.trim()) navigate(`/search?q=${searchKw}`);
    else navigate('/');
    setMobileMenuOpen(false);
  }

  const handleMobileNav = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  }

  const logoutHandler = () => {
    clearCart();
    logout();
    navigate('/login');
  }

  return (
    <nav className="glass-nav">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '12px' }}>
                <Utensils size={24} color="white" />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }} className="hide-mobile">
                Bite<span className="gradient-text">Stream</span>
              </h1>
            </Link>

            {userInfo?.role !== 'restaurant_owner' && (
                <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--glass-accent)', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--glass-border)', fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '200px' }}>
                    <MapPin size={14} color="var(--primary)" style={{ flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{address}</span>
                </div>
            )}
          </div>

          {userInfo?.role !== 'restaurant_owner' && (
              <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: 'var(--glass-accent)', padding: '6px 16px', borderRadius: '24px', border: '1px solid var(--glass-border)' }} className="hide-mobile">
                <Search size={16} color="var(--text-secondary)" style={{ marginRight: '8px' }} />
                <input type="text" placeholder="Search..." value={searchKw} onChange={e=>setSearchKw(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '150px' }} />
              </form>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {userInfo?.role !== 'restaurant_owner' && (
              <>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontWeight: 500, transition: 'color 0.2s' }}>
                  <Home size={20} />
                  <span className="hide-mobile">Home</span>
                </Link>
                
                <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontWeight: 500, transition: 'color 0.2s' }}>
                <div style={{ position: 'relative' }}>
                    <ShoppingBag size={20} />
                    {cartCount > 0 && (
                        <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary)', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '20px' }}>{cartCount}</span>
                    )}
                </div>
                <span className="hide-mobile" style={{ marginLeft: '4px' }}>Cart</span>
                </Link>
              </>
            )}
            
            {userInfo ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {userInfo.role === 'restaurant_owner' ? (
                        <Link to="/dashboard" className="hide-mobile" style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', border: '1px solid var(--primary)', padding: '6px 12px', borderRadius: '12px' }}>
                            Business Command
                        </Link>
                    ) : (
                        <Link to="/user-dashboard" className="hide-mobile" style={{ fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: 700, textDecoration: 'none', border: '1px solid var(--secondary)', padding: '6px 12px', borderRadius: '12px' }}>
                            My Activity
                        </Link>
                    )}
                    <Link to="/profile" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                        <User size={18} color="var(--secondary)" />
                        <span className="hide-mobile" style={{ marginLeft: '6px' }}>Account</span>
                    </Link>
                    <button onClick={logoutHandler} className="btn" style={{ background: 'rgba(255, 71, 87, 0.1)', color: 'var(--primary)', border: 'none', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            ) : (
                <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                    <User size={18} />
                    <span className="hide-mobile" style={{ marginLeft: '6px' }}>Sign In</span>
                </Link>
            )}
            
            <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', marginLeft: '8px' }}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button className="mobile-only" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', alignItems: 'center', marginLeft: '8px' }}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
          <div style={{ position: 'absolute', top: '80px', left: 0, width: '100%', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--glass-border)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 99, boxShadow: 'var(--glass-shadow)' }}>
            
            {userInfo?.role !== 'restaurant_owner' && (
                <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--glass-accent)', padding: '10px 16px', borderRadius: '12px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={16} color="var(--primary)" />
                    <span>{address}</span>
                </div>

                <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: 'var(--glass-accent)', padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <Search size={18} color="var(--text-secondary)" style={{ marginRight: '8px' }} />
                    <input type="text" placeholder="Search food..." value={searchKw} onChange={e=>setSearchKw(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%' }} />
                </form>
                </>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
                {userInfo?.role !== 'restaurant_owner' && (
                    <>
                        <button onClick={() => handleMobileNav('/')} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', padding: '8px 0' }}>
                            <Home size={22} /> Home
                        </button>
                        <button onClick={() => handleMobileNav('/cart')} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', padding: '8px 0' }}>
                            <div style={{ position: 'relative' }}>
                                <ShoppingBag size={22} />
                                {cartCount > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary)', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '20px' }}>{cartCount}</span>}
                            </div>
                            Cart
                        </button>
                    </>
                )}
                
                {userInfo ? (
                    <>
                        {userInfo.role === 'restaurant_owner' ? (
                            <button onClick={() => handleMobileNav('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', padding: '8px 0' }}>
                                <Utensils size={22} /> Business Command
                            </button>
                        ) : (
                            <button onClick={() => handleMobileNav('/user-dashboard')} style={{ background: 'none', border: 'none', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', padding: '8px 0' }}>
                                <User size={22} /> My Activity
                            </button>
                        )}
                        <button onClick={() => handleMobileNav('/profile')} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', padding: '8px 0' }}>
                            <User size={22} /> Account
                        </button>
                        <button onClick={() => { logoutHandler(); setMobileMenuOpen(false); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', padding: '8px 0' }}>
                            <LogOut size={22} /> Logout
                        </button>
                    </>
                ) : (
                    <button onClick={() => handleMobileNav('/login')} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', padding: '8px 0' }}>
                        <User size={22} /> Sign In
                    </button>
                )}
            </div>
          </div>
      )}
    </nav>
  );
};

export default Navbar;
