import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Checkout = () => {
    const { cartItems, removeFromCart } = useCart();
    const { userInfo } = useAuth();
    const navigate = useNavigate();

    const [address, setAddress] = useState(userInfo?.address || '');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
    const [utrNumber, setUtrNumber] = useState('');
    const [showUpiModal, setShowUpiModal] = useState(false);
    const [restaurantDetails, setRestaurantDetails] = useState(null);
    const [error, setError] = useState('');



    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const taxes = subtotal * 0.08;
    const delivery = cartItems.length > 0 ? 3.99 : 0;
    const total = subtotal + taxes + delivery;

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
        } else if (cartItems.length === 0) {
            navigate('/cart');
        } else {
            const fetchRestaurant = async () => {
                try {
                    const { data } = await axios.get(`/api/restaurants/${cartItems[0].restaurant}`);
                    setRestaurantDetails(data);
                } catch (err) {
                    console.error("Failed to load restaurant details for payment");
                }
            };
            fetchRestaurant();
        }
    }, [userInfo, cartItems, navigate]);


    // Load Razorpay Script
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const submitHandler = async (e) => {
        if (e) e.preventDefault();
        setError('');
        
        if (paymentMethod === 'Online Payment (UPI/Card)') {
            handleRazorpayPayment();
            return;
        }

        if (paymentMethod === 'Direct UPI (Scan & Pay)') {
            setShowUpiModal(true);
            return;
        }

        placeOrder();

    };

    const handleUpiSubmit = () => {
        const upiToUse = restaurantDetails?.upiId || import.meta.env.VITE_UPI_ID;
        if (!upiToUse) {
            toast.error('Payment failed: Restaurant has not set up a UPI ID yet.');
            return;
        }
        if (utrNumber.length < 12) {
            toast.error('Please enter a valid 12-digit UTR/Transaction ID');
            return;
        }
        setShowUpiModal(false);
        placeOrder({ id: utrNumber, status: 'Verification Pending' });
    };


    const placeOrder = async (paymentDetails = null) => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const restaurantId = cartItems[0]?.restaurant;

            const formattedItems = cartItems.map(item => ({
                name: item.name,
                qty: item.qty,
                image: item.imageUrl || 'default',
                price: item.price,
                menuItem: item._id
            }));
            
            const reqBody = {
                orderItems: formattedItems,
                shippingAddress: { address, city, postalCode, country: 'IN' },
                paymentMethod: paymentDetails?.status === 'Verification Pending' ? 'Manual UPI' : (paymentDetails ? 'Razorpay Online' : 'Cash on Delivery'),
                totalPrice: total,
                restaurant: restaurantId,
                paymentResult: paymentDetails ? {
                    id: paymentDetails.id || paymentDetails.razorpay_payment_id,
                    status: paymentDetails.status || 'succeeded',
                    update_time: new Date().toISOString(),
                } : null
            };



            const { data: orderResponse } = await axios.post('/api/orders', reqBody, config);
            
            toast.success('Order Placed Successfully!', { icon: '🎉' });
            new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3').play().catch(() => {});

            cartItems.forEach(item => removeFromCart(item._id));
            navigate('/payment-success', { state: { order: orderResponse } });
            
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order');
        }
    };

    const handleRazorpayPayment = async () => {
        const res = await loadRazorpay();
        if (!res) {
            toast.error('Razorpay SDK failed to load. Are you online?');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            // 0. Fetch Razorpay Key
            const { data: sdkKey } = await axios.get('/api/razorpay/config');
            
            // 1. Create order on backend
            const { data: order } = await axios.post('/api/razorpay/order', { amount: total }, config);

            // 2. Open Razorpay Modal
            const options = {
                key: sdkKey,
                amount: order.amount,
                currency: order.currency,
                name: "BiteStream Food",
                description: "Complete your delicious order",
                order_id: order.id,
                handler: async (response) => {
                    // 3. Verify Payment and Place Order
                    try {
                        await axios.post('/api/razorpay/verify', response, config);
                        placeOrder(response);
                    } catch (err) {
                        toast.error("Payment verification failed!");
                    }
                },
                prefill: {
                    name: userInfo.name,
                    email: userInfo.email,
                    contact: userInfo.phone || ""
                },
                theme: { color: "#ff4757" }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (err) {
            toast.error("Error initiating payment");
        }
    };


    if (cartItems.length === 0) return null;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
            <div className="responsive-header">
                <h1 style={{ fontWeight: 800 }}>Secure Checkout</h1>
                <Link to="/cart" style={{ color: 'var(--primary)', fontWeight: 600 }}>Modify Cart</Link>
            </div>
            
            {error && <div style={{ background: 'rgba(255, 71, 87, 0.1)', padding: '12px', color: 'var(--primary)', borderRadius: '8px', marginBottom: '20px', fontWeight: 600 }}>{error}</div>}

            <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
                <style>{`
                    @media (min-width: 992px) {
                        .checkout-grid {
                            grid-template-columns: 1.5fr 1fr !important;
                        }
                    }
                `}</style>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Delivery Details</h2>
                    <form id="checkout-form" onSubmit={submitHandler}>
                        <div className="input-group">
                            <label className="input-label">Street Address</label>
                            <input type="text" className="input-glass" required value={address} onChange={e => setAddress(e.target.value)} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            <div className="input-group">
                                <label className="input-label">City</label>
                                <input type="text" className="input-glass" required value={city} onChange={e => setCity(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Postal Code</label>
                                <input type="text" className="input-glass" required value={postalCode} onChange={e => setPostalCode(e.target.value)} />
                            </div>
                        </div>
                        
                        <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '20px' }}>Payment Method</h2>
                        <div className="input-group">
                            <select className="input-glass" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                                <option value="Cash on Delivery">Cash on Delivery</option>
                                <option value="Online Payment (UPI/Card)">Online Payment (UPI/Card)</option>
                                <option value="Direct UPI (Scan & Pay)">Direct UPI (Scan & Pay) - 0% Fee</option>
                            </select>
                        </div>

                        <div style={{ marginTop: '30px' }}>
                            <button form="checkout-form" type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1.1rem' }}>
                                {paymentMethod === 'Cash on Delivery' ? 'Place Order (COD)' : 'Proceed to Payment'}
                            </button>
                        </div>
                    </form>

                    {/* Manual UPI Modal */}
                    {showUpiModal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-panel" style={{ padding: '30px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                                <h3 style={{ marginBottom: '20px' }}>Scan & Pay with Any App</h3>
                                <div style={{ background: 'white', padding: '15px', borderRadius: '15px', display: 'inline-block', marginBottom: '20px' }}>
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                                            `upi://pay?pa=${restaurantDetails?.upiId || import.meta.env.VITE_UPI_ID}&pn=${encodeURIComponent(restaurantDetails?.name || 'BiteStream')}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Food Order')}&tr=${Date.now()}`
                                        )}`} 
                                        alt="UPI QR" 
                                        style={{ width: '220px', height: '220px' }} 
                                    />
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                                    Pay <strong>₹{total.toFixed(2)}</strong> to <strong>{restaurantDetails?.name || 'Admin'}</strong><br/>
                                    <span 
                                        onClick={() => {
                                            navigator.clipboard.writeText(restaurantDetails?.upiId || import.meta.env.VITE_UPI_ID);
                                            toast.success('UPI ID copied to clipboard!');
                                        }}
                                        style={{ fontSize: '0.75rem', opacity: 0.7, cursor: 'pointer', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', marginTop: '5px', display: 'inline-block' }}
                                    >
                                        ID: {restaurantDetails?.upiId || import.meta.env.VITE_UPI_ID} 📋
                                    </span>
                                </p>                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                    <a 
                                        href={`upi://pay?pa=${restaurantDetails?.upiId || import.meta.env.VITE_UPI_ID}&pn=${encodeURIComponent(restaurantDetails?.name || 'BiteStream')}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Food Order')}&tr=${Date.now()}`}
                                        className="btn btn-primary"
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#1e90ff' }}
                                    >
                                        🚀 Open UPI App
                                    </a>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Clicking above will open your installed UPI apps (GPay, PhonePe, etc.)</p>
                                </div>
                                <div className="input-group" style={{ textAlign: 'left' }}>
                                    <label className="input-label">Enter 12-Digit UTR / Ref Number</label>
                                    <input type="text" className="input-glass" placeholder="Example: 3042XXXXXXXX" value={utrNumber} onChange={e => setUtrNumber(e.target.value)} maxLength={12} />
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                    <button onClick={handleUpiSubmit} className="btn btn-primary" style={{ flex: 1 }}>Submit UTR</button>
                                    <button onClick={() => setShowUpiModal(false)} className="btn btn-secondary">Cancel</button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </div>



                <div className="glass-panel" style={{ padding: '30px', height: 'fit-content' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Order Summary</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px' }}>
                        {cartItems.map(item => (
                            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span>{item.qty}x {item.name}</span>
                                <span style={{ fontWeight: 600 }}>₹{(item.price * item.qty).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <span>Taxes</span><span>₹{taxes.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <span>Delivery</span><span>₹{delivery.toFixed(2)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem', marginBottom: '24px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                        <span>Total:</span>
                        <span style={{ color: 'var(--primary)' }}>₹{total.toFixed(2)}</span>
                    </div>
                    {paymentMethod === 'Cash on Delivery' && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginBottom: '16px' }}>You will pay in cash upon delivery.</p>
                    )}
                    {paymentMethod === 'Online Payment (UPI/Card)' && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginBottom: '16px' }}>Pay securely via UPI, Cards, or NetBanking.</p>
                    )}
                    {paymentMethod === 'Direct UPI (Scan & Pay)' && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginBottom: '16px' }}>Scan QR and enter UTR for 0% processing fee.</p>
                    )}


                    <Link to="/cart" style={{ display: 'block', textAlign: 'center', marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Return to Cart
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default Checkout;
