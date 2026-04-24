import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Users, CreditCard, DollarSign, ShoppingBag, Store, CheckCircle, Clock, AlertTriangle, Trash2, RefreshCw } from 'lucide-react';

const AdminDashboard = () => {
    const { userInfo } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [dateFilter, setDateFilter] = useState('all');

    useEffect(() => {
        if (!userInfo || userInfo.role !== 'admin') { navigate('/'); return; }
        fetchAll();
    }, [userInfo, navigate]);

    const fetchAll = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const [usersRes, ordersRes, restRes] = await Promise.all([
                axios.get('/api/users', config),
                axios.get('/api/orders', config),
                axios.get('/api/restaurants'),
            ]);
            setUsers(usersRes.data);
            setOrders(ordersRes.data);
            setRestaurants(restRes.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.delete(`/api/users/${userId}`, config);
            setUsers(users.filter(u => u._id !== userId));
            toast.success('User deleted');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleVerifyUpi = async (orderId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`/api/orders/${orderId}/verify-upi`, {}, config);
            toast.success('UPI Payment Verified!');
            fetchAll();
        } catch (err) {
            toast.error('Verification failed');
        }
    };

    // Date filtering
    const filteredOrders = orders.filter(o => {
        if (dateFilter === 'all') return true;
        const created = new Date(o.createdAt);
        const now = new Date();
        if (dateFilter === 'today') return created.toDateString() === now.toDateString();
        if (dateFilter === 'week') return (now - created) < 7 * 24 * 60 * 60 * 1000;
        if (dateFilter === 'month') return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        return true;
    });

    const pendingUpi = orders.filter(o => o.paymentMethod === 'Manual UPI' && !o.isPaid);
    const totalRevenue = filteredOrders.reduce((acc, o) => acc + o.totalPrice, 0);
    const platformFee = totalRevenue * 0.10;
    const delivered = filteredOrders.filter(o => o.status === 'Delivered').length;
    const pending = filteredOrders.filter(o => o.status === 'Pending').length;

    const TabBtn = ({ id, icon: Icon, label, badge }) => (
        <button onClick={() => setActiveTab(id)} style={{
            padding: '10px 18px', borderRadius: '12px', border: 'none',
            background: activeTab === id ? 'var(--primary)' : 'var(--glass-accent)',
            color: activeTab === id ? 'white' : 'var(--text-primary)',
            cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', transition: 'all 0.2s'
        }}>
            <Icon size={16} /> {label}
            {badge > 0 && <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ff4757', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{badge}</span>}
        </button>
    );

    const statusColor = (s) => {
        if (s === 'Delivered') return { bg: 'rgba(46,213,115,0.1)', color: '#2ed573' };
        if (s === 'Preparing') return { bg: 'rgba(255,165,2,0.1)', color: '#ffa502' };
        if (s === 'Out for Delivery') return { bg: 'rgba(30,144,255,0.1)', color: '#1e90ff' };
        return { bg: 'rgba(255,71,87,0.1)', color: '#ff4757' };
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading Administration Suite...</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Master Control</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Global platform oversight and financial auditing.</p>
                </div>
                <button onClick={fetchAll} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--glass-accent)', cursor: 'pointer', fontWeight: 600 }}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* Tab Nav */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <TabBtn id="overview" icon={DollarSign} label="Overview" />
                <TabBtn id="upi" icon={AlertTriangle} label="UPI Verification" badge={pendingUpi.length} />
                <TabBtn id="orders" icon={ShoppingBag} label="All Orders" />
                <TabBtn id="users" icon={Users} label="Users" />
                <TabBtn id="restaurants" icon={Store} label="Restaurants" />
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        {[
                            { label: 'Gross Revenue', value: `₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: DollarSign, color: '#2ed573', border: '#2ed573' },
                            { label: 'Platform Commission (10%)', value: `₹${platformFee.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: CreditCard, color: '#ff4757', border: '#ff4757' },
                            { label: 'Total Orders', value: filteredOrders.length, icon: ShoppingBag, color: '#1e90ff', border: '#1e90ff' },
                            { label: 'Delivered', value: delivered, icon: CheckCircle, color: '#2ed573', border: '#2ed573' },
                            { label: 'Pending', value: pending, icon: Clock, color: '#ffa502', border: '#ffa502' },
                            { label: 'Registered Users', value: users.length, icon: Users, color: '#a29bfe', border: '#a29bfe' },
                            { label: 'Restaurants', value: restaurants.length, icon: Store, color: '#fd79a8', border: '#fd79a8' },
                            { label: 'Pending UPI', value: pendingUpi.length, icon: AlertTriangle, color: '#ff4757', border: '#ff4757' },
                        ].map(card => (
                            <div key={card.label} className="glass-panel" style={{ padding: '20px', borderLeft: `4px solid ${card.border}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{card.label}</span>
                                    <card.icon size={18} color={card.color} />
                                </div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{card.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Date Filter */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        {['all', 'today', 'week', 'month'].map(f => (
                            <button key={f} onClick={() => setDateFilter(f)} style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', background: dateFilter === f ? 'var(--primary)' : 'var(--glass-accent)', color: dateFilter === f ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize' }}>{f}</button>
                        ))}
                    </div>

                    {/* Quick Transaction Preview */}
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h3 style={{ marginBottom: '16px', fontWeight: 800 }}>Recent Transactions</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--glass-border)' }}>
                                        {['ORDER', 'CUSTOMER', 'RESTAURANT', 'AMOUNT', 'METHOD', 'DATE', 'STATUS'].map(h => (
                                            <th key={h} style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.slice(0, 10).map(order => {
                                        const sc = statusColor(order.status);
                                        return (
                                            <tr key={order._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>#{order._id.slice(-6).toUpperCase()}</div>
                                                    {order.paymentResult?.id && <div style={{ fontSize: '0.65rem', color: '#2ed573' }}>TXN: {order.paymentResult.id.slice(0, 12)}...</div>}
                                                </td>
                                                <td style={{ padding: '12px' }}>{order.user?.name || 'N/A'}</td>
                                                <td style={{ padding: '12px' }}>{order.restaurant?.name || 'N/A'}</td>
                                                <td style={{ padding: '12px', fontWeight: 800 }}>₹{order.totalPrice.toFixed(2)}</td>
                                                <td style={{ padding: '12px', fontSize: '0.8rem' }}>{order.paymentMethod}</td>
                                                <td style={{ padding: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <span style={{ padding: '3px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, background: sc.bg, color: sc.color }}>{order.status}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* UPI VERIFICATION TAB */}
            {activeTab === 'upi' && (
                <motion.div key="upi" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="glass-panel" style={{ padding: '30px' }}>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <AlertTriangle color="#ffa502" /> Manual UPI — Pending Verification
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>Check your bank app, match the UTR number, then click Verify to confirm.</p>
                        {pendingUpi.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                <CheckCircle size={40} color="#2ed573" style={{ marginBottom: '10px' }} />
                                <p>All UPI payments are verified! No pending orders.</p>
                            </div>
                        ) : pendingUpi.map(order => (
                            <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '20px', background: 'rgba(255,165,2,0.05)', border: '1px solid rgba(255,165,2,0.3)', borderRadius: '16px', marginBottom: '12px' }}>
                                <div>
                                    <div style={{ fontWeight: 800, marginBottom: '4px' }}>Order #{order._id.slice(-6).toUpperCase()} — <span style={{ color: '#2ed573' }}>₹{order.totalPrice.toFixed(2)}</span></div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Customer: {order.user?.name} | {new Date(order.createdAt).toLocaleString('en-IN')}</div>
                                    <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>UTR / Ref: <strong style={{ color: '#ffa502', letterSpacing: '1px' }}>{order.paymentResult?.id || 'N/A'}</strong></div>
                                </div>
                                <button onClick={() => handleVerifyUpi(order._id)} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: '#2ed573', color: 'white', cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CheckCircle size={16} /> Mark Verified
                                </button>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* ALL ORDERS TAB */}
            {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        {['all', 'today', 'week', 'month'].map(f => (
                            <button key={f} onClick={() => setDateFilter(f)} style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', background: dateFilter === f ? 'var(--primary)' : 'var(--glass-accent)', color: dateFilter === f ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize' }}>{f}</button>
                        ))}
                        <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)', alignSelf: 'center', fontSize: '0.9rem' }}>{filteredOrders.length} orders</span>
                    </div>
                    <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--glass-border)' }}>
                                    {['ORDER ID', 'CUSTOMER', 'RESTAURANT', 'AMOUNT', 'METHOD', 'DATE', 'PAID', 'STATUS'].map(h => (
                                        <th key={h} style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => {
                                    const sc = statusColor(order.status);
                                    return (
                                        <tr key={order._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ fontWeight: 700 }}>#{order._id.slice(-6).toUpperCase()}</div>
                                                {order.paymentResult?.id && <div style={{ fontSize: '0.62rem', color: '#2ed573' }}>TXN: {order.paymentResult.id}</div>}
                                            </td>
                                            <td style={{ padding: '12px' }}>{order.user?.name || 'N/A'}</td>
                                            <td style={{ padding: '12px' }}>{order.restaurant?.name || 'N/A'}</td>
                                            <td style={{ padding: '12px', fontWeight: 800 }}>₹{order.totalPrice.toFixed(2)}</td>
                                            <td style={{ padding: '12px', fontSize: '0.8rem' }}>{order.paymentMethod}</td>
                                            <td style={{ padding: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ padding: '3px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, background: order.isPaid ? 'rgba(46,213,115,0.1)' : 'rgba(255,71,87,0.1)', color: order.isPaid ? '#2ed573' : '#ff4757' }}>{order.isPaid ? 'Paid' : 'Unpaid'}</span>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ padding: '3px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, background: sc.bg, color: sc.color }}>{order.status}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
                <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="glass-panel" style={{ padding: '30px' }}>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px' }}>Platform User Directory ({users.length})</h3>
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {users.map(u => (
                                <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'var(--glass-accent)', borderRadius: '16px', border: '1px solid var(--glass-border)', flexWrap: 'wrap', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: u.role === 'admin' ? 'var(--primary)' : u.role === 'restaurant_owner' ? '#ffa502' : 'var(--secondary)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}>
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800 }}>{u.name}</div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{u.email}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ padding: '4px 12px', background: u.role === 'admin' ? 'rgba(255,71,87,0.1)' : u.role === 'restaurant_owner' ? 'rgba(255,165,2,0.1)' : 'rgba(46,213,115,0.1)', color: u.role === 'admin' ? '#ff4757' : u.role === 'restaurant_owner' ? '#ffa502' : '#2ed573', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'capitalize' }}>{u.role.replace('_', ' ')}</span>
                                        {u.role !== 'admin' && (
                                            <button onClick={() => handleDeleteUser(u._id, u.name)} style={{ padding: '8px', borderRadius: '10px', border: 'none', background: 'rgba(255,71,87,0.1)', color: '#ff4757', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* RESTAURANTS TAB */}
            {activeTab === 'restaurants' && (
                <motion.div key="restaurants" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="glass-panel" style={{ padding: '30px' }}>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px' }}>Registered Restaurants ({restaurants.length})</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                            {restaurants.map(r => {
                                const restOrders = orders.filter(o => o.restaurant?._id === r._id || o.restaurant === r._id);
                                const restRevenue = restOrders.reduce((acc, o) => acc + o.totalPrice, 0);
                                return (
                                    <div key={r._id} style={{ background: 'var(--glass-accent)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '20px' }}>
                                        {r.imageUrl && <div style={{ height: '120px', borderRadius: '12px', backgroundImage: `url(${r.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: '16px' }}></div>}
                                        <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '6px' }}>{r.name}</h4>
                                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{r.address}</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <div style={{ background: 'var(--glass-bg)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2ed573' }}>₹{restRevenue.toFixed(0)}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Total Revenue</div>
                                            </div>
                                            <div style={{ background: 'var(--glass-bg)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e90ff' }}>{restOrders.length}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Orders</div>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            UPI: <strong style={{ color: r.upiId ? '#2ed573' : '#ff4757' }}>{r.upiId || 'Not configured'}</strong>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                            Rating: <strong>⭐ {r.rating?.toFixed(1) || '—'}</strong> ({r.numReviews} reviews)
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default AdminDashboard;
