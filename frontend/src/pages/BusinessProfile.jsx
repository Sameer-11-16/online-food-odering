import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Store, MapPin, Camera, LogOut, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';

const BusinessProfile = () => {
    const { userInfo, logout } = useAuth();
    const { clearCart } = useCart();
    const navigate = useNavigate();

    const [restaurant, setRestaurant] = useState(null);
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchRest = async () => {
            try {
                const { data } = await axios.get('/api/restaurants');
                const myRest = data.find(r => r.owner === userInfo._id);
                if (myRest) {
                    setRestaurant(myRest);
                    setName(myRest.name);
                    setAddress(myRest.address);
                    setDescription(myRest.description);
                    setImageUrl(myRest.imageUrl);
                }
                setLoading(false);
            } catch (err) {
                toast.error('Failed to load profile');
                setLoading(false);
            }
        };
        fetchRest();
    }, [userInfo]);

    const handleLogout = () => {
        clearCart();
        logout();
        navigate('/');
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            const { data } = await axios.post('/api/upload', formData, config);
            setImageUrl(data);
            toast.success('Banner uploaded!');
            setUploading(false);
        } catch (error) {
            toast.error('Upload failed');
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const loadToast = toast.loading('Saving identity changes...');
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.put(`/api/restaurants/${restaurant._id}`, {
                name, address, description, imageUrl
            }, config);
            setRestaurant(data);
            toast.success('Business identity saved!', { id: loadToast });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Save failed', { id: loadToast });
        }
        setSaving(false);
    };

    if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading Identity...</div>;
    if (!restaurant) return <div style={{ padding: '60px', textAlign: 'center' }}>No restaurant profile found. Create one in the Dashboard.</div>;

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Business Identity Settings</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Identity
                    </button>
                    <button onClick={handleLogout} className="btn" style={{ background: 'rgba(255, 71, 87, 0.1)', color: 'var(--primary)', border: 'none' }}>
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </div>
            
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <div style={{ height: '300px', width: '100%', background: `url(${imageUrl}) center/cover`, position: 'relative' }}>
                    <div style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
                        <label className="btn btn-secondary" style={{ backdropFilter: 'blur(10px)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {uploading ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />} 
                            {uploading ? 'Uploading...' : 'Change Banner'}
                            <input type="file" hidden onChange={uploadFileHandler} />
                        </label>
                    </div>
                </div>
                
                <div style={{ padding: '40px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '30px' }}>
                        <div className="input-group">
                            <label className="input-label"><Store size={14} style={{ marginRight: '6px' }} /> Public Restaurant Name</label>
                            <input type="text" className="input-glass" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Skyline Sushi" />
                        </div>
                        
                        <div className="input-group">
                            <label className="input-label"><MapPin size={14} style={{ marginRight: '6px' }} /> Verified Business Address</label>
                            <input type="text" className="input-glass" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, City, pincode" />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginTop: '20px' }}>
                        <label className="input-label">Public Brand Description</label>
                        <textarea className="input-glass" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell your customers about your vibe and cuisine..."></textarea>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', marginTop: '30px' }}>
                        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', background: 'rgba(46, 213, 115, 0.05)' }}>
                            <h5 style={{ fontWeight: 800, color: 'var(--secondary)' }}>Average Rating</h5>
                            <p style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: '10px 0', fontWeight: 800 }}>⭐ {restaurant.rating}</p>
                        </div>
                        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', background: 'rgba(30, 144, 255, 0.05)' }}>
                            <h5 style={{ fontWeight: 800, color: '#1e90ff' }}>Total Reviews</h5>
                            <p style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: '10px 0', fontWeight: 800 }}>{restaurant.numReviews}</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default BusinessProfile;
