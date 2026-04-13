import React from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Clock, CheckCircle } from 'lucide-react';

const KitchenPanel = ({ orders = [], updateOrderStatus }) => {
    // Only show pending or preparing orders to the kitchen
    const activeKOT = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing');

    return (
        <div style={{ padding: '0 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Kitchen Display System (KDS)</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 71, 87, 0.1)', color: 'var(--primary)', padding: '8px 16px', borderRadius: '20px', fontWeight: 800 }}>
                    <ChefHat size={20} /> {activeKOT.length} Active Tickets
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {activeKOT.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', background: 'var(--glass-accent)', borderRadius: '20px', border: '1px dashed var(--glass-border)' }}>
                        <ChefHat size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Kitchen is clear. Waiting for orders...</h3>
                    </div>
                ) : (
                    activeKOT.map((order, idx) => (
                        <motion.div 
                            key={order._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            style={{ background: 'var(--glass-accent)', border: order.status === 'Pending' ? '2px solid var(--primary)' : '1px solid var(--glass-border)', padding: '24px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}
                        >
                            {order.status === 'Pending' && (
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--primary)' }} />
                            )}
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', marginBottom: '16px' }}>
                                <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>Ticket #{order._id.substring(order._id.length - 4).toUpperCase()}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
                                    <Clock size={14} /> {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', minHeight: '100px' }}>
                                {order.orderItems.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '12px', fontSize: '1.1rem', fontWeight: 600 }}>
                                        <span style={{ color: 'var(--primary)', background: 'rgba(255, 71, 87, 0.1)', padding: '2px 8px', borderRadius: '8px' }}>{item.qty}x</span>
                                        <span>{item.name}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                {order.status === 'Pending' ? (
                                    <button onClick={() => updateOrderStatus(order._id, 'Preparing')} style={{ flex: 1, background: '#1e90ff', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>
                                        Start Cooking
                                    </button>
                                ) : (
                                    <button onClick={() => updateOrderStatus(order._id, 'Out for Delivery')} style={{ flex: 1, background: '#2ed573', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                        <CheckCircle size={18} /> Mark Ready
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default KitchenPanel;
