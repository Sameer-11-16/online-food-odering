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
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            if (activeTab === 'orders' || activeTab === 'receipts') {
                const { data } = await axios.get('/api/orders/myorders', config);
                setOrders(data);
            } else if (activeTab === 'bookings') {
                const { data } = await axios.get('/api/reservations/myreservations', config);
                setReservations(data);
            }
        };
        fetchData();
    }, [activeTab, userInfo]);

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
                ) : (
                    <div style={{ gridColumn: '1 / -1' }}>
                        <ReceiptsPanel orders={orders} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDashboard;
