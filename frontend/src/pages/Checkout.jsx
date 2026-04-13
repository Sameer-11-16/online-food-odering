import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';

// Stripe Official Universal Test Key for safe generic testing
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const Checkout = () => {
    const { cartItems, removeFromCart } = useCart();
    const { userInfo } = useAuth();
    const navigate = useNavigate();

    const [address, setAddress] = useState(userInfo?.address || '');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
    const [error, setError] = useState('');
    const [clientSecret, setClientSecret] = useState('');

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
            // Fetch Stripe client secret
            const fetchSecret = async () => {
                try {
                    const { data } = await axios.post('/api/stripe/create-payment-intent', {
                        items: cartItems,
                        totalPrice: total
                    });
                    setClientSecret(data.clientSecret);
                } catch (err) {
                    console.error("Failed to generate payment intent");
                }
            };
            fetchSecret();
        }
    }, [userInfo, cartItems, navigate, total]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            // Assume single restaurant in cart for simplicity
            const restaurantId = cartItems[0]?.restaurant || '60d5ec4967df2c2b143e2345'; // fallback but should exist!

            const formattedItems = cartItems.map(item => ({
                name: item.name,
                qty: item.qty,
                image: item.imageUrl || 'default',
                price: item.price,
                menuItem: item._id
            }));
            
            const reqBody = {
                orderItems: formattedItems,
                shippingAddress: { address, city, postalCode, country: 'US' },
                paymentMethod,
                totalPrice: total,
                restaurant: restaurantId // Mongoose ObjectId
            };

            await axios.post('/api/orders', reqBody, config);
            
            toast.success('Order Placed Successfully!', {
                icon: '🎉',
                duration: 5000,
            });

            // play sound
            new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3').play().catch(e => {});

            // Clear items (simplistic clone avoiding array mutation errors)
            const itemsToClear = [...cartItems];
            itemsToClear.forEach(item => removeFromCart(item._id));
            
            navigate('/profile');
            
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order');
        }
    };

    const handleStripeSuccess = async () => {
        // Since Stripe validation passed, we can submit the order directly.
        await submitHandler({ preventDefault: () => {} });
    };

    if (cartItems.length === 0) return null;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 0' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '30px' }}>Secure Checkout</h1>
            
            {error && <div style={{ background: 'rgba(255, 71, 87, 0.1)', padding: '12px', color: 'var(--primary)', borderRadius: '8px', marginBottom: '20px', fontWeight: 600 }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.5fr) 1fr', gap: '30px' }} className="profile-layout">
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Delivery Details</h2>
                    <form id="checkout-form" onSubmit={submitHandler}>
                        <div className="input-group">
                            <label className="input-label">Street Address</label>
                            <input type="text" className="input-glass" required value={address} onChange={e => setAddress(e.target.value)} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                                <option value="Credit Card (Demo)">Credit Card (Demo)</option>
                            </select>
                        </div>

                        {paymentMethod === 'Cash on Delivery' && (
                            <div style={{ marginTop: '30px' }}>
                                <button form="checkout-form" type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1.1rem' }}>
                                    Place Live Order
                                </button>
                            </div>
                        )}
                    </form>

                    {paymentMethod === 'Credit Card (Demo)' && clientSecret && (
                        <div style={{ marginTop: '30px' }}>
                            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                                <CheckoutForm amount={total} onSuccess={handleStripeSuccess} />
                            </Elements>
                        </div>
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
                    {paymentMethod === 'Credit Card (Demo)' && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginBottom: '16px' }}>Complete the payment form to the left to place order.</p>
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
