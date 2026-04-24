import { useState } from 'react';
import { Box, CheckCircle, XCircle } from 'lucide-react';

const InventoryPanel = ({ menuItems }) => {
    const [stock, setStock] = useState(() => {
        const s = {};
        menuItems.forEach(i => { s[i._id] = true; });
        return s;
    });

    const categories = [...new Set(menuItems.map(i => i.category || 'Other'))];
    const inStock = Object.values(stock).filter(Boolean).length;

    return (
        <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>Inventory Control</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Toggle item availability in real-time.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '16px', marginBottom: '30px' }}>
                {[
                    { label: 'Total Items', value: menuItems.length, color: '#1e90ff' },
                    { label: 'In Stock', value: inStock, color: '#2ed573' },
                    { label: 'Out of Stock', value: menuItems.length - inStock, color: '#ff4757' },
                ].map(c => (
                    <div key={c.label} className="glass-panel" style={{ padding: '18px', borderLeft: `4px solid ${c.color}`, textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: c.color }}>{c.value}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{c.label}</div>
                    </div>
                ))}
            </div>

            {categories.map(cat => (
                <div key={cat} style={{ marginBottom: '28px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{cat}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {menuItems.filter(i => (i.category || 'Other') === cat).map(item => (
                            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'var(--glass-accent)', borderRadius: '14px', border: `1px solid ${stock[item._id] ? 'var(--glass-border)' : 'rgba(255,71,87,0.3)'}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {stock[item._id] ? <CheckCircle size={18} color="#2ed573" /> : <XCircle size={18} color="#ff4757" />}
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{item.name}</div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>₹{item.price?.toFixed(2)}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setStock(s => ({ ...s, [item._id]: !s[item._id] }))}
                                    style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', background: stock[item._id] ? 'rgba(255,71,87,0.1)' : 'rgba(46,213,115,0.1)', color: stock[item._id] ? '#ff4757' : '#2ed573', transition: 'all 0.2s' }}
                                >
                                    {stock[item._id] ? 'Mark Out' : 'Mark Available'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {menuItems.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                    <Box size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                    <p>No menu items yet. Add items in Menu Management.</p>
                </div>
            )}
        </div>
    );
};

export default InventoryPanel;
