import { useState } from 'react';
import { Tag, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const OffersPanel = ({ menuItems }) => {
    const [offers, setOffers] = useState([
        { id: 1, code: 'WELCOME10', discount: 10, type: 'percent', minOrder: 100, active: true },
        { id: 2, code: 'FLAT50', discount: 50, type: 'flat', minOrder: 300, active: false },
    ]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ code: '', discount: '', type: 'percent', minOrder: '' });

    const addOffer = (e) => {
        e.preventDefault();
        if (!form.code || !form.discount) return;
        setOffers(o => [...o, { ...form, id: Date.now(), discount: Number(form.discount), minOrder: Number(form.minOrder), active: true }]);
        setForm({ code: '', discount: '', type: 'percent', minOrder: '' });
        setShowForm(false);
        toast.success('Offer created!');
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '4px' }}>Offers & Discounts</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Create promo codes for your customers.</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={16} /> {showForm ? 'Cancel' : 'New Offer'}
                </button>
            </div>

            {showForm && (
                <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', border: '1px solid var(--secondary)' }}>
                    <form onSubmit={addOffer}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '16px' }}>
                            <div className="input-group">
                                <label className="input-label">Promo Code</label>
                                <input type="text" className="input-glass" required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. SAVE20" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Discount</label>
                                <input type="number" className="input-glass" required value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} placeholder="Amount or %" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Type</label>
                                <select className="input-glass" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                                    <option value="percent">Percentage (%)</option>
                                    <option value="flat">Flat Amount (₹)</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Min. Order (₹)</label>
                                <input type="number" className="input-glass" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))} placeholder="0 = no minimum" />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-secondary" style={{ marginTop: '16px' }}>Create Offer</button>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
                {offers.map(o => (
                    <div key={o.id} style={{ background: 'var(--glass-accent)', border: `1px solid ${o.active ? 'var(--secondary)' : 'var(--glass-border)'}`, borderRadius: '18px', padding: '20px', opacity: o.active ? 1 : 0.6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Tag size={18} color={o.active ? 'var(--secondary)' : 'var(--text-secondary)'} />
                                <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '1px', color: o.active ? 'var(--secondary)' : 'var(--text-primary)' }}>{o.code}</span>
                            </div>
                            <button onClick={() => setOffers(offers.filter(x => x.id !== o.id))} style={{ background: 'rgba(255,71,87,0.1)', border: 'none', color: '#ff4757', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>
                            {o.type === 'percent' ? `${o.discount}% OFF` : `₹${o.discount} OFF`}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                            Min. order: ₹{o.minOrder || 0}
                        </div>
                        <button onClick={() => setOffers(offers.map(x => x.id === o.id ? { ...x, active: !x.active } : x))} style={{ width: '100%', padding: '8px', borderRadius: '10px', border: 'none', background: o.active ? 'rgba(255,71,87,0.1)' : 'rgba(46,213,115,0.1)', color: o.active ? '#ff4757' : '#2ed573', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                            {o.active ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OffersPanel;
