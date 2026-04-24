import { useState } from 'react';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const SecurityPanel = () => {
    const { userInfo } = useAuth();
    const [oldPw, setOldPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = async (e) => {
        e.preventDefault();
        if (newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
        if (newPw.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put('/api/auth/change-password', { oldPassword: oldPw, newPassword: newPw }, config);
            toast.success('Password changed successfully!');
            setOldPw(''); setNewPw(''); setConfirmPw('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        }
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: '600px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>Security Settings</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Manage your account security.</p>

            {/* Account Info */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <h4 style={{ fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={18} color="#a29bfe" /> Account Information</h4>
                <div style={{ display: 'grid', gap: '12px' }}>
                    {[
                        { label: 'Name', value: userInfo?.name },
                        { label: 'Email', value: userInfo?.email },
                        { label: 'Role', value: userInfo?.role?.replace('_', ' ') },
                    ].map(item => (
                        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--glass-accent)', borderRadius: '10px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.label}</span>
                            <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Change Password */}
            <div className="glass-panel" style={{ padding: '24px' }}>
                <h4 style={{ fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={18} color="var(--primary)" /> Change Password</h4>
                <form onSubmit={handleChange}>
                    {[
                        { label: 'Current Password', val: oldPw, set: setOldPw },
                        { label: 'New Password', val: newPw, set: setNewPw },
                        { label: 'Confirm New Password', val: confirmPw, set: setConfirmPw },
                    ].map(f => (
                        <div key={f.label} className="input-group">
                            <label className="input-label">{f.label}</label>
                            <div style={{ position: 'relative' }}>
                                <input type={show ? 'text' : 'password'} className="input-glass" required value={f.val} onChange={e => f.set(e.target.value)} style={{ paddingRight: '44px' }} />
                            </div>
                        </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', cursor: 'pointer' }} onClick={() => setShow(!show)}>
                        {show ? <EyeOff size={16} /> : <Eye size={16} />}
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{show ? 'Hide' : 'Show'} passwords</span>
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SecurityPanel;
