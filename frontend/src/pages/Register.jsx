import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, UserPlus, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sendOtpLoading, setSendOtpLoading] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();
    const { login } = useAuth();

    const sendOtpHandler = async () => {
        if (!email) {
            toast.error('Please enter your email first');
            return;
        }
        setError('');
        setSendOtpLoading(true);
        try {
            await axios.post('/api/auth/send-otp', { email });
            setOtpSent(true);
            toast.success('OTP sent to your email!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setSendOtpLoading(false);
        }
    };

    const registerHandler = async (e) => {
        e.preventDefault();
        if (!otpSent) {
            toast.error('Please verify your email with OTP first');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const { data } = await axios.post('/api/auth/register', { 
                name, email, phone, password, role, otp
            });
            login(data);
            toast.success('Account created successfully!');
            if (role === 'restaurant_owner') {
                navigate('/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 160px)', padding: '40px 0' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '40px' }}>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px', textAlign: 'center' }}>
                    Join the Feast
                </h2>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '0.95rem' }}>
                    Create an account to start ordering your favorite meals
                </p>
                
                {error && <div style={{ background: 'rgba(255, 71, 87, 0.1)', color: 'var(--primary)', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{error}</div>}

                <form onSubmit={registerHandler}>
                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <input type="text" className="input-glass" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="input-group" style={{ marginBottom: '10px' }}>
                        <label className="input-label">Email Address</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="email" className="input-glass" placeholder="hello@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={otpSent} />
                            <button 
                                type="button" 
                                onClick={sendOtpHandler} 
                                disabled={sendOtpLoading || otpSent} 
                                className="btn btn-primary" 
                                style={{ padding: '0 15px', fontSize: '0.85rem', flexShrink: 0 }}
                            >
                                {sendOtpLoading ? '...' : otpSent ? 'Sent' : 'Send OTP'}
                            </button>
                        </div>
                    </div>

                    {otpSent && (
                        <div className="input-group" style={{ animation: 'fadeIn 0.5s ease' }}>
                            <label className="input-label">OTP Code</label>
                            <input type="text" className="input-glass" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                        </div>
                    )}

                    <div className="input-group">
                        <label className="input-label">Phone Number</label>
                        <input type="tel" className="input-glass" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input type="password" className="input-glass" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="input-group" style={{ position: 'relative' }}>
                        <label className="input-label">Account Type</label>
                        <select className="input-glass" style={{ appearance: 'none' }} value={role} onChange={(e) => setRole(e.target.value)} required>
                            <option value="customer">Hungry Customer</option>
                            <option value="restaurant_owner">Restaurant Owner</option>
                        </select>
                        <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '40px', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                    </div>
                    
                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        {loading ? 'Creating Account...' : <>Create Account <UserPlus size={18} /></>}
                    </button>
                </form>
                
                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;

