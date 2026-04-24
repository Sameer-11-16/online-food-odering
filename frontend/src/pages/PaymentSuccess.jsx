import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Here you could verify the payment intent status if needed
        toast.success('Payment Verified!');
    }, []);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 160px)' }}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel" 
                style={{ padding: '60px', textAlign: 'center', maxWidth: '500px' }}
            >
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.2 }}
                    style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center' }}
                >
                    <div style={{ background: 'rgba(46, 213, 115, 0.1)', padding: '20px', borderRadius: '50%' }}>
                        <CheckCircle size={80} color="var(--secondary)" />
                    </div>
                </motion.div>

                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>Order Confirmed!</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '40px', lineHeight: 1.6 }}>
                    Your payment was successful and your order has been sent to the kitchen. Get ready for some delicious food!
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <button 
                        onClick={() => navigate('/user-dashboard')} 
                        className="btn btn-primary"
                        style={{ padding: '16px', fontSize: '1.1rem', width: '100%' }}
                    >
                        Track My Order <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                    </button>
                    <button 
                        onClick={() => navigate('/')} 
                        className="btn btn-secondary"
                        style={{ padding: '16px', fontSize: '1.1rem', width: '100%' }}
                    >
                        Back to Home
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentSuccess;
