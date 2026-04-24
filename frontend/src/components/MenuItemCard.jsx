import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Info, Star, MessageSquare, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

import API_BASE_URL from '../apiConfig';

const MenuItemCard = ({ item: initialItem, disabled }) => {
    const [item, setItem] = useState(initialItem);
    const { addToCart, cartItems } = useCart();
    const { userInfo } = useAuth();
    const [isAdded, setIsAdded] = useState(false);
    const [showReviews, setShowReviews] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setItem(initialItem);
    }, [initialItem]);

    const isInCart = cartItems.find(x => x._id === item._id);
    const qty = isInCart ? isInCart.qty : 0;

    const handleAdd = () => {
        addToCart(item);
        setIsAdded(true);
        toast.success(`${item.name} added to cart!`, {
            icon: '🍔',
            style: { borderRadius: '12px', background: '#1e222a', color: '#fff' }
        });
        setTimeout(() => setIsAdded(false), 1000);
    };

    const submitReviewHandler = async (e) => {
        e.preventDefault();
        if (!userInfo) {
            toast.error('Please login to review');
            return;
        }
        setSubmitting(true);
        try {
            const config = {
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}` 
                }
            };
            await axios.post(`/api/restaurants/${item.restaurant}/menu/${item._id}/reviews`, { rating, comment }, config);
            
            toast.success('Review added!');
            setComment('');
            
            // Refresh item data (or at least simulated refresh for better UX)
            const { data: menuData } = await axios.get(`/api/restaurants/${item.restaurant}/menu`);
            const updatedItem = menuData.find(i => i._id === item._id);
            if (updatedItem) setItem(updatedItem);
            
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel" 
            style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '16px', 
                padding: '16px', 
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{ display: 'flex', gap: '16px' }}>
                {/* Swiggy/Zomato style image container */}
                <div style={{ position: 'relative' }}>
                    <div style={{ 
                        width: '120px', 
                        height: '120px', 
                        borderRadius: '20px', 
                        background: item.imageUrl ? `url(${item.imageUrl.startsWith('http') ? item.imageUrl : API_BASE_URL + item.imageUrl})` : 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)'
                    }}>
                        {!item.imageUrl && <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>🍲</span>}
                    </div>
                    
                    {/* Visual Add Button overlapping the image (Modern Spec) */}
                    <div style={{ position: 'absolute', bottom: '-15px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                        <AnimatePresence mode="wait">
                            {isAdded ? (
                                <motion.button 
                                    key="added"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    style={{ 
                                        background: 'var(--secondary)', 
                                        color: 'white', 
                                        border: 'none', 
                                        padding: '6px 20px', 
                                        borderRadius: '12px', 
                                        fontWeight: 800,
                                        boxShadow: '0 4px 15px rgba(46, 213, 115, 0.4)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Check size={16} /> Added
                                </motion.button>
                            ) : (
                                <motion.button 
                                    key="add"
                                    whileTap={{ scale: disabled ? 1 : 0.9 }}
                                    onClick={handleAdd}
                                    disabled={disabled}
                                    style={{ 
                                        background: disabled ? 'rgba(255,255,255,0.1)' : 'var(--glass-bg)', 
                                        color: disabled ? 'rgba(255,255,255,0.5)' : 'var(--primary)', 
                                        border: `1px solid ${disabled ? 'rgba(255,255,255,0.2)' : 'var(--primary)'}`, 
                                        padding: '6px 24px', 
                                        borderRadius: '12px', 
                                        fontWeight: 800,
                                        boxShadow: disabled ? 'none' : '0 4px 15px rgba(0,0,0,0.2)',
                                        cursor: disabled ? 'not-allowed' : 'pointer',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    {disabled ? 'UNAVAILABLE' : 'ADD'} {qty > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary)', color: 'white', width: '20px', height: '20px', borderRadius: '50%', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{qty}</span>}
                                </motion.button>

                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', border: `1px solid ${item.foodType === 'Non-Veg' ? '#c0392b' : '#27ae60'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', borderRadius: '2px' }}>
                                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: item.foodType === 'Non-Veg' ? '#c0392b' : '#27ae60' }}></div>
                            </div>
                            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.3px', margin: 0 }}>{item.name}</h4>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem' }}>₹{item.price.toFixed(2)}</span>
                        {item.numReviews > 0 && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <Star size={12} fill="var(--accent)" /> {item.rating.toFixed(1)} ({item.numReviews})
                            </span>
                        )}
                    </div>
                    
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.description}
                    </p>

                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
                            <Info size={12} /> Customisable
                        </div>
                        <button 
                            onClick={() => setShowReviews(!showReviews)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                            <MessageSquare size={14} /> {showReviews ? 'Hide Reviews' : 'Reviews'}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showReviews && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px', overflow: 'hidden' }}
                    >
                        {/* Review Form */}
                        {userInfo ? (
                            <form onSubmit={submitReviewHandler} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <select 
                                    value={rating} 
                                    onChange={e => setRating(e.target.value)}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', padding: '0 5px' }}
                                >
                                    <option value="5">5★</option>
                                    <option value="4">4★</option>
                                    <option value="3">3★</option>
                                    <option value="2">2★</option>
                                    <option value="1">1★</option>
                                </select>
                                <input 
                                    type="text" 
                                    placeholder="Write a food review..." 
                                    value={comment} 
                                    onChange={e => setComment(e.target.value)}
                                    required
                                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', padding: '8px 12px', fontSize: '0.9rem' }}
                                />
                                <button 
                                    disabled={submitting}
                                    type="submit" 
                                    style={{ background: 'var(--primary)', border: 'none', color: 'white', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Send size={16} />
                                </button>
                            </form>
                        ) : (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '10px' }}>Login to review this item</p>
                        )}

                        {/* Reviews List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '150px', overflowY: 'auto', paddingRight: '5px' }}>
                            {item.reviews && item.reviews.length > 0 ? (
                                item.reviews.map(rev => (
                                    <div key={rev._id} style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{rev.name}</span>
                                            <span style={{ color: 'var(--accent)', fontSize: '0.75rem' }}>{'★'.repeat(rev.rating)}</span>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{rev.comment}</p>
                                    </div>
                                ))
                            ) : (
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>No reviews for this item yet.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default MenuItemCard;

