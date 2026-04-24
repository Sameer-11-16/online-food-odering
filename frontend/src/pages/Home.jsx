import { useEffect, useState, useRef } from 'react';
import { CardSkeleton } from '../components/Skeleton';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import API_BASE_URL from '../apiConfig';
import useGeoLocation from '../hooks/useGeoLocation';
import { getDistanceKm, MAX_DELIVERY_KM } from '../utils/distance';
import { MapPin, Navigation } from 'lucide-react';

const Home = () => {

    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search') || '';
    const { userInfo } = useAuth();
    const userLocation = useGeoLocation();

    const getDistance = (restaurant) => {
        if (!userLocation.lat || !restaurant.location?.lat) return null;
        return getDistanceKm(userLocation.lat, userLocation.lng, restaurant.location.lat, restaurant.location.lng);
    };

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const { data } = await axios.get('/api/restaurants');
                setRestaurants(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchRestaurants();
    }, []);

    const filteredRestaurants = restaurants.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <motion.section 
                initial={{ y: 30, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.2, duration: 0.6 }}
                className="hero-section"
                style={{ textAlign: 'center', padding: '80px 0 60px', maxWidth: '900px', margin: '0 auto' }}>
                <h1 style={{ fontWeight: 800, marginBottom: '24px' }}>
                    Premium food delivery <br className="hide-mobile" />
                    to your <span className="gradient-text">doorstep</span>
                </h1>
                <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: 1.6 }}>
                    Experience the finest dining from the comfort of your home. 
                    Fast, fresh, and flawlessly delivered.
                </p>
                <div className="btn-group-responsive" style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="btn btn-primary"
                        style={{ padding: '14px 40px', fontSize: '1.1rem' }}
                        onClick={() => document.getElementById('restaurant-list')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Order Now
                    </motion.button>
                    <Link to="/restaurants">
                        <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            className="btn btn-secondary"
                            style={{ padding: '14px 40px', fontSize: '1.1rem', width: '100%' }}
                        >
                            View All Restaurants
                        </motion.button>
                    </Link>
                </div>
            </motion.section>

            <section id="restaurant-list" style={{ marginTop: '40px' }}>
                <div className="section-header">
                    <h2 style={{ fontWeight: 700 }}>Featured Restaurants</h2>
                    <Link to="/restaurants" style={{ color: 'var(--primary)', fontWeight: 600 }}>See All</Link>
                </div>
                
                <div className="card-grid">
                    {loading ? (
                        [...Array(4)].map((_, i) => <CardSkeleton key={i} />)
                    ) : filteredRestaurants.length === 0 ? (
                        <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No restaurants found matching your search.</p>
                    ) : (
                        filteredRestaurants.slice(0, 4).map((restaurant, index) => {
                            const dist = getDistance(restaurant);
                            const tooFar = dist !== null && dist > MAX_DELIVERY_KM;
                            return (
                                <motion.div
                                    key={restaurant._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    whileHover={{ y: tooFar ? 0 : -5 }}
                                    style={{ opacity: tooFar ? 0.55 : 1 }}
                                >
                                    <Link to={`/restaurant/${restaurant._id}`} className="glass-panel" style={{ overflow: 'hidden', display: 'block', height: '100%', pointerEvents: tooFar ? 'none' : 'auto' }}>
                                        <div style={{ height: '200px', background: `url(${restaurant.imageUrl ? (restaurant.imageUrl.startsWith('http') ? restaurant.imageUrl : API_BASE_URL + restaurant.imageUrl) : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'}) center/cover`, backgroundColor: 'rgba(255,255,255,0.05)', position: 'relative' }}>
                                            <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                ⭐ {restaurant.rating}
                                            </div>
                                            {dist !== null && (
                                                <div style={{ position: 'absolute', top: '16px', left: '16px', background: tooFar ? 'rgba(255,71,87,0.85)' : 'rgba(46,213,115,0.85)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', color: 'white' }}>
                                                    <Navigation size={12} /> {dist.toFixed(1)} km
                                                </div>
                                            )}
                                            {tooFar && (
                                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ background: 'rgba(255,71,87,0.9)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontWeight: 800, fontSize: '0.85rem' }}>Out of Delivery Range</span>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ padding: '20px' }}>
                                            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>{restaurant.name}</h3>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{restaurant.description}</p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <MapPin size={13} /> {dist !== null ? `${dist.toFixed(1)} km away` : '20-30 min'}
                                                </span>
                                                <span style={{ fontWeight: 600, color: tooFar ? '#ff4757' : 'var(--primary)' }}>{tooFar ? 'Too Far' : `${restaurant.numReviews} Reviews`}</span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </section>
        </motion.div>
    );
};

export default Home;
