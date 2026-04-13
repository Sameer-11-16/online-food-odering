import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, Mail, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [role, setRole] = useState('customer');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();
    const { login } = useAuth();

    const sendOtpHandler = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post('/api/auth/send-otp', { email });
            setOtpSent(true);
            toast.success('OTP sent to your email!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const registerHandler = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await axios.post('/api/auth/register', { 
                name, email, phone, password, role, otp 
            });
            login(data);
            toast.success('Registration successful!');
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
                    {otpSent ? 'Verify Email' : 'Join the Feast'}
                </h2>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '0.95rem' }}>
                    {otpSent ? `Enter the 6-digit code sent to ${email}` : 'Create an account to start ordering your favorite meals'}
                </p>
                
                {error && <div style={{ background: 'rgba(255, 71, 87, 0.1)', color: 'var(--primary)', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{error}</div>}

                {!otpSent ? (
                    <form onSubmit={sendOtpHandler}>
                        <div className="input-group">
                            <label className="input-label">Full Name</label>
                            <input type="text" className="input-glass" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Email Address</label>
                            <input type="email" className="input-glass" placeholder="hello@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
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
                            {loading ? 'Sending...' : <>Send Verification Code <Mail size={18} /></>}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={registerHandler}>
                        <div className="input-group">
                            <label className="input-label">One-Time Password (OTP)</label>
                            <input 
                                type="text" 
                                className="input-glass" 
                                placeholder="123456" 
                                value={otp} 
                                onChange={(e) => setOtp(e.target.value)} 
                                required 
                                maxLength="6"
                                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', fontWeight: 800 }}
                            />
                        </div>
                        
                        <button type="submit" disabled={loading} className="btn btn-secondary" style={{ width: '100%', marginTop: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                            {loading ? 'Verifying...' : <>Complete Registration <ArrowRight size={18} /></>}
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={() => setOtpSent(false)} 
                            style={{ 
                                background: 'none', border: 'none', color: 'var(--text-secondary)', 
                                width: '100%', marginTop: '16px', cursor: 'pointer', fontSize: '0.85rem' 
                            }}
                        >
                            Change Email Address
                        </button>
                    </form>
                )}
                
                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
