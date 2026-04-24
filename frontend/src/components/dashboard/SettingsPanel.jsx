import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, MapPin, Clock, Info, CreditCard, Navigation } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import useGeoLocation from '../../hooks/useGeoLocation';

const SettingsPanel = ({ restaurant, userInfo, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [name, setName] = useState(restaurant?.name || '');
    const [address, setAddress] = useState(restaurant?.address || '');
    const [description, setDescription] = useState(restaurant?.description || '');
    const [upiId, setUpiId] = useState(restaurant?.upiId || '');
    const [loading, setLoading] = useState(false);
    const [pinningLocation, setPinningLocation] = useState(false);
    const [savedLocation, setSavedLocation] = useState(restaurant?.location || null);
    const userGeo = useGeoLocation();

    const handlePinLocation = async () => {
        if (!userGeo.lat) { toast.error('Location access denied. Please allow location in browser.'); return; }
        setPinningLocation(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`/api/restaurants/${restaurant._id}`, {
                location: { lat: userGeo.lat, lng: userGeo.lng }
            }, config);
            setSavedLocation({ lat: userGeo.lat, lng: userGeo.lng });
            toast.success('Restaurant location pinned! Customers can now see distance.');
        } catch (err) {
            toast.error('Failed to save location');
        }
        setPinningLocation(false);
    };


    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.put(`/api/restaurants/${restaurant._id}`, {
                name, address, description, upiId
            }, config);
            
            toast.success('Restaurant settings updated!');
            if (onUpdate) onUpdate(data);
        } catch (error) {
            toast.error('Failed to update settings');
        }
        setLoading(false);
    };


    return (
        <div style={{ padding: '0 10px', maxWidth: '800px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', fontWeight: 800 }}>Restaurant Settings</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Manage your public profile and operation status.</p>




            <div className="glass-panel" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--glass-border)' }}>
                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Live Status</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Accepting new online orders</p>
                    </div>
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        style={{ 
                            background: isOpen ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 71, 87, 0.1)', 
                            color: isOpen ? 'var(--secondary)' : 'var(--primary)', 
                            border: `1px solid ${isOpen ? 'var(--secondary)' : 'var(--primary)'}`,
                            padding: '10px 24px', 
                            borderRadius: '30px', 
                            fontWeight: 800, 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.3s'
                        }}
                    >
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }} />
                        {isOpen ? 'Open for Orders' : 'Currently Closed'}
                    </button>
                </div>

                <form onSubmit={handleSave}>
                    <div className="input-group">
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Store size={14}/> Restaurant Name</label>
                        <input type="text" className="input-glass" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    
                    <div className="input-group">
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14}/> Location Address</label>
                        <input type="text" className="input-glass" value={address} onChange={e => setAddress(e.target.value)} />
                    </div>

                    <div className="input-group" style={{ background: 'var(--glass-accent)', padding: '20px', borderRadius: '15px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}><Navigation size={14}/> GPS Coordinates</label>
                            {savedLocation?.lat ? (
                                <p style={{ fontSize: '0.85rem', color: '#2ed573', fontWeight: 600 }}>Pinned: {savedLocation.lat.toFixed(4)}, {savedLocation.lng.toFixed(4)}</p>
                            ) : (
                                <p style={{ fontSize: '0.85rem', color: '#ff4757', fontWeight: 600 }}>Not set — customers cannot see distance</p>
                            )}
                        </div>
                        <button type="button" onClick={handlePinLocation} disabled={pinningLocation} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Navigation size={14} /> {pinningLocation ? 'Pinning...' : (savedLocation?.lat ? 'Update Location' : 'Pin My Location')}
                        </button>
                    </div>


                    <div className="input-group">
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Info size={14}/> Public Description</label>
                        <textarea className="input-glass" rows="3" value={description} onChange={e => setDescription(e.target.value)}></textarea>
                    </div>

                    <div className="input-group" style={{ background: 'rgba(46, 213, 115, 0.05)', padding: '20px', borderRadius: '15px', border: '1px dashed var(--secondary)' }}>
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--secondary)' }}><CreditCard size={14}/> Personal UPI ID (for Direct Payments)</label>
                        <input type="text" className="input-glass" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="e.g. yourname@upi" />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>This ID will be used to generate the QR code for customers at checkout.</p>
                    </div>


                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="input-group">
                            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14}/> Opening Time</label>
                            <input type="time" className="input-glass" defaultValue="10:00" />
                        </div>
                        <div className="input-group">
                            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14}/> Closing Time</label>
                            <input type="time" className="input-glass" defaultValue="22:00" />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginTop: '20px' }}>
                        <label className="input-label">Banner Image URL (Optional)</label>
                        <input type="text" className="input-glass" defaultValue={restaurant?.imageUrl} placeholder="https://..." />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '20px' }}>
                        {loading ? 'Saving...' : 'Save All Changes'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default SettingsPanel;
