import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        const loadToast = toast.loading('Sending reset OTP...');
        try {
            await axios.post('/api/auth/forgot-password', { email });
            toast.success('Reset OTP sent to your email!', { id: loadToast });
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP', { id: loadToast });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        const loadToast = toast.loading('Resetting password...');
        try {
            await axios.post('/api/auth/reset-password', { email, otp, newPassword });
            toast.success('Password reset successful! Please login.', { id: loadToast });
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password', { id: loadToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 160px)' }}>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel" 
                style={{ width: '100%', maxWidth: '450px', padding: '40px' }}
            >
                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', textAlign: 'center' }}>Reset Password</h2>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '32px' }}>
                    {step === 1 ? "Enter your email to receive a reset code" : "Enter the code and your new password"}
                </p>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.form 
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleSendOTP}
                        >
                            <div className="input-group">
                                <label className="input-label">Email Address</label>
                                <input 
                                    type="email" 
                                    className="input-glass" 
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button disabled={loading} type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                                Send Reset Code
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form 
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleResetPassword}
                        >
                            <div className="input-group">
                                <label className="input-label">Reset Code (OTP)</label>
                                <input 
                                    type="text" 
                                    className="input-glass" 
                                    placeholder="Enter 6-digit code"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">New Password</label>
                                <input 
                                    type="password" 
                                    className="input-glass" 
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Confirm New Password</label>
                                <input 
                                    type="password" 
                                    className="input-glass" 
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button disabled={loading} type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                                Reset Password
                            </button>
                            <button type="button" onClick={() => setStep(1)} style={{ width: '100%', marginTop: '12px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}>
                                Back to Email
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Remember your password? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
