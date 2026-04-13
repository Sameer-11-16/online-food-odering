const API_BASE_URL = import.meta.env.PROD 
    ? 'https://online-food-odering.onrender.com' 
    : 'http://localhost:5000';

export default API_BASE_URL;
