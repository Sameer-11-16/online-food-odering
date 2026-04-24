import { Truck, MapPin, Clock } from 'lucide-react';

const statusColor = (s) => {
    if (s === 'Delivered') return { bg: 'rgba(46,213,115,0.1)', color: '#2ed573' };
    if (s === 'Out for Delivery') return { bg: 'rgba(30,144,255,0.1)', color: '#1e90ff' };
    if (s === 'Preparing') return { bg: 'rgba(255,165,2,0.1)', color: '#ffa502' };
    return { bg: 'rgba(255,71,87,0.1)', color: '#ff4757' };
};

const DeliveryPanel = ({ orders, updateOrderStatus }) => {
    const activeDeliveries = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
    const delivered = orders.filter(o => o.status === 'Delivered');

    return (
        <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>Delivery Tracking</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Manage live deliveries and completed orders.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '16px', marginBottom: '28px' }}>
                {[
                    { label: 'Active Orders', value: activeDeliveries.length, color: '#ffa502' },
                    { label: 'Out for Delivery', value: orders.filter(o => o.status === 'Out for Delivery').length, color: '#1e90ff' },
                    { label: 'Delivered Today', value: delivered.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length, color: '#2ed573' },
                ].map(c => (
                    <div key={c.label} className="glass-panel" style={{ padding: '18px', borderLeft: `4px solid ${c.color}`, textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: c.color }}>{c.value}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{c.label}</div>
                    </div>
                ))}
            </div>

            <h4 style={{ fontWeight: 800, marginBottom: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>Active Deliveries</h4>
            {activeDeliveries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    <Truck size={40} style={{ marginBottom: '10px', opacity: 0.3 }} />
                    <p>No active deliveries right now.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '16px' }}>
                    {activeDeliveries.map(order => {
                        const sc = statusColor(order.status);
                        return (
                            <div key={order._id} style={{ background: 'var(--glass-accent)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '18px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ fontWeight: 800, color: 'var(--primary)' }}>#{order._id.slice(-6).toUpperCase()}</span>
                                    <span style={{ padding: '3px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, background: sc.bg, color: sc.color }}>{order.status}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                                    <MapPin size={14} color="var(--text-secondary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{order.shippingAddress?.address}, {order.shippingAddress?.city}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                    <Clock size={14} color="var(--text-secondary)" />
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span style={{ marginLeft: 'auto', fontWeight: 800 }}>₹{order.totalPrice.toFixed(2)}</span>
                                </div>
                                <select className="input-glass" value={order.status} onChange={e => updateOrderStatus(order._id, e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem' }}>
                                    <option value="Pending">Pending</option>
                                    <option value="Preparing">Preparing</option>
                                    <option value="Out for Delivery">Out for Delivery</option>
                                    <option value="Delivered">Delivered</option>
                                </select>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DeliveryPanel;
