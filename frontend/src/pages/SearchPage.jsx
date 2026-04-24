import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import MenuItemCard from '../components/MenuItemCard';
import API_BASE_URL from '../apiConfig';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const SearchPage = () => {
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('q') || '';

    useEffect(() => {
        const fetchResults = async () => {
            if (!searchQuery) {
                navigate('/');
                return;
            }
            try {
                const { data } = await axios.get(`/api/restaurants/search/food?q=${searchQuery}`);
                setFoodItems(data);
                setLoading(false);
            } catch (error) {
                // If not found, redirect to home page as requested
                toast.error(`No food found for "${searchQuery}". Returning to home.`);
                navigate('/');
            }
        };
        fetchResults();
    }, [searchQuery, navigate]);

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Searching for delicious food...</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingBottom: '60px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Search Results for "{searchQuery}"</h1>
                <Link to="/" className="btn btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={16} /> Back
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {foodItems.map((item, i) => (
                    <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <div style={{ marginBottom: '10px', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700 }}>
                            From: <Link to={`/restaurant/${item.restaurant?._id}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{item.restaurant?.name}</Link>
                        </div>
                        <MenuItemCard item={item} />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default SearchPage;
