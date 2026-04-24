import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../socket';
import { Utensils, Package, Calendar, Settings, Activity, ChefHat, CreditCard, Box, Users, BarChart3, Tag, Bell, Truck, UserCircle, Star, Shield, LogOut, FileText } from 'lucide-react';
import OverviewPanel from '../components/dashboard/OverviewPanel';
import KitchenPanel from '../components/dashboard/KitchenPanel';
import SettingsPanel from '../components/dashboard/SettingsPanel';
import InventoryPanel from '../components/dashboard/InventoryPanel';
import CustomersPanel from '../components/dashboard/CustomersPanel';
import AnalyticsPanel from '../components/dashboard/AnalyticsPanel';
import OffersPanel from '../components/dashboard/OffersPanel';
import NotificationsPanel from '../components/dashboard/NotificationsPanel';
import DeliveryPanel from '../components/dashboard/DeliveryPanel';
import StaffPanel from '../components/dashboard/StaffPanel';
import ReviewsPanel from '../components/dashboard/ReviewsPanel';
import SecurityPanel from '../components/dashboard/SecurityPanel';
import ReceiptsPanel from '../components/dashboard/ReceiptsPanel';
import API_BASE_URL from '../apiConfig';

const BusinessDashboard = () => {

    const { userInfo, logout } = useAuth();
    const navigate = useNavigate();
    
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Create Restaurant State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [image, setImage] = useState('');
    const [uploading, setUploading] = useState(false);
    
    // Create Menu Item State
    const [menuItems, setMenuItems] = useState([]);
    const [itemMenuName, setItemMenuName] = useState('');
    const [itemDesc, setItemDesc] = useState('');
    const [itemPrice, setItemPrice] = useState('');
    const [itemCategory, setItemCategory] = useState('Main');
    const [itemImage, setItemImage] = useState('');
    const [itemFoodType, setItemFoodType] = useState('Veg');
    const [uploadingMenu, setUploadingMenu] = useState(false);
    const [editingItem, setEditingItem] = useState(null);


    // Orders and Reservations
    const [orders, setOrders] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [manualBookingForm, setManualBookingForm] = useState(false);
    const [manualResName, setManualResName] = useState('');
    const [manualResPhone, setManualResPhone] = useState('');
    const [manualResDate, setManualResDate] = useState('');
    const [manualResTime, setManualResTime] = useState('');
    const [manualResGuests, setManualResGuests] = useState(2);
    const [manualResRequests, setManualResRequests] = useState('');

    useEffect(() => {
        if (!userInfo || userInfo.role !== 'restaurant_owner') {
            navigate('/');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                
                const { data } = await axios.get('/api/restaurants');
                const myRest = data.find(r => r.owner === userInfo._id);
                setRestaurant(myRest);
                
                if (myRest) {
                    if (activeTab === 'orders') {
                        const { data: orderData } = await axios.get(`/api/orders/restaurant/${myRest._id}`, config);
                        setOrders(orderData);
                    } else if (activeTab === 'reservations') {
                        const { data: resData } = await axios.get(`/api/reservations/restaurant/${myRest._id}`, config);
                        setReservations(resData);
                    } else if (activeTab === 'menu') {
                        const { data: menuData } = await axios.get(`/api/restaurants/${myRest._id}/menu`);
                        setMenuItems(menuData);
                    } else if (activeTab === 'receipts') {
                        const { data: orderData } = await axios.get(`/api/orders/restaurant/${myRest._id}`, config);
                        setOrders(orderData);
                    }
                }
                
                setLoading(false);
            } catch (error) {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [userInfo, navigate, activeTab]);

    useEffect(() => {
        if (restaurant) {
            socket.emit('join', restaurant._id);

            socket.on('newOrder', (order) => {
                toast.success('New Order Received!', {
                    icon: '🍕',
                    duration: 6000,
                    position: 'top-right',
                    style: { background: 'var(--primary)', color: 'white', fontWeight: 'bold', border: '2px solid white' }
                });
                if (activeTab === 'orders') setOrders(prevOrders => [order, ...prevOrders]);
                new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3').play().catch(e => {});
            });

            socket.on('newReservation', (res) => {
                toast.success('New Table Booking!', {
                    icon: '📅',
                    duration: 6000,
                    position: 'top-right',
                    style: { background: 'var(--secondary)', color: 'white', fontWeight: 'bold', border: '2px solid white' }
                });
                if (activeTab === 'reservations') setReservations(prevRes => [res, ...prevRes]);
                new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3').play().catch(e => {});
            });

            return () => {
                socket.off('newOrder');
                socket.off('newReservation');
            };
        }
    }, [restaurant, activeTab]);

    const uploadFileHandler = async (e, type) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        if (type === 'restaurant') setUploading(true);
        else setUploadingMenu(true);

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            const { data } = await axios.post('/api/upload', formData, config);
            
            if (type === 'restaurant') {
                setImage(data);
                setUploading(false);
            } else {
                setItemImage(data);
                setUploadingMenu(false);
            }
        } catch (error) {
            if (type === 'restaurant') setUploading(false);
            else setUploadingMenu(false);
        }
    };

    const handleCreateRestaurant = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.post('/api/restaurants', {
                name, description, address, imageUrl: image
            }, config);
            setRestaurant(data);
            toast.success('Restaurant profile created successfully!');
        } catch (error) {
            toast.error('Failed to create restaurant profile.');
        }
    };

    const handleAddMenuItem = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            if (editingItem) {
                await axios.put(`/api/restaurants/${restaurant._id}/menu/${editingItem}`, {
                    name: itemMenuName, description: itemDesc, price: Number(itemPrice), category: itemCategory, imageUrl: itemImage, foodType: itemFoodType
                }, config);
                toast.success(`${itemMenuName} updated!`);
                setEditingItem(null);
            } else {
                await axios.post(`/api/restaurants/${restaurant._id}/menu`, {
                    name: itemMenuName, description: itemDesc, price: Number(itemPrice), category: itemCategory, imageUrl: itemImage, foodType: itemFoodType
                }, config);
                toast.success(`${itemMenuName} added to menu!`);
            }
            
            setItemMenuName(''); setItemDesc(''); setItemPrice(''); setItemImage(''); setItemFoodType('Veg');
            const { data: menuData } = await axios.get(`/api/restaurants/${restaurant._id}/menu`);
            setMenuItems(menuData);
        } catch (error) {
            toast.error('Failed to save menu item.');
        }
    };

    const handleEditMenuItem = (item) => {
        setEditingItem(item._id);
        setItemMenuName(item.name);
        setItemDesc(item.description);
        setItemPrice(item.price);
        setItemCategory(item.category || 'Main');
        setItemImage(item.imageUrl || '');
        setItemFoodType(item.foodType || 'Veg');
    };


    const handleDeleteMenuItem = async (menuId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.delete(`/api/restaurants/${restaurant._id}/menu/${menuId}`, config);
            setMenuItems(menuItems.filter(i => i._id !== menuId));
            toast.success('Item deleted from menu');
        } catch (error) {
            toast.error('Failed to delete item');
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`/api/orders/${orderId}/status`, { status: newStatus }, config);
            const { data: orderData } = await axios.get(`/api/orders/restaurant/${restaurant._id}`, config);
            setOrders(orderData);
            toast.success(`Order status updated to ${newStatus}`);
        } catch (err) {
            toast.error('Failed to update order status');
        }
    };

    const updateReservationStatus = async (resId, newStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`/api/reservations/${resId}/status`, { status: newStatus }, config);
            const { data: resData } = await axios.get(`/api/reservations/restaurant/${restaurant._id}`, config);
            setReservations(resData);
            toast.success('Reservation status updated');
        } catch (err) {
            toast.error('Failed to update reservation');
        }
    };

    const handleManualBooking = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post('/api/reservations', {
                restaurant: restaurant._id,
                date: manualResDate,
                time: manualResTime,
                guests: manualResGuests,
                specialRequests: manualResRequests,
                guestName: manualResName,
                guestPhone: manualResPhone,
                isOffline: true
            }, config);
            
            toast.success('Offline booking created!');
            setManualBookingForm(false);
            setManualResName(''); setManualResPhone(''); setManualResDate(''); setManualResTime('');
            
            // Refresh reservations
            const { data: resData } = await axios.get(`/api/reservations/restaurant/${restaurant._id}`, config);
            setReservations(resData);
        } catch (error) {
            toast.error('Failed to create offline booking');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading Dashboard...</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', paddingBottom: '60px' }}>
            <h1 style={{ fontSize: 'min(2.5rem, 8vw)', fontWeight: 800, marginBottom: '30px', padding: '0 20px' }}>Business Command Center</h1>

            {!restaurant ? (
                <div className="glass-panel" style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Step 1: Set up your Restaurant Profile</h2>
                    <form onSubmit={handleCreateRestaurant}>
                        <div className="input-group">
                            <label className="input-label">Restaurant Name</label>
                            <input type="text" className="input-glass" required value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Description</label>
                            <textarea className="input-glass" required rows="3" value={description} onChange={e => setDescription(e.target.value)}></textarea>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Location / Address</label>
                            <input type="text" className="input-glass" required value={address} onChange={e => setAddress(e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Restaurant Banner Image</label>
                            <input type="file" className="input-glass" onChange={(e) => uploadFileHandler(e, 'restaurant')} />
                            {uploading && <span style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginTop: '4px', display: 'block' }}>Uploading server image...</span>}
                            {image && <div style={{ marginTop: '10px', height: '100px', width: '200px', backgroundImage: `url(${image.startsWith('http') ? image : API_BASE_URL + image})`, backgroundSize: 'cover', borderRadius: '12px' }}></div>}
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Profile and Launch</button>
                    </form>
                </div>
            ) : (
                <div className="dashboard-layout" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: '30px', 
                    padding: '0 20px' 
                }}>
                    
                    <style>{`
                        @media (min-width: 992px) {
                            .dashboard-layout {
                                grid-template-columns: 280px 1fr !important;
                            }
                            .sidebar-sticky {
                                position: sticky !important;
                                top: 100px;
                                height: calc(100vh - 140px);
                            }
                        }
                        @media (max-width: 991px) {
                            .sidebar-sticky {
                                flex-direction: row !important;
                                overflow-x: auto;
                                padding: 10px 15px !important;
                                white-space: nowrap;
                            }
                            .sidebar-sticky > div:first-child,
                            .sidebar-sticky > div.section-title {
                                display: none !important;
                            }
                            .sidebar-sticky button {
                                width: auto !important;
                                flex: 0 0 auto;
                            }
                        }
                    `}</style>
                    
                    {/* 15-Point Sidebar Navigation (Responsive) */}
                    <div className="glass-panel sidebar-sticky" style={{ 
                        padding: '24px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '8px', 
                        overflowY: 'auto' 
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--glass-border)' }}>
                            {restaurant.imageUrl && <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundImage: `url(${restaurant.imageUrl.startsWith('http') ? restaurant.imageUrl : API_BASE_URL + restaurant.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}></div>}
                            <div style={{ overflow: 'hidden' }}>
                                <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 800, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{restaurant.name}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8.5rem', marginTop: '2px' }}>Admin / Owner</p>
                            </div>
                        </div>

                        {/* Helper component for Sidebar buttons */}
                        {(() => {
                            const TabBtn = ({ id, icon: Icon, label }) => (
                                <button onClick={() => setActiveTab(id)} style={{ padding: '12px 16px', borderRadius: '12px', border: 'none', background: activeTab === id ? 'var(--primary)' : 'transparent', color: activeTab === id ? 'white' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', textAlign: 'left', width: '100%' }}>
                                    <Icon size={18} style={{ opacity: activeTab === id ? 1 : 0.6 }} /> <span>{label}</span>
                                </button>
                            );
                            return (
                                <>
                                    <div className="section-title" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '10px', marginBottom: '6px', paddingLeft: '8px' }}>Operations</div>
                                    <TabBtn id="overview" icon={Activity} label="1. Dashboard" />
                                    <TabBtn id="menu" icon={Utensils} label="2. Menu Management" />
                                    <TabBtn id="orders" icon={Package} label="3. Order Management" />
                                    <TabBtn id="kitchen" icon={ChefHat} label="4. Kitchen Panel" />
                                    <TabBtn id="billing" icon={CreditCard} label="5. Payment & Billing" />
                                    
                                    <div className="section-title" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '20px', marginBottom: '6px', paddingLeft: '8px' }}>Management</div>
                                    <TabBtn id="inventory" icon={Box} label="6. Inventory" />
                                    <TabBtn id="customers" icon={Users} label="7. Customers" />
                                    <TabBtn id="analytics" icon={BarChart3} label="8. Reports & Analytics" />
                                    <TabBtn id="offers" icon={Tag} label="9. Offers & Discounts" />
                                    <TabBtn id="notifications" icon={Bell} label="10. Notifications" />

                                    <div className="section-title" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '20px', marginBottom: '6px', paddingLeft: '8px' }}>Administration</div>
                                    <TabBtn id="settings" icon={Settings} label="11. Settings" />
                                    <TabBtn id="delivery" icon={Truck} label="12. Delivery" />
                                    <TabBtn id="staff" icon={UserCircle} label="13. Staff" />
                                    <TabBtn id="reviews" icon={Star} label="14. Reviews" />
                                    <TabBtn id="receipts" icon={FileText} label="15. Receipts" />
                                    <TabBtn id="security" icon={Shield} label="16. Security" />
                                </>
                            );
                        })()}

                        {/* Logout at bottom of sidebar */}
                        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
                            <button onClick={() => { logout(); navigate('/'); }} style={{ padding: '12px 16px', borderRadius: '12px', border: 'none', background: 'rgba(255, 71, 87, 0.1)', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', textAlign: 'left', width: '100%' }}>
                                <LogOut size={18} /> <span>Sign Out</span>
                            </button>
                        </div>
                    </div>

                    {/* Main Workspace Area */}
                    <div className="glass-panel" style={{ padding: '40px', minHeight: '600px', border: 'none', background: 'transparent' }}>
                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' && (
                                <motion.div key="overview" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                    <OverviewPanel orders={orders} menuItems={menuItems} />
                                </motion.div>
                            )}

                            {activeTab === 'kitchen' && (
                                <motion.div key="kitchen" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                    <KitchenPanel orders={orders} updateOrderStatus={updateOrderStatus} />
                                </motion.div>
                            )}

                             {activeTab === 'settings' && (
                                 <motion.div key="settings" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                     <SettingsPanel 
                                         restaurant={restaurant} 
                                         userInfo={userInfo} 
                                         onUpdate={(data) => setRestaurant(data)} 
                                     />
                                 </motion.div>
                             )}

                            
                             {activeTab === 'billing' && (
                                 <motion.div key="billing" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                     <div className="glass-panel" style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
                                         <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                             <div style={{ padding: '12px', background: 'rgba(46, 213, 115, 0.1)', borderRadius: '12px' }}>
                                                 <CreditCard size={28} color="var(--secondary)" />
                                             </div>
                                             <div>
                                                 <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Payment & Payout Settings</h2>
                                                 <p style={{ color: 'var(--text-secondary)' }}>Configure how you receive money from customers.</p>
                                             </div>
                                         </div>

                                         <div style={{ background: 'rgba(46, 213, 115, 0.05)', border: '1px solid var(--secondary)', padding: '25px', borderRadius: '20px', marginBottom: '30px' }}>
                                             <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '10px' }}>Direct UPI Payment (Free)</h3>
                                             <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>Enter your UPI ID below to enable the "Scan & Pay" option at checkout. This allows you to receive 100% of the order value directly to your bank account with zero platform fees.</p>
                                             
                                             <div className="input-group">
                                                 <label className="input-label">Your UPI ID (e.g. name@okicici)</label>
                                                 <div style={{ display: 'flex', gap: '10px' }}>
                                                     <input 
                                                         type="text" 
                                                         className="input-glass" 
                                                         value={restaurant.upiId || ''} 
                                                         onChange={(e) => setRestaurant({...restaurant, upiId: e.target.value})}
                                                         placeholder="Enter your UPI ID"
                                                     />
                                                     <button 
                                                         onClick={async () => {
                                                             try {
                                                                 const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                                                                 await axios.put(`/api/restaurants/${restaurant._id}`, { upiId: restaurant.upiId }, config);
                                                                 toast.success('UPI ID Saved Successfully!');
                                                             } catch (err) {
                                                                 toast.error('Failed to save UPI ID');
                                                             }
                                                         }} 
                                                         className="btn btn-primary" 
                                                         style={{ whiteSpace: 'nowrap' }}
                                                     >
                                                         Save ID
                                                     </button>
                                                 </div>
                                             </div>
                                         </div>

                                         <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
                                             <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '10px' }}>Online Card Payments (Via Admin)</h3>
                                             <div style={{ padding: '15px', background: 'var(--glass-accent)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                                 <p style={{ fontSize: '0.85rem' }}>Automated payouts via Razorpay/Stripe are managed by the platform administrator. You will receive these payouts weekly.</p>
                                             </div>
                                         </div>
                                     </div>
                                 </motion.div>
                             )}


                            {activeTab === 'menu' && (
                                <motion.div key="menu" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
                                        {/* Left Side: Existing Menu Items */}
                                        <div>
                                            <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', fontWeight: 800 }}>Manage Existing Items</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto', paddingRight: '10px' }}>
                                                {menuItems.length === 0 ? (
                                                    <div style={{ padding: '30px', textAlign: 'center', background: 'rgba(255, 71, 87, 0.05)', borderRadius: '16px', border: '1px dashed var(--primary)' }}>
                                                        <Utensils size={40} color="var(--primary)" style={{ marginBottom: '16px', opacity: 0.5 }} />
                                                        <p style={{ color: 'var(--text-secondary)' }}>Your menu is empty.</p>
                                                    </div>
                                                ) : (
                                                    menuItems.map(item => (
                                                        <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glass-accent)', padding: '16px', borderRadius: '16px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                                {item.imageUrl && <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundImage: `url(${item.imageUrl.startsWith('http') ? item.imageUrl : API_BASE_URL + item.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }}></div>}
                                                                <div>
                                                                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '2px' }}>{item.name}</h4>
                                                                    <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 800 }}>₹{item.price.toFixed(2)}</p>
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button onClick={() => handleEditMenuItem(item)} style={{ background: 'rgba(30, 144, 255, 0.1)', color: '#1e90ff', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>Edit</button>
                                                                <button onClick={() => handleDeleteMenuItem(item._id)} style={{ background: 'rgba(255, 71, 87, 0.1)', color: 'var(--primary)', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>Delete</button>
                                                            </div>

                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Side: Add New Form */}
                                        <div style={{ background: 'var(--glass-bg)', padding: '30px', borderRadius: '20px', border: editingItem ? '1px solid #1e90ff' : '1px solid var(--glass-border)' }}>
                                            <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)', fontWeight: 800 }}>{editingItem ? 'Edit Item Details' : 'Publish New Item'}</h3>

                                            <form onSubmit={handleAddMenuItem}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                    <div className="input-group">
                                                        <label className="input-label">Item Name</label>
                                                        <input type="text" className="input-glass" required value={itemMenuName} onChange={e => setItemMenuName(e.target.value)} placeholder="e.g. Truffle Fries" />
                                                    </div>
                                                    <div className="input-group">
                                                        <label className="input-label">Price (₹)</label>
                                                        <input type="number" step="0.01" className="input-glass" required value={itemPrice} onChange={e => setItemPrice(e.target.value)} placeholder="0.00" />
                                                    </div>
                                                </div>
                                                <div className="input-group">
                                                    <label className="input-label">Short Description</label>
                                                    <textarea className="input-glass" required rows="2" value={itemDesc} onChange={e => setItemDesc(e.target.value)} placeholder="What makes this dish special?"></textarea>
                                                </div>
                                                <div className="input-group">
                                                    <label className="input-label">Category</label>
                                                    <select className="input-glass" value={itemCategory} onChange={e => setItemCategory(e.target.value)}>
                                                        <option value="Starter">Starter</option>
                                                        <option value="Main">Main Course</option>
                                                        <option value="Dessert">Dessert</option>
                                                        <option value="Drink">Beverage</option>
                                                    </select>
                                                </div>
                                                <div className="input-group">
                                                    <label className="input-label">Food Type</label>
                                                    <div style={{ display: 'flex', gap: '20px', padding: '10px 0' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                                                            <input type="radio" name="foodType" value="Veg" checked={itemFoodType === 'Veg'} onChange={e => setItemFoodType(e.target.value)} />
                                                            <div style={{ width: '18px', height: '18px', border: '2px solid #27ae60', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px' }}>
                                                                <div style={{ width: '10px', height: '10px', background: '#27ae60', borderRadius: '50%' }}></div>
                                                            </div>
                                                            Veg
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                                                            <input type="radio" name="foodType" value="Non-Veg" checked={itemFoodType === 'Non-Veg'} onChange={e => setItemFoodType(e.target.value)} />
                                                            <div style={{ width: '18px', height: '18px', border: '2px solid #c0392b', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px' }}>
                                                                <div style={{ width: '10px', height: '10px', background: '#c0392b', borderRadius: '50%' }}></div>
                                                            </div>
                                                            Non-Veg
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="input-group">
                                                    <label className="input-label">Food Image</label>
                                                    <input type="file" className="input-glass" style={{ padding: '8px' }} onChange={(e) => uploadFileHandler(e, 'menu')} />
                                                    {uploadingMenu && <span style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginTop: '4px', display: 'block' }}>Uploading securely...</span>}
                                                </div>
                                                <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '10px', background: editingItem ? '#1e90ff' : 'var(--secondary)' }}>{editingItem ? 'Update Menu Item' : '+ Publish to Live Menu'}</button>
                                                {editingItem && <button type="button" onClick={() => { setEditingItem(null); setItemMenuName(''); setItemDesc(''); setItemPrice(''); setItemImage(''); setItemFoodType('Veg'); }} style={{ width: '100%', marginTop: '10px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '8px', borderRadius: '12px', cursor: 'pointer' }}>Cancel Edit</button>}

                                            </form>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'orders' && (
                                <motion.div key="orders" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                    <h3 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>Live Kitchen Orders</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                                        {orders.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>You have no incoming orders yet.</p> : orders.map(order => (
                                            <div key={order._id} style={{ background: 'var(--glass-accent)', border: '1px solid var(--glass-border)', padding: '24px', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px dashed var(--glass-border)', paddingBottom: '12px' }}>
                                                    <span style={{ fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px' }}>#{order._id.substring(order._id.length - 6).toUpperCase()}</span>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px', minHeight: '80px' }}>
                                                    {order.orderItems.map(item => (
                                                        <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', fontWeight: 600 }}>
                                                            <div style={{ 
                                                                width: '32px', 
                                                                height: '32px', 
                                                                borderRadius: '6px', 
                                                                background: item.image && item.image !== 'default' ? `url(${item.image}) no-repeat center/cover` : 'var(--primary)20',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '0.8rem',
                                                                flexShrink: 0,
                                                                border: '1px solid var(--glass-border)'
                                                            }}>
                                                                {(!item.image || item.image === 'default') && '🍲'}
                                                            </div>
                                                            <span><span style={{ color: 'var(--accent)', marginRight: '4px' }}>{item.qty}x</span> {item.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div style={{ background: 'var(--glass-bg)', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Customer: <strong style={{ color: 'var(--text-primary)' }}>{order.user?.name}</strong></p>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Dropoff: {order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <p style={{ fontWeight: 800, fontSize: '1.2rem' }}>₹{order.totalPrice.toFixed(2)}</p>
                                                    <select 
                                                        className="input-glass" 
                                                        value={order.status || 'Pending'} 
                                                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                        style={{ padding: '8px', minWidth: '130px', background: order.status === 'Delivered' ? 'rgba(46, 213, 115, 0.1)' : 'transparent', color: order.status === 'Delivered' ? 'var(--secondary)' : 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '12px', fontWeight: 700 }}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Preparing">Preparing</option>
                                                        <option value="Out for Delivery">Out for Delivery</option>
                                                        <option value="Delivered">Delivered</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'reservations' && (
                                <motion.div key="reservations" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Table Reservations</h3>
                                        <button onClick={() => setManualBookingForm(!manualBookingForm)} className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                                            {manualBookingForm ? 'Close Form' : '+ Add Offline Booking'}
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {manualBookingForm && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginBottom: '30px' }}>
                                                <div className="glass-panel" style={{ padding: '30px', background: 'var(--glass-accent-light)', border: '1px solid var(--primary)' }}>
                                                    <h4 style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: 700 }}>New Manual Reservation</h4>
                                                    <form onSubmit={handleManualBooking}>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                                            <div className="input-group">
                                                                <label className="input-label">Customer Name</label>
                                                                <input type="text" className="input-glass" required value={manualResName} onChange={e => setManualResName(e.target.value)} placeholder="e.g. Rahul Sharma" />
                                                            </div>
                                                            <div className="input-group">
                                                                <label className="input-label">Phone Number</label>
                                                                <input type="tel" className="input-glass" required value={manualResPhone} onChange={e => setManualResPhone(e.target.value)} placeholder="+91..." />
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                                            <div className="input-group">
                                                                <label className="input-label">Date</label>
                                                                <input type="date" className="input-glass" required value={manualResDate} onChange={e => setManualResDate(e.target.value)} />
                                                            </div>
                                                            <div className="input-group">
                                                                <label className="input-label">Time</label>
                                                                <input type="time" className="input-glass" required value={manualResTime} onChange={e => setManualResTime(e.target.value)} />
                                                            </div>
                                                            <div className="input-group">
                                                                <label className="input-label">Guests</label>
                                                                <input type="number" className="input-glass" required min="1" value={manualResGuests} onChange={e => setManualResGuests(e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="input-group">
                                                            <label className="input-label">Special requests / Table No.</label>
                                                            <input type="text" className="input-glass" value={manualResRequests} onChange={e => setManualResRequests(e.target.value)} placeholder="Window seat, Birthday cake, etc." />
                                                        </div>
                                                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Confirm Booking</button>
                                                    </form>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                                        {reservations.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>There are no table bookings at this time.</p> : reservations.map(res => (
                                            <div key={res._id} style={{ background: 'var(--glass-accent)', border: '1px solid var(--glass-border)', padding: '24px', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px dashed var(--glass-border)', paddingBottom: '12px' }}>
                                                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{res.date}</span>
                                                    <span style={{ fontWeight: 800, color: 'var(--primary)', background: 'var(--glass-accent-light)', padding: '4px 12px', borderRadius: '12px' }}>{res.time}</span>
                                                </div>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <p style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>{res.guests} Guests</p>
                                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Name: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{res.guestName || res.user?.name}</span></p>
                                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Phone: <span style={{ color: 'var(--text-primary)' }}>{res.guestPhone || res.user?.phone || 'N/A'}</span></p>
                                                    {res.guestName && <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,165,2,0.1)', color: 'var(--accent)', fontWeight: 800, verticalAlign: 'middle', marginLeft: '8px' }}>OFFLINE</span>}
                                                </div>
                                                {res.specialRequests && <div style={{ background: 'rgba(255, 165, 2, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}><p style={{ fontSize: '0.85rem', color: 'var(--accent)', fontStyle: 'italic' }}>"{res.specialRequests}"</p></div>}
                                                
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                                    <select 
                                                        className="input-glass" 
                                                        value={res.status} 
                                                        onChange={(e) => updateReservationStatus(res._id, e.target.value)}
                                                        style={{ padding: '8px 16px', borderRadius: '12px', background: res.status === 'Confirmed' ? 'rgba(46, 213, 115, 0.1)' : res.status === 'Cancelled' ? 'rgba(255, 71, 87, 0.1)' : 'transparent', color: res.status === 'Confirmed' ? 'var(--secondary)' : res.status === 'Cancelled' ? 'var(--primary)' : 'var(--text-primary)', fontWeight: 700 }}
                                                    >
                                                        <option value="Pending">Pending Request</option>
                                                        <option value="Confirmed">Confirmed</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                 </motion.div>
                             )}

                             {activeTab === 'inventory' && (
                                 <motion.div key="inventory" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                     <InventoryPanel menuItems={menuItems} />
                                 </motion.div>
                             )}

                             {activeTab === 'customers' && (
                                 <motion.div key="customers" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                     <CustomersPanel orders={orders} />
                                 </motion.div>
                             )}

                             {activeTab === 'analytics' && (
                                 <motion.div key="analytics" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                     <AnalyticsPanel orders={orders} menuItems={menuItems} />
                                 </motion.div>
                             )}

                             {activeTab === 'offers' && (
                                 <motion.div key="offers" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                     <OffersPanel menuItems={menuItems} />
                                 </motion.div>
                             )}

                             {activeTab === 'notifications' && (
                                 <motion.div key="notifications" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                     <NotificationsPanel orders={orders} reservations={reservations} />
                                 </motion.div>
                             )}

                             {activeTab === 'delivery' && (
                                 <motion.div key="delivery" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                     <DeliveryPanel orders={orders} updateOrderStatus={updateOrderStatus} />
                                 </motion.div>
                             )}

                             {activeTab === 'staff' && (
                                 <motion.div key="staff" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                     <StaffPanel />
                                 </motion.div>
                             )}

                             {activeTab === 'reviews' && (
                                 <motion.div key="reviews" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                     <ReviewsPanel restaurant={restaurant} />
                                 </motion.div>
                             )}

                             {activeTab === 'receipts' && (
                                 <motion.div key="receipts" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                     <ReceiptsPanel orders={orders} />
                                 </motion.div>
                             )}

                             {activeTab === 'security' && (
                                 <motion.div key="security" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                     <SecurityPanel />
                                 </motion.div>
                             )}

                        </AnimatePresence>

                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default BusinessDashboard;
