import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, Calendar, MapPin, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { socket } from '../socket';
import { toast } from 'react-hot-toast';
import API_BASE_URL from '../apiConfig';
import ReceiptsPanel from '../components/dashboard/ReceiptsPanel';

const OrderTracker = ({ status }) => {

    const steps = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];
    let currentStep = steps.indexOf(status);
    if (currentStep === -1) currentStep = 0;

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '15px', left: '10px', right: '10px', height: '4px', background: 'var(--glass-border)', zIndex: 0 }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }} style={{ height: '100%', background: 'var(--primary)' }} />
            </div>
            {steps.map((step, idx) => (
                <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '4px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: idx <= currentStep ? 'var(--primary)' : 'var(--glass-bg)', border: '2px solid var(--glass-border)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {idx <= currentStep && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }} />}
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, opacity: idx <= currentStep ? 1 : 0.5 }}>{step}</span>
                </div>
            ))}
        </div>
    );
};

const CustomerDashboard = () => {
    const { userInfo } = useAuth();
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [activity, setActivity] = useState(null);
    const [reviewForm, setReviewForm] = useState({ show: false, targetId: null, type: 'restaurant', rating: 5, comment: '' });

    const fetchActivity = async () => {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('/api/users/activity', config);
        setActivity(data);
    };

    useEffect(() => {
        const fetchData = async () => {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            if (activeTab === 'orders' || activeTab === 'receipts') {
                const { data } = await axios.get('/api/orders/myorders', config);
                setOrders(data);
            } else if (activeTab === 'bookings') {
                const { data } = await axios.get('/api/reservations/myreservations', config);
                setReservations(data);
            } else if (activeTab === 'activity') {
                fetchActivity();
            }
        };
        fetchData();
    }, [activeTab, userInfo]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post(`/api/restaurants/${reviewForm.targetId}/reviews`, {
                rating: reviewForm.rating,
                comment: reviewForm.comment
            }, config);
            toast.success('Review shared! Thank you.');
            setReviewForm({ show: false, targetId: null, type: 'restaurant', rating: 5, comment: '' });
            fetchActivity();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        }
    };

    useEffect(() => {
        if (userInfo) {
            socket.emit('join', userInfo._id);

            socket.on('orderStatusUpdate', (updatedOrder) => {
                toast(`Order status updated: ${updatedOrder.status}`, {
                    icon: '🚚',
                    duration: 6000,
                    style: { background: 'var(--secondary)', color: 'white', fontWeight: 'bold' }
                });
                setOrders(prevOrders => prevOrders.map(order => order._id === updatedOrder._id ? { ...order, status: updatedOrder.status } : order));
                new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3').play().catch(e => {});
            });

            socket.on('reservationStatusUpdate', (updatedRes) => {
                toast(`Reservation ${updatedRes.status}!`, {
                    icon: updatedRes.status === 'Confirmed' ? '✅' : '❌',
                    duration: 6000,
                    style: { background: updatedRes.status === 'Confirmed' ? 'var(--secondary)' : 'var(--primary)', color: 'white', fontWeight: 'bold' }
                });
                setReservations(prevRes => prevRes.map(res => res._id === updatedRes._id ? { ...res, status: updatedRes.status } : res));
                new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3').play().catch(e => {});
            });

            return () => {
                socket.off('orderStatusUpdate');
                socket.off('reservationStatusUpdate');
            };
        }
    }, [userInfo]);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>My Food Journey</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    <button onClick={() => setActiveTab('orders')} className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}>My Orders</button>
                    <button onClick={() => setActiveTab('bookings')} className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}>Table Bookings</button>
                    <button onClick={() => setActiveTab('receipts')} className={`btn ${activeTab === 'receipts' ? 'btn-primary' : 'btn-secondary'}`}>Receipts</button>
                    <button onClick={() => setActiveTab('activity')} className={`btn ${activeTab === 'activity' ? 'btn-primary' : 'btn-secondary'}`}>My Activity</button>
                </div>
            </div>

            <div className="card-grid">
                {activeTab === 'orders' ? (
                    orders.map(order => (
                        <div key={order._id} className="glass-panel" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h4 style={{ fontWeight: 800, color: 'var(--primary)' }}>{order.restaurant?.name}</h4>
                                <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                                {order.orderItems.map(item => (
                                    <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ 
                                            width: '45px', 
                                            height: '45px', 
                                            borderRadius: '8px', 
                                            background: item.image && item.image !== 'default' ? `url(${item.image.startsWith('http') ? item.image : API_BASE_URL + item.image}) no-repeat center/cover` : 'var(--primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.2rem',
                                            flexShrink: 0
                                        }}>
                                            {(!item.image || item.image === 'default') && '🍲'}
                                        </div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                                            {item.qty}x {item.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                                    <span>Total Spent</span>
                                    <span>₹{order.totalPrice.toFixed(2)}</span>
                                </div>
                                <OrderTracker status={order.status} />
                            </div>
                        </div>
                    ))
                ) : activeTab === 'bookings' ? (
                    reservations.map(res => (
                        <div key={res._id} className="glass-panel" style={{ padding: '24px' }}>
                             <h4 style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>{res.restaurant?.name}</h4>
                             <p style={{ fontSize: '0.9rem' }}>{res.date} at {res.time}</p>
                             <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>{res.guests} Guests • {res.status}</p>
                        </div>
                    ))
                ) : activeTab === 'activity' ? (
                    <div style={{ gridColumn: '1 / -1' }}>
                        {activity?.pendingReviews.length > 0 && (
                            <div style={{ marginBottom: '40px' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    ✨ Pending Reviews <span style={{ background: 'var(--primary)', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px' }}>{activity.pendingReviews.length}</span>
                                </h3>
                                <div style={{ 
                                    display: 'flex', 
                                    overflowX: 'auto', 
                                    gap: '16px', 
                                    padding: '4px 4px 20px 4px', 
                                    margin: '0 -4px',
                                    scrollbarWidth: 'none',
                                    WebkitOverflowScrolling: 'touch'
                                }}>
                                    {activity.pendingReviews.map(order => (
                                        <div key={order._id} className="glass-panel" style={{ minWidth: '280px', padding: '20px', flexShrink: 0 }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                                                <div style={{ width: '50px', height: '50px', borderRadius: '10px', background: `url(${order.image ? (order.image.startsWith('http') ? order.image : API_BASE_URL + order.image) : ''}) center/cover`, backgroundColor: 'var(--glass-bg)' }} />
                                                <div>
                                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{order.targetName}</h4>
                                                    <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                                                        <p>🛒 Purchased: {new Date(order.purchasedAt).toLocaleDateString()}</p>
                                                        <p>✅ Delivered: {new Date(order.deliveredAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setReviewForm({ ...reviewForm, show: true, targetId: order.targetId })}
                                                className="btn btn-primary" 
                                                style={{ width: '100%', padding: '8px', fontSize: '0.85rem' }}
                                            >
                                                Review Now
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px' }}>Your Review History</h3>
                        <div className="card-grid">
                            {activity?.reviews.length === 0 ? (
                                <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>No reviews shared yet.</p>
                            ) : (
                                activity?.reviews.map((rev, i) => (
                                    <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, scale: 0.95 }} 
                                        animate={{ opacity: 1, scale: 1 }} 
                                        transition={{ delay: i * 0.05 }}
                                        className="glass-panel" 
                                        style={{ padding: '20px', borderLeft: `4px solid ${rev.type === 'Restaurant' ? 'var(--primary)' : '#2ed573'}` }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <div>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{rev.type} Review</span>
                                                <h4 style={{ fontWeight: 800, fontSize: '1.05rem', marginTop: '2px' }}>{rev.targetName}</h4>
                                            </div>
                                            <div style={{ background: 'rgba(255, 165, 2, 0.15)', color: '#ffa502', padding: '4px 8px', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem' }}>
                                                ⭐ {rev.rating}
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '12px' }}>"{rev.comment}"</p>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.5, textAlign: 'right' }}>
                                            {new Date(rev.createdAt).toLocaleDateString()}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ gridColumn: '1 / -1' }}>
                        <ReceiptsPanel orders={orders} />
                    </div>
                )}
            </div>

            {/* Quick Review Modal */}
            <AnimatePresence>
                {reviewForm.show && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-panel" 
                            style={{ 
                                padding: 'clamp(20px, 5vw, 30px)', 
                                maxWidth: '400px', 
                                width: 'calc(100% - 32px)',
                                maxHeight: '90vh',
                                overflowY: 'auto'
                            }}
                        >
                            <h3 style={{ marginBottom: '20px', fontWeight: 800 }}>Quick Review</h3>
                            <form onSubmit={handleReviewSubmit}>
                                <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <span 
                                            key={star} 
                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                            style={{ fontSize: '1.5rem', cursor: 'pointer', color: star <= reviewForm.rating ? '#ffa502' : 'rgba(255,255,255,0.1)' }}
                                        >
                                            ⭐
                                        </span>
                                    ))}
                                </div>
                                <textarea 
                                    className="input-glass" 
                                    style={{ width: '100%', minHeight: '100px', marginBottom: '20px' }} 
                                    placeholder="Share your experience..."
                                    value={reviewForm.comment}
                                    onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    required
                                />
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Post Review</button>
                                    <button type="button" onClick={() => setReviewForm({ ...reviewForm, show: false })} className="btn btn-secondary">Cancel</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomerDashboard;
