import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        const loadingToast = toast.loading('Signing you in...');
        try {
            const { data } = await axios.post('/api/auth/login', { email, password });
            login(data);
            toast.success(`Welcome back, ${data.name.split(' ')[0]}!`, { id: loadingToast });
            
            if (data.role === 'restaurant_owner') {
                navigate('/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid email or password';
            setError(msg);
            toast.error(msg, { id: loadingToast });
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 160px)' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', textAlign: 'center' }}>Welcome Back</h2>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '32px' }}>Sign in to continue to BiteStream</p>
                
                {error && <div style={{ background: 'rgba(255, 71, 87, 0.1)', color: 'var(--primary)', padding: '12px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{error}</div>}

                <form onSubmit={submitHandler}>
                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <input 
                            type="email" 
                            className="input-glass" 
                            placeholder="hello@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <label className="input-label">Password</label>
                            <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Forgot Password?</Link>
                        </div>
                        <input 
                            type="password" 
                            className="input-glass" 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>Sign In</button>
                </form>
                
                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create one</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
