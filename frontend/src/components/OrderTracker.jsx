import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../socket';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { X, ChefHat, Bike, CheckCircle, Clock } from 'lucide-react';

const OrderTracker = () => {
    const { userInfo } = useAuth();
    const [activeOrder, setActiveOrder] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!userInfo || userInfo.role !== 'customer') return;

        // Fetch latest active order on mount
        const fetchActiveOrder = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get('/api/orders/myorders', config);
                const active = data.find(order => ['Pending', 'Preparing', 'Out for Delivery'].includes(order.status));
                if (active) {
                    setActiveOrder(active);
                    setIsVisible(true);
                }
            } catch (err) {
                console.error('Failed to fetch active orders');
            }
        };

        fetchActiveOrder();

        const handleStatusUpdate = (updatedOrder) => {
            if (activeOrder && updatedOrder._id !== activeOrder._id) return;
            setActiveOrder(updatedOrder);
            setIsVisible(true);
            
            if (updatedOrder.status === 'Delivered') {
                setTimeout(() => setIsVisible(false), 10000); // Hide after 10s of delivery
            }
        };

        socket.on('orderStatusUpdate', handleStatusUpdate);

        return () => {
            socket.off('orderStatusUpdate', handleStatusUpdate);
        };
    }, [userInfo, activeOrder]);

    if (!activeOrder) return null;

    const steps = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];
    const currentStepIndex = steps.indexOf(activeOrder.status);

    const getIcon = (step) => {
        switch(step) {
            case 'Pending': return <Clock size={20} />;
            case 'Preparing': return <ChefHat size={20} />;
            case 'Out for Delivery': return <Bike size={20} />;
            case 'Delivered': return <CheckCircle size={20} />;
            default: return <Clock size={20} />;
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    style={{
                        position: 'fixed',
                        bottom: '30px',
                        right: '30px',
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid var(--glass-border)',
                        padding: '20px',
                        borderRadius: '20px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                        width: '320px',
                        zIndex: 1000
                    }}
                >
                    <button 
                        onClick={() => setIsVisible(false)}
                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                        <X size={16} />
                    </button>

                    <h4 style={{ margin: '0 0 15px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                        Live Order Tracker
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {steps.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;
                            
                            return (
                                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: isCompleted ? 1 : 0.4 }}>
                                    <div style={{ 
                                        width: '40px', height: '40px', 
                                        borderRadius: '50%', 
                                        background: isCurrent ? 'var(--primary)' : (isCompleted ? 'var(--secondary)' : 'rgba(255,255,255,0.1)'),
                                        color: isCompleted ? 'white' : 'var(--text-secondary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {getIcon(step)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontWeight: isCurrent ? 800 : 600, fontSize: '0.95rem' }}>{step}</p>
                                        {isCurrent && <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Currently {step.toLowerCase()} your order</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--glass-border)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Order ID: #{activeOrder._id.slice(-6).toUpperCase()}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OrderTracker;
