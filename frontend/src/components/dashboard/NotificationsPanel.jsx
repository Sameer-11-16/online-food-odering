import { useState } from 'react';
import { Bell, Package, Calendar, Star } from 'lucide-react';

const NotificationsPanel = ({ orders, reservations }) => {
    const [filter, setFilter] = useState('all');

    const notifications = [
        ...orders.map(o => ({
            id: o._id, type: 'order', time: o.createdAt,
            title: `New Order #${o._id.slice(-6).toUpperCase()}`,
            desc: `${o.user?.name || 'Customer'} ordered ₹${o.totalPrice.toFixed(2)}`,
            icon: Package, color: '#1e90ff',
        })),
        ...reservations.map(r => ({
            id: r._id, type: 'reservation', time: r.createdAt || r.date,
            title: `Table Booking — ${r.guests} guests`,
            desc: `${r.guestName || r.user?.name || 'Guest'} on ${r.date} at ${r.time}`,
            icon: Calendar, color: '#a29bfe',
        })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time));

    const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);

    return (
        <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>Notifications</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>All recent activity across your restaurant.</p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {['all', 'order', 'reservation'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', background: filter === f ? 'var(--primary)' : 'var(--glass-accent)', color: filter === f ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize' }}>{f}</button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                    <Bell size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                    <p>No notifications yet.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {filtered.map(n => (
                        <div key={n.id + n.type} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', background: 'var(--glass-accent)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ padding: '10px', borderRadius: '12px', background: `${n.color}15`, flexShrink: 0 }}>
                                <n.icon size={20} color={n.color} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700 }}>{n.title}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{n.desc}</div>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                {new Date(n.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}<br />
                                <span>{new Date(n.time).toLocaleDateString('en-IN')}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsPanel;
