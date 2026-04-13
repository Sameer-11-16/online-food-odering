import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Smartphone, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';

const CustomerProfile = () => {
    const { userInfo, logout, login } = useAuth();
    const { clearCart } = useCart();
    const navigate = useNavigate();

    const [name, setName] = useState(userInfo?.name || '');
    const [phone, setPhone] = useState(userInfo?.phone || '');
    const [loading, setLoading] = useState(false);

    const handleLogout = () => {
        clearCart();
        logout();
        navigate('/');
    };

    const handleUpdate = async () => {
        setLoading(true);
        const loadToast = toast.loading('Saving profile changes...');
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.put('/api/users/profile', { name, phone }, config);
            login(data); // Sync local auth context
            toast.success('Profile updated successfully!', { id: loadToast });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed', { id: loadToast });
        }
        setLoading(false);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '30px' }}>My Account Settings</h1>
            
            <div className="glass-panel" style={{ padding: '40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                            <input type="text" className="input-glass" style={{ paddingLeft: '48px' }} value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                    </div>
                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input type="email" className="input-glass" style={{ paddingLeft: '48px', opacity: 0.6 }} value={userInfo?.email} disabled />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                    <div className="input-group">
                        <label className="input-label">Phone Number</label>
                        <div style={{ position: 'relative' }}>
                            <Smartphone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                            <input type="tel" className="input-glass" style={{ paddingLeft: '48px' }} value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                    </div>
                    <div className="input-group">
                        <label className="input-label">Security Tier</label>
                        <div style={{ position: 'relative' }}>
                            <Shield size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
                            <input type="text" className="input-glass" style={{ paddingLeft: '48px', opacity: 0.6 }} value="Standard Verified" disabled />
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <button className="btn btn-primary" onClick={handleUpdate} disabled={loading}>
                            {loading ? 'Saving...' : 'Update Profile'}
                        </button>
                    </div>
                    <button onClick={handleLogout} className="btn" style={{ background: 'rgba(255, 71, 87, 0.1)', color: 'var(--primary)', border: 'none' }}>
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </div>

            <div className="glass-panel" style={{ marginTop: '30px', padding: '24px', border: '1px solid var(--secondary)40' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Shield color="var(--secondary)" />
                    <div>
                        <h4 style={{ fontWeight: 700 }}>Security Verified</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Your account is protected with encrypted JWT authentication.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CustomerProfile;
