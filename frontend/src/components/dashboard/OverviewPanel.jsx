import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-panel" style={{ padding: '12px 16px', border: '1px solid var(--primary)40', fontSize: '0.85rem', backdropFilter: 'blur(20px)' }}>
                <p style={{ fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color || entry.fill }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{entry.name}:</span>
                        <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                            {entry.name.includes('Revenue') ? `₹${entry.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const OverviewPanel = ({ orders = [], menuItems = [] }) => {
    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
    const completedOrders = orders.filter(o => o.status === 'Delivered').length;
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString('en-US', { weekday: 'short' });
    }).reverse();

    const analyticsData = last7Days.map((day) => {
        const dayOrders = orders.filter(o => new Date(o.createdAt).toLocaleDateString('en-US', { weekday: 'short' }) === day);
        const dailyTotal = dayOrders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
        
        return {
            name: day,
            revenue: dailyTotal,
            orders: dayOrders.length
        };
    });

    const categoryStats = menuItems.reduce((acc, item) => {
        const cat = item.category || 'Other';
        const count = orders.filter(o => o.orderItems.some(oi => oi.name === item.name)).length;
        const existing = acc.find(a => a.name === cat);
        if (existing) existing.val += count;
        else acc.push({ name: cat, val: count });
        return acc;
    }, []).sort((a, b) => b.val - a.val).slice(0, 4);

    const statusData = [
        { name: 'Completed', value: completedOrders, color: '#2ed573' },
        { name: 'Pending', value: orders.length - completedOrders, color: '#ffa502' }
    ];

    const StatsCard = ({ title, value, icon: Icon, color, delay }) => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} style={{ background: 'var(--glass-accent)', padding: '24px', borderRadius: '16px', border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: `${color}20`, padding: '16px', borderRadius: '14px', color: color }}><Icon size={28} /></div>
            <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 600 }}>{title}</p>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{value}</h3>
            </div>
        </motion.div>
    );

    return (
        <div style={{ padding: '0 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Business Command Insights</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(46, 213, 115, 0.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid #2ed57340' }}>
                    <div className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ed573' }}></div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2ed573', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Connection Stable</span>
                </div>
            </div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ position: 'absolute', top: '10%', left: '50%', width: '300px', height: '300px', background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)', opacity: 0.05, filter: 'blur(50px)', pointerEvents: 'none', zIndex: -1 }}></div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <StatsCard title="Gross Earnings" value={`₹${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={DollarSign} color="#2ed573" delay={0.1} />
                    <StatsCard title="Live Orders" value={orders.length} icon={ShoppingBag} color="#1e90ff" delay={0.2} />
                    <StatsCard title="Menu Items" value={menuItems.length} icon={TrendingUp} color="#ff4757" delay={0.3} />
                    <StatsCard title="Fulfillments" value={completedOrders} icon={Users} color="#ffa502" delay={0.4} />
                </div>

                <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    <style>{`
                        @media (min-width: 1200px) {
                            .charts-grid {
                                grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) !important;
                            }
                        }
                    `}</style>
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="glass-panel" style={{ padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Sales vs Order Volume</h3>
                            <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} /> Revenue</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1e90ff' }} /> Orders</span>
                            </div>
                        </div>
                        <div style={{ height: '350px', width: '100%' }}>
                            <ResponsiveContainer>
                                <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/><stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/></linearGradient>
                                        <linearGradient id="colorOrd" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1e90ff" stopOpacity={0.4}/><stop offset="95%" stopColor="#1e90ff" stopOpacity={0}/></linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" stroke="#57606f" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
                                    <YAxis yId="left" stroke="#57606f" axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v.toLocaleString()}`} />
                                    <YAxis yId="right" orientation="right" stroke="#57606f" axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area yId="left" type="monotone" name="Revenue" dataKey="revenue" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                                    <Area yId="right" type="monotone" name="Orders" dataKey="orders" stroke="#1e90ff" strokeWidth={4} fillOpacity={1} fill="url(#colorOrd)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} className="glass-panel" style={{ padding: '24px', flex: 1 }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', fontWeight: 700 }}>Popular Categories</h3>
                            <div style={{ height: '220px', width: '100%' }}>
                                <ResponsiveContainer>
                                    <BarChart data={categoryStats}>
                                        <XAxis dataKey="name" hide />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="val" name="Orders" fill="#2ed573" radius={[8, 8, 8, 8]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }} className="glass-panel" style={{ padding: '24px', flex: 1 }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', fontWeight: 700 }}>Fulfillment Rate</h3>
                            <div style={{ height: '180px', width: '100%' }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {statusData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewPanel;
