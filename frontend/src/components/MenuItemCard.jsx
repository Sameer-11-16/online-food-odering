import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MenuItemCard = ({ item }) => {
    const { addToCart, cartItems } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    const isInCart = cartItems.find(x => x._id === item._id);
    const qty = isInCart ? isInCart.qty : 0;

    const handleAdd = () => {
        addToCart(item);
        setIsAdded(true);
        toast.success(`${item.name} added to cart!`, {
            icon: '🍔',
            style: { borderRadius: '12px', background: '#1e222a', color: '#fff' }
        });
        setTimeout(() => setIsAdded(false), 1000);
    };

    return (
        <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glass-panel" 
            style={{ 
                display: 'flex', 
                gap: '16px', 
                padding: '16px', 
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Swiggy/Zomato style image container */}
            <div style={{ position: 'relative' }}>
                <div style={{ 
                    width: '120px', 
                    height: '120px', 
                    borderRadius: '20px', 
                    background: item.imageUrl ? `url(${item.imageUrl})` : 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)'
                }}>
                    {!item.imageUrl && <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>🍲</span>}
                </div>
                
                {/* Visual Add Button overlapping the image (Modern Spec) */}
                <div style={{ position: 'absolute', bottom: '-15px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                    <AnimatePresence mode="wait">
                        {isAdded ? (
                            <motion.button 
                                key="added"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                style={{ 
                                    background: 'var(--secondary)', 
                                    color: 'white', 
                                    border: 'none', 
                                    padding: '6px 20px', 
                                    borderRadius: '12px', 
                                    fontWeight: 800,
                                    boxShadow: '0 4px 15px rgba(46, 213, 115, 0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Check size={16} /> Added
                            </motion.button>
                        ) : (
                            <motion.button 
                                key="add"
                                whileTap={{ scale: 0.9 }}
                                onClick={handleAdd}
                                style={{ 
                                    background: 'var(--glass-bg)', 
                                    color: 'var(--primary)', 
                                    border: '1px solid var(--primary)', 
                                    padding: '6px 24px', 
                                    borderRadius: '12px', 
                                    fontWeight: 800,
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                    cursor: 'pointer',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                ADD {qty > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary)', color: 'white', width: '20px', height: '20px', borderRadius: '50%', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{qty}</span>}
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {/* Veg/NonVeg Marker mock */}
                        <div style={{ width: '12px', height: '12px', border: '1px solid var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', borderRadius: '2px' }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--secondary)' }}></div>
                        </div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.3px', margin: 0 }}>{item.name}</h4>
                    </div>
                </div>
                
                <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem', marginTop: '4px' }}>₹{item.price.toFixed(2)}</span>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                </p>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
                    <Info size={12} /> Customisable
                </div>
            </div>
        </motion.div>
    );
};

export default MenuItemCard;
