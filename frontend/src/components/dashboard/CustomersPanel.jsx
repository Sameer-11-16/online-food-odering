import { Users, ShoppingBag, TrendingUp } from 'lucide-react';

const CustomersPanel = ({ orders }) => {
    // Derive unique customers from orders
    const customerMap = {};
    orders.forEach(o => {
        if (!o.user) return;
        const id = o.user._id || o.user;
        if (!customerMap[id]) {
            customerMap[id] = { name: o.user.name || 'Unknown', email: o.user.email || '', orders: 0, spent: 0, last: o.createdAt };
        }
        customerMap[id].orders += 1;
        customerMap[id].spent += o.totalPrice;
        if (new Date(o.createdAt) > new Date(customerMap[id].last)) customerMap[id].last = o.createdAt;
    });

    const customers = Object.values(customerMap).sort((a, b) => b.spent - a.spent);

    return (
        <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>Customer Insights</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Customers who ordered from your restaurant.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '16px', marginBottom: '28px' }}>
                {[
                    { label: 'Unique Customers', value: customers.length, color: '#a29bfe', icon: Users },
                    { label: 'Total Orders', value: orders.length, color: '#1e90ff', icon: ShoppingBag },
                    { label: 'Avg Order Value', value: customers.length ? `₹${(orders.reduce((a,o)=>a+o.totalPrice,0)/orders.length).toFixed(0)}` : '₹0', color: '#2ed573', icon: TrendingUp },
                ].map(c => (
                    <div key={c.label} className="glass-panel" style={{ padding: '18px', borderLeft: `4px solid ${c.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{c.label}</span>
                            <c.icon size={16} color={c.color} />
                        </div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{c.value}</div>
                    </div>
                ))}
            </div>

            {customers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                    <Users size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                    <p>No customers yet. Orders will appear here.</p>
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--glass-border)' }}>
                                {['CUSTOMER', 'ORDERS', 'TOTAL SPENT', 'LAST ORDER'].map(h => (
                                    <th key={h} style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((c, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '14px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 800, flexShrink: 0 }}>{c.name.charAt(0).toUpperCase()}</div>
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{c.name}</div>
                                                {i === 0 && <span style={{ fontSize: '0.7rem', background: 'rgba(255,165,2,0.15)', color: '#ffa502', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>TOP SPENDER</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px', fontWeight: 700 }}>{c.orders}</td>
                                    <td style={{ padding: '14px', fontWeight: 800, color: '#2ed573' }}>₹{c.spent.toFixed(2)}</td>
                                    <td style={{ padding: '14px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{new Date(c.last).toLocaleDateString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CustomersPanel;
