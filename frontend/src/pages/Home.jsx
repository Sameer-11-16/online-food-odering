import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Home = () => {
    const [restaurants, setRestaurants] = useState([]);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search') || '';
    const { userInfo } = useAuth();

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const { data } = await axios.get('/api/restaurants');
                setRestaurants(data);
            } catch (error) {
                console.error(error);
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
                style={{ textAlign: 'center', padding: '60px 0 40px', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '20px', lineHeight: 1.1 }}>
                    Premium food delivery <br />
                    to your <span className="gradient-text">doorstep</span>
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '40px' }}>
                    Experience the finest dining from the comfort of your home. 
                    Fast, fresh, and flawlessly delivered.
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>Order Now</motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-secondary" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>View Restaurants</motion.button>
                </div>
            </motion.section>

            <section style={{ marginTop: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Featured Restaurants</h2>
                </div>
                
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 0.4 }}
                    className="card-grid">
                    {filteredRestaurants.length === 0 ? <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No restaurants found for "{searchQuery}"</p> : filteredRestaurants.map((restaurant, index) => (
                        <motion.div
                            key={restaurant._id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            whileHover={{ y: -5 }}
                        >
                            <Link to={`/restaurant/${restaurant._id}`} className="glass-panel" style={{ overflow: 'hidden', display: 'block', height: '100%' }}>
                                <div style={{ height: '200px', background: `url(${restaurant.imageUrl || 'default'}) center/cover`, backgroundColor: 'rgba(255,255,255,0.05)', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        ⭐ {restaurant.rating}
                                    </div>
                                </div>
                                <div style={{ padding: '20px' }}>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>{restaurant.name}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{restaurant.description}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>20-30 min</span>
                                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{restaurant.numReviews} Reviews</span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </section>
        </motion.div>
    );
};

export default Home;
