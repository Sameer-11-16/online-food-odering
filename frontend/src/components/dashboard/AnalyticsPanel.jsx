import { BarChart3, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const AnalyticsPanel = ({ orders, menuItems }) => {
    const totalRevenue = orders.reduce((a, o) => a + o.totalPrice, 0);
    const delivered = orders.filter(o => o.status === 'Delivered').length;
    const avgOrder = orders.length ? totalRevenue / orders.length : 0;

    // Revenue by day (last 7 days)
    const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toDateString();
    });
    const dayRevenue = last7.map(day => ({
        label: new Date(day).toLocaleDateString('en-IN', { weekday: 'short' }),
        value: orders.filter(o => new Date(o.createdAt).toDateString() === day).reduce((a, o) => a + o.totalPrice, 0)
    }));
    const maxRev = Math.max(...dayRevenue.map(d => d.value), 1);

    // Top menu items by order frequency
    const itemCount = {};
    orders.forEach(o => o.orderItems?.forEach(i => { itemCount[i.name] = (itemCount[i.name] || 0) + i.qty; }));
    const topItems = Object.entries(itemCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Payment method breakdown
    const methodBreak = {};
    orders.forEach(o => { methodBreak[o.paymentMethod] = (methodBreak[o.paymentMethod] || 0) + 1; });

    return (
        <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>Reports & Analytics</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Your restaurant's performance at a glance.</p>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '16px', marginBottom: '30px' }}>
                {[
                    { label: 'Total Revenue', value: `₹${totalRevenue.toFixed(0)}`, color: '#2ed573', icon: DollarSign },
                    { label: 'Total Orders', value: orders.length, color: '#1e90ff', icon: ShoppingBag },
                    { label: 'Avg Order Value', value: `₹${avgOrder.toFixed(0)}`, color: '#ffa502', icon: TrendingUp },
                    { label: 'Completion Rate', value: orders.length ? `${Math.round((delivered/orders.length)*100)}%` : '0%', color: '#a29bfe', icon: BarChart3 },
                ].map(c => (
                    <div key={c.label} className="glass-panel" style={{ padding: '20px', borderLeft: `4px solid ${c.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{c.label}</span>
                            <c.icon size={17} color={c.color} />
                        </div>
                        <div style={{ fontSize: '1.7rem', fontWeight: 800 }}>{c.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '24px' }}>
                {/* 7-Day Revenue Bar Chart */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h4 style={{ fontWeight: 800, marginBottom: '20px' }}>Revenue — Last 7 Days</h4>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '180px', padding: '10px 0' }}>
                        {dayRevenue.map((d, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: d.value > 0 ? 1 : 0.3 }}
                                    style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 800, position: 'absolute', top: '-25px' }}
                                >
                                    {d.value > 0 ? `₹${d.value.toFixed(0)}` : ''}
                                </motion.div>
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(d.value / maxRev) * 100}%` }}
                                    whileHover={{ scaleX: 1.1, filter: 'brightness(1.2)' }}
                                    style={{ 
                                        width: '100%', 
                                        background: 'linear-gradient(to top, var(--primary), #ff6b81)', 
                                        borderRadius: '8px 8px 0 0', 
                                        minHeight: d.value > 0 ? '6px' : '2px', 
                                        transition: 'height 1s cubic-bezier(0.17, 0.55, 0.55, 1), transform 0.2s ease', 
                                        boxShadow: d.value > 0 ? '0 4px 12px rgba(255, 71, 87, 0.2)' : 'none',
                                        cursor: 'pointer'
                                    }}
                                ></motion.div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, marginTop: '5px' }}>{d.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Selling Items */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h4 style={{ fontWeight: 800, marginBottom: '20px' }}>Top Selling Items</h4>
                    {topItems.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No orders yet.</p> : topItems.map(([name, qty], i) => (
                        <div key={name} style={{ marginBottom: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{i + 1}. {name}</span>
                                <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.88rem' }}>{qty} sold</span>
                            </div>
                            <div style={{ height: '6px', background: 'var(--glass-accent)', borderRadius: '3px' }}>
                                <div style={{ height: '100%', width: `${(qty / (topItems[0]?.[1] || 1)) * 100}%`, background: 'var(--primary)', borderRadius: '3px', transition: 'width 0.5s' }}></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Payment Breakdown */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h4 style={{ fontWeight: 800, marginBottom: '20px' }}>Payment Methods</h4>
                    {Object.entries(methodBreak).length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No data.</p> : Object.entries(methodBreak).map(([method, count]) => (
                        <div key={method} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--glass-accent)', borderRadius: '12px', marginBottom: '10px' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{method}</span>
                            <span style={{ fontWeight: 800, color: '#1e90ff' }}>{count} orders</span>
                        </div>
                    ))}
                </div>

                {/* Order Status Breakdown */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h4 style={{ fontWeight: 800, marginBottom: '20px' }}>Order Status</h4>
                    {['Pending', 'Preparing', 'Out for Delivery', 'Delivered'].map(status => {
                        const count = orders.filter(o => o.status === status).length;
                        const colors = { Pending: '#ff4757', Preparing: '#ffa502', 'Out for Delivery': '#1e90ff', Delivered: '#2ed573' };
                        return (
                            <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors[status] }}></div>
                                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{status}</span>
                                </div>
                                <span style={{ fontWeight: 800, color: colors[status] }}>{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPanel;
