import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const { cartItems, addToCart, removeFromCart, decreaseQty } = useCart();

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const taxes = subtotal * 0.08;
    const delivery = cartItems.length > 0 ? 3.99 : 0;
    const total = subtotal + taxes + delivery;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="responsive-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link to="/" style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 style={{ fontWeight: 800 }}>Your Cart</h1>
                </div>
            </div>

            {cartItems.length === 0 ? (
                <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '16px' }}>Your cart is empty</h3>
                    <Link to="/" className="btn btn-primary">Browse Restaurants</Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '30px' }}>
                    
                    <style>{`
                        @media (min-width: 992px) {
                            .cart-layout {
                                grid-template-columns: 1.5fr 1fr !important;
                            }
                        }
                    `}</style>

                    <div className="cart-layout" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
                        {/* Cart Items */}
                        <div className="glass-panel" style={{ padding: '24px' }}>
                            {cartItems.map((item, index) => (
                                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '16px 0', borderBottom: index < cartItems.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                                    <div style={{ flex: '1 1 200px' }}>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{item.name}</h4>
                                        <p style={{ color: 'var(--primary)', fontWeight: 700 }}>₹{item.price.toFixed(2)}</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px' }}>
                                            <button onClick={() => decreaseQty(item._id)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}>-</button>
                                            <span style={{ fontWeight: 600 }}>{item.qty}</span>
                                            <button onClick={() => addToCart(item)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}>+</button>
                                        </div>
                                        <button onClick={() => removeFromCart(item._id)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '8px' }}>
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px' }}>Order Summary</h3>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                                <span>Taxes (8%)</span>
                                <span>₹{taxes.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: 'var(--text-secondary)' }}>
                                <span>Delivery Fee</span>
                                <span>₹{delivery.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>Total</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>₹{total.toFixed(2)}</span>
                            </div>
                            
                            <Link to="/checkout" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '16px', fontSize: '1.1rem' }}>Proceed to Checkout</Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
