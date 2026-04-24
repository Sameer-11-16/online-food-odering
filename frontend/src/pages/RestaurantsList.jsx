import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import API_BASE_URL from '../apiConfig';
import useGeoLocation from '../hooks/useGeoLocation';
import { getDistanceKm, MAX_DELIVERY_KM } from '../utils/distance';
import { MapPin, Navigation } from 'lucide-react';

const RestaurantsList = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
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

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading restaurants...</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingBottom: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>All Restaurants</h1>
            </div>
            
            <div className="card-grid">
                {restaurants.length === 0 ? <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No restaurants found.</p> : restaurants.map((restaurant, index) => {
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
                })}
            </div>
        </motion.div>
    );
};

export default RestaurantsList;
