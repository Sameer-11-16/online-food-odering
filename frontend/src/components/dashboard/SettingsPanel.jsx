import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, MapPin, Clock, Info } from 'lucide-react';

const SettingsPanel = ({ restaurant }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [message, setMessage] = useState('');

    const handleSave = (e) => {
        e.preventDefault();
        setMessage('Settings successfully updated!');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div style={{ padding: '0 10px', maxWidth: '800px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', fontWeight: 800 }}>Restaurant Settings</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Manage your public profile and operation status.</p>

            {message && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '12px', background: 'rgba(46, 213, 115, 0.1)', color: 'var(--secondary)', borderRadius: '12px', marginBottom: '24px', fontWeight: 600 }}>
                    {message}
                </motion.div>
            )}

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
                        <input type="text" className="input-glass" defaultValue={restaurant?.name} />
                    </div>
                    
                    <div className="input-group">
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14}/> Location Address</label>
                        <input type="text" className="input-glass" defaultValue={restaurant?.address} />
                    </div>

                    <div className="input-group">
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Info size={14}/> Public Description</label>
                        <textarea className="input-glass" rows="3" defaultValue={restaurant?.description}></textarea>
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

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }}>Save All Changes</button>
                </form>
            </div>
        </div>
    );
};

export default SettingsPanel;
