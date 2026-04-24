import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Printer } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const order = location.state?.order;

    useEffect(() => {
        toast.success('Payment Verified!');
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 160px)', padding: '20px' }}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel" 
                style={{ padding: '40px', maxWidth: '600px', width: '100%', background: 'var(--glass-bg)' }}
            >
                <div className="no-print" style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.2 }}
                        style={{ display: 'inline-flex', background: 'rgba(46, 213, 115, 0.1)', padding: '20px', borderRadius: '50%' }}
                    >
                        <CheckCircle size={60} color="var(--secondary)" />
                    </motion.div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '16px' }}>Order Confirmed!</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        Your payment was successful and your order has been sent to the kitchen.
                    </p>
                </div>

                {order && (
                    <div className="receipt-container" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '15px', padding: '20px', marginBottom: '30px' }}>
                        <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--glass-border)', paddingBottom: '15px', marginBottom: '15px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>BiteStream</h2>
                            <p style={{ margin: '5px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Order Receipt</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ID: {order._id}</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Date: {new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        
                        <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px dashed var(--glass-border)' }}>
                            <p style={{ margin: '0 0 5px', fontWeight: 700 }}>Delivery Address:</p>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                {order.shippingAddress?.address}, {order.shippingAddress?.city} - {order.shippingAddress?.postalCode}
                            </p>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        <th style={{ paddingBottom: '8px' }}>Item</th>
                                        <th style={{ paddingBottom: '8px', textAlign: 'center' }}>Qty</th>
                                        <th style={{ paddingBottom: '8px', textAlign: 'right' }}>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.orderItems?.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '8px 0', fontSize: '0.95rem' }}>{item.name}</td>
                                            <td style={{ padding: '8px 0', textAlign: 'center', fontSize: '0.95rem' }}>{item.qty}</td>
                                            <td style={{ padding: '8px 0', textAlign: 'right', fontSize: '0.95rem' }}>₹{(item.price * item.qty).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', fontWeight: 800, fontSize: '1.2rem' }}>
                            <span>Total Paid</span>
                            <span style={{ color: 'var(--secondary)' }}>₹{order.totalPrice?.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            <span>Payment Method</span>
                            <span>{order.paymentMethod}</span>
                        </div>
                    </div>
                )}

                <style dangerouslySetInnerHTML={{__html: `
                    @media print {
                        body * { visibility: hidden; }
                        .receipt-container, .receipt-container * { visibility: visible; }
                        .receipt-container { position: absolute; left: 0; top: 0; width: 100%; border: none !important; background: white !important; color: black !important; }
                        .no-print { display: none !important; }
                        * { color: black !important; border-color: #ddd !important; }
                    }
                `}} />

                <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {order && (
                        <button onClick={handlePrint} className="btn btn-secondary" style={{ padding: '14px', fontSize: '1rem', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                            <Printer size={18} /> Print Receipt
                        </button>
                    )}
                    <button onClick={() => navigate('/user-dashboard')} className="btn btn-primary" style={{ padding: '14px', fontSize: '1rem', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        Track My Order <ArrowRight size={18} />
                    </button>
                    <button onClick={() => navigate('/')} className="btn" style={{ padding: '14px', fontSize: '1rem', width: '100%', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-primary)' }}>
                        Back to Home
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentSuccess;
