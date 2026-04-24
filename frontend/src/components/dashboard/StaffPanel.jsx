import { useState } from 'react';
import { UserCircle, Plus, Trash2 } from 'lucide-react';

const ROLES = ['Chef', 'Cashier', 'Delivery Boy', 'Waiter', 'Manager'];

const StaffPanel = () => {
    const [staff, setStaff] = useState([
        { id: 1, name: 'Ramesh Kumar', role: 'Chef', phone: '9876543210', shift: 'Morning' },
        { id: 2, name: 'Priya Singh', role: 'Cashier', phone: '9123456780', shift: 'Evening' },
    ]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', role: 'Chef', phone: '', shift: 'Morning' });

    const addStaff = (e) => {
        e.preventDefault();
        if (!form.name || !form.phone) return;
        setStaff(s => [...s, { ...form, id: Date.now() }]);
        setForm({ name: '', role: 'Chef', phone: '', shift: 'Morning' });
        setShowForm(false);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '4px' }}>Staff Management</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>{staff.length} team members registered.</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={16} /> {showForm ? 'Cancel' : 'Add Staff'}
                </button>
            </div>

            {showForm && (
                <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', border: '1px solid var(--primary)' }}>
                    <form onSubmit={addStaff}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px' }}>
                            <div className="input-group">
                                <label className="input-label">Full Name</label>
                                <input type="text" className="input-glass" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Amit Sharma" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Phone</label>
                                <input type="tel" className="input-glass" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="10-digit number" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Role</label>
                                <select className="input-glass" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                                    {ROLES.map(r => <option key={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Shift</label>
                                <select className="input-glass" value={form.shift} onChange={e => setForm(f => ({ ...f, shift: e.target.value }))}>
                                    {['Morning', 'Evening', 'Night', 'Full Day'].map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>Save Staff Member</button>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
                {staff.map(s => (
                    <div key={s.id} style={{ background: 'var(--glass-accent)', border: '1px solid var(--glass-border)', borderRadius: '18px', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 800, fontSize: '1.2rem', flexShrink: 0 }}>{s.name.charAt(0)}</div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>{s.name}</div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>📱 {s.phone}</div>
                                </div>
                            </div>
                            <button onClick={() => setStaff(staff.filter(m => m.id !== s.id))} style={{ background: 'rgba(255,71,87,0.1)', border: 'none', color: '#ff4757', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}>
                                <Trash2 size={15} />
                            </button>
                        </div>
                        <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ padding: '4px 12px', background: 'rgba(30,144,255,0.1)', color: '#1e90ff', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>{s.role}</span>
                            <span style={{ padding: '4px 12px', background: 'rgba(46,213,115,0.1)', color: '#2ed573', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>{s.shift} Shift</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StaffPanel;
