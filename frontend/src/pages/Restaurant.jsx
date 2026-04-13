import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import MenuItemCard from '../components/MenuItemCard';
import DeliveryMap from '../components/DeliveryMap';
import { ArrowLeft, Calendar, UtensilsCrossed } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Restaurant = () => {
    const { id } = useParams();
    const { userInfo } = useAuth();
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('menu'); // 'menu' or 'booking'

    // Booking state
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [guests, setGuests] = useState(2);
    const [specialRequests, setSpecialRequests] = useState('');
    const [bookingStatus, setBookingStatus] = useState(null);

    useEffect(() => {
        const fetchRestaurantData = async () => {
            try {
                const { data: restData } = await axios.get(`/api/restaurants/${id}`);
                const { data: menuData } = await axios.get(`/api/restaurants/${id}/menu`);
                
                setRestaurant(restData);
                setMenu(menuData);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchRestaurantData();
    }, [id]);

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!userInfo) {
            setBookingStatus({ type: 'error', message: 'You must log in to book a table.' });
            return;
        }

        try {
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            await axios.post('/api/reservations', {
                restaurant: id,
                date,
                time,
                guests,
                specialRequests
            }, config);
            
            setBookingStatus({ type: 'success', message: 'Table booked successfully! Waiting for confirmation.' });
            setDate('');
            setTime('');
            setGuests(2);
            setSpecialRequests('');
        } catch (error) {
            setBookingStatus({ type: 'error', message: error.response?.data?.message || 'Failed to book table' });
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading...</div>;
    if (!restaurant) return <div style={{ textAlign: 'center', padding: '100px' }}>Restaurant not found</div>;

    return (
        <div style={{ paddingBottom: '60px' }}>
            {/* Hero Section */}
            <div className="glass-panel" style={{ padding: '40px', marginBottom: '40px', background: 'linear-gradient(to right, var(--glass-bg), rgba(255, 71, 87, 0.05))' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
                    <ArrowLeft size={16} /> Back to restaurants
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>{restaurant.name}</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px' }}>{restaurant.description}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', backgroundColor: 'var(--primary)', color: 'white', padding: '8px 16px', borderRadius: '12px', fontWeight: 700, gap: '6px', alignItems: 'center' }}>
                            ⭐ {restaurant.rating}
                        </div>
                        <p style={{ marginTop: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Reviews: {restaurant.numReviews}</p>
                    </div>
                </div>
                
                {/* Free Interactive Map */}
                <div style={{ marginTop: '30px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--primary)' }}>📍</span> Location Map
                    </h3>
                    <DeliveryMap address={restaurant.address} name={restaurant.name} />
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', flexWrap: 'wrap' }}>
                <button 
                    onClick={() => setActiveTab('menu')}
                    style={{ padding: '8px 24px', borderRadius: '20px', border: 'none', background: activeTab === 'menu' ? 'var(--primary)' : 'transparent', color: activeTab === 'menu' ? 'white' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s' }}>
                    <UtensilsCrossed size={18} /> Menu
                </button>
                <button 
                    onClick={() => setActiveTab('booking')}
                    style={{ padding: '8px 24px', borderRadius: '20px', border: 'none', background: activeTab === 'booking' ? 'var(--primary)' : 'transparent', color: activeTab === 'booking' ? 'white' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s' }}>
                    <Calendar size={18} /> Book a Table
                </button>
            </div>

            {/* Content Section */}
            <div style={{ minHeight: '400px' }}>
                <AnimatePresence mode="wait">
                    {activeTab === 'menu' ? (
                        <motion.div 
                            key="menu"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {menu.length === 0 ? (
                                <p style={{ color: 'var(--text-secondary)' }}>No menu items available right now.</p>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                                    {menu.map((item, i) => (
                                        <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                            <MenuItemCard item={item} />
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="booking"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="glass-panel"
                            style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}
                        >
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px', textAlign: 'center' }}>Reserve Your Table</h3>
                            
                            {bookingStatus && (
                                <div style={{ padding: '12px', borderRadius: '12px', marginBottom: '24px', textAlign: 'center', fontWeight: 600, background: bookingStatus.type === 'success' ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 71, 87, 0.1)', color: bookingStatus.type === 'success' ? 'var(--secondary)' : 'var(--primary)' }}>
                                    {bookingStatus.message}
                                </div>
                            )}

                            <form onSubmit={handleBooking}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="input-group">
                                        <label className="input-label">Date</label>
                                        <input type="date" className="input-glass" required value={date} onChange={e => setDate(e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Time</label>
                                        <input type="time" className="input-glass" required value={time} onChange={e => setTime(e.target.value)} />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Number of Guests</label>
                                    <input type="number" min="1" max="20" className="input-glass" required value={guests} onChange={e => setGuests(e.target.value)} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Special Requests (Optional)</label>
                                    <textarea className="input-glass" rows="3" placeholder="Allergies, window seat, anniversary..." value={specialRequests} onChange={e => setSpecialRequests(e.target.value)}></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem', padding: '14px' }}>
                                    Confirm Reservation
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Restaurant;
