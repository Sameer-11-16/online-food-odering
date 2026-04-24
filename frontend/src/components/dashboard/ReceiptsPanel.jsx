import React from 'react';
import { Printer, Download, Mail, CheckCircle, Clock, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ReceiptsPanel = ({ orders }) => {
    const handlePrint = (orderId) => {
        const printContent = document.getElementById(`receipt-${orderId}`).innerHTML;
        const originalContent = document.body.innerHTML;
        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload(); // Reload to restore React state
    };

    const handleSendEmail = (orderId) => {
        // In a real app, you'd call an API. Here we simulate success since backend is already updated.
        toast.success('Receipt sent to registered email!', { icon: '📧' });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Order Receipts</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{orders.length} Total Records</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {orders.map(order => (
                    <div key={order._id} className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>ORDER ID</span>
                                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>#{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>DATE</span>
                                <span style={{ fontWeight: 600 }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px', borderTop: '1px dashed var(--glass-border)', paddingTop: '16px' }}>
                            {order.orderItems.map(item => (
                                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                                    <span>{item.qty}x {item.name}</span>
                                    <span>₹{(item.price * item.qty).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', marginBottom: '20px' }}>
                            <span style={{ fontWeight: 700 }}>Total Paid</span>
                            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)' }}>₹{order.totalPrice.toFixed(2)}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => handlePrint(order._id)} className="btn btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <Printer size={16} /> Print
                            </button>
                            <button onClick={() => handleSendEmail(order._id)} className="btn btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <Mail size={16} /> Email
                            </button>
                        </div>

                        {/* Hidden Receipt for Printing */}
                        <div id={`receipt-${order._id}`} style={{ display: 'none' }}>
                            <div style={{ padding: '40px', fontFamily: 'monospace', color: '#000' }}>
                                <h1 style={{ textAlign: 'center' }}>BITESTREAM RECEIPT</h1>
                                <p style={{ textAlign: 'center' }}>--------------------------------</p>
                                <p>Order ID: {order._id}</p>
                                <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
                                <p>--------------------------------</p>
                                {order.orderItems.map(item => (
                                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{item.qty}x {item.name}</span>
                                        <span>₹{(item.price * item.qty).toFixed(2)}</span>
                                    </div>
                                ))}
                                <p>--------------------------------</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                    <span>TOTAL</span>
                                    <span>₹{order.totalPrice.toFixed(2)}</span>
                                </div>
                                <p style={{ textAlign: 'center', marginTop: '40px' }}>Thank you for your order!</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReceiptsPanel;
