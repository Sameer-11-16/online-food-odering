import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

const AdminDashboard = () => {
    const { userInfo } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userInfo || userInfo.role !== 'admin') {
            navigate('/');
            return;
        }

        const fetchUsers = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get('/api/users', config);
                setUsers(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        
        fetchUsers();
    }, [userInfo, navigate]);

    if (loading) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '60px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '30px' }}>Platform Admin</h1>
            <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Users /> User Directory</h3>
                {users.map(u => (
                    <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                        <div>
                            <span style={{ fontWeight: 800 }}>{u.name}</span> <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>({u.email})</span>
                        </div>
                        <span style={{ padding: '4px 12px', background: 'var(--glass-accent-light)', color: 'var(--primary)', borderRadius: '12px', fontSize: '0.8rem', textTransform: 'capitalize', fontWeight: 600 }}>{u.role}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
