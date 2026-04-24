import { useEffect, useState } from 'react';
import Skeleton, { MenuItemSkeleton } from '../components/Skeleton';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import MenuItemCard from '../components/MenuItemCard';
import DeliveryMap from '../components/DeliveryMap';
import { ArrowLeft, Calendar, UtensilsCrossed, Navigation, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import useGeoLocation from '../hooks/useGeoLocation';
import { getDistanceKm, MAX_DELIVERY_KM } from '../utils/distance';

const Restaurant = () => {
    const { id } = useParams();
    const { userInfo } = useAuth();
    const userLocation = useGeoLocation();
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'booking', or 'reviews'

    // Booking state
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [guests, setGuests] = useState(2);
    const [specialRequests, setSpecialRequests] = useState('');
    const [bookingStatus, setBookingStatus] = useState(null);

    // Review state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [reviewStatus, setReviewStatus] = useState(null);

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

    const submitReviewHandler = async (e) => {
        e.preventDefault();
        if (!userInfo) {
            setReviewStatus({ type: 'error', message: 'You must log in to write a review.' });
            return;
        }

        try {
            const config = {
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}` 
                }
            };
            await axios.post(`/api/restaurants/${id}/reviews`, { rating, comment }, config);
            
            setReviewStatus({ type: 'success', message: 'Review submitted successfully!' });
            setRating(5);
            setComment('');
            
            // Refresh restaurant data to show new review
            const { data: restData } = await axios.get(`/api/restaurants/${id}`);
            setRestaurant(restData);
        } catch (error) {
            setReviewStatus({ type: 'error', message: error.response?.data?.message || 'Failed to submit review' });
        }
    };

    if (loading) return (
        <div className="container" style={{ paddingTop: '100px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }} className="responsive-header">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <Skeleton width="60%" height="48px" borderRadius="12px" />
                    <Skeleton width="100%" height="100px" borderRadius="12px" />
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <Skeleton width="100px" height="40px" />
                        <Skeleton width="100px" height="40px" />
                    </div>
                </div>
                <Skeleton width="100%" height="250px" borderRadius="24px" />
            </div>
            <div className="card-grid" style={{ marginTop: '50px' }}>
                {[...Array(4)].map((_, i) => <MenuItemSkeleton key={i} />)}
            </div>
        </div>
    );
    if (!restaurant) return <div style={{ textAlign: 'center', padding: '100px' }}>Restaurant not found</div>;

    const dist = userLocation.lat && restaurant?.location?.lat 
        ? getDistanceKm(userLocation.lat, userLocation.lng, restaurant.location.lat, restaurant.location.lng) 
        : null;
    const tooFar = dist !== null && dist > MAX_DELIVERY_KM;


    return (
        <div style={{ paddingBottom: '60px' }}>
            {/* Hero Section */}
            <div className="glass-panel hero-section" style={{ padding: '40px', marginBottom: '40px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(to right, var(--glass-bg), rgba(255, 71, 87, 0.05))' }}>
                {tooFar && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'rgba(255, 71, 87, 0.9)', padding: '8px', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 800, zIndex: 10 }}>
                        <AlertTriangle size={16} /> Out of Delivery Range — Orders Disabled ({dist.toFixed(1)} km away)
                    </div>
                )}

                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
                    <ArrowLeft size={16} /> Back to restaurants
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ flex: '1 1 300px' }}>
                        <h1 style={{ fontWeight: 800, marginBottom: '8px' }}>{restaurant.name}</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 2vw, 1.1rem)', maxWidth: '600px' }}>{restaurant.description}</p>
                    </div>
                    <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
                        <div style={{ display: 'inline-flex', backgroundColor: 'var(--primary)', color: 'white', padding: '8px 16px', borderRadius: '12px', fontWeight: 700, gap: '6px', alignItems: 'center' }}>
                            ⭐ {restaurant.rating.toFixed(1)}
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
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', overflowX: 'auto', whiteSpace: 'nowrap', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
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
                <button 
                    onClick={() => setActiveTab('reviews')}
                    style={{ padding: '8px 24px', borderRadius: '20px', border: 'none', background: activeTab === 'reviews' ? 'var(--primary)' : 'transparent', color: activeTab === 'reviews' ? 'white' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s' }}>
                    ⭐ Reviews
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
                                        <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={{ opacity: tooFar ? 0.6 : 1, pointerEvents: tooFar ? 'none' : 'auto' }}>
                                            <MenuItemCard item={item} disabled={tooFar} />
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ) : activeTab === 'booking' ? (
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
                    ) : (
                        <motion.div 
                            key="reviews"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px', alignItems: 'start' }}>
                                {/* Review Form */}
                                <div className="glass-panel" style={{ padding: '30px' }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px' }}>Write a Review</h3>
                                    {reviewStatus && (
                                        <div style={{ padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center', fontSize: '0.9rem', background: reviewStatus.type === 'success' ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 71, 87, 0.1)', color: reviewStatus.type === 'success' ? 'var(--secondary)' : 'var(--primary)' }}>
                                            {reviewStatus.message}
                                        </div>
                                    )}
                                    {userInfo ? (
                                        <form onSubmit={submitReviewHandler}>
                                            <div className="input-group">
                                                <label className="input-label">Rating</label>
                                                <select className="input-glass" value={rating} onChange={(e) => setRating(e.target.value)}>
                                                    <option value="5">5 - Excellent</option>
                                                    <option value="4">4 - Very Good</option>
                                                    <option value="3">3 - Good</option>
                                                    <option value="2">2 - Fair</option>
                                                    <option value="1">1 - Poor</option>
                                                </select>
                                            </div>
                                            <div className="input-group">
                                                <label className="input-label">Comment</label>
                                                <textarea className="input-glass" rows="4" value={comment} onChange={(e) => setComment(e.target.value)} required placeholder="Share your experience..."></textarea>
                                            </div>
                                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Review</button>
                                        </form>
                                    ) : (
                                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            Please <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>login</Link> to write a review.
                                        </p>
                                    )}
                                </div>

                                {/* Review List */}
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px' }}>Customer Reviews</h3>
                                    {restaurant.reviews.length === 0 ? (
                                        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            No reviews yet. Be the first to review!
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            {restaurant.reviews.map((review) => (
                                                <div key={review._id} className="glass-panel" style={{ padding: '20px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                        <strong style={{ fontSize: '1.1rem' }}>{review.name}</strong>
                                                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{'⭐'.repeat(Math.round(review.rating))}</span>
                                                    </div>
                                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '0.95rem' }}>{review.comment}</p>
                                                    <small style={{ color: 'var(--text-tertiary)' }}>{new Date(review.createdAt).toLocaleDateString()}</small>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>

    );
};

export default Restaurant;
