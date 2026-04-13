import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const initialState = {
    cartItems: localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [],
};

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TO_CART':
            const item = action.payload;
            const existItem = state.cartItems.find(x => x._id === item._id);
            if (existItem) {
                return {
                    ...state,
                    cartItems: state.cartItems.map(x => x._id === existItem._id ? { ...x, qty: x.qty + 1 } : x)
                };
            } else {
                return {
                    ...state,
                    cartItems: [...state.cartItems, { ...item, qty: 1 }]
                };
            }
        case 'REMOVE_FROM_CART':
            return {
                ...state,
                cartItems: state.cartItems.filter(x => x._id !== action.payload)
            };
        case 'DECREASE_QTY':
            return {
                ...state,
                cartItems: state.cartItems.map(x => x._id === action.payload && x.qty > 1 ? { ...x, qty: x.qty - 1 } : x)
            };
        case 'CLEAR_CART':
            return {
                ...state,
                cartItems: []
            };
        default:
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    }, [state.cartItems]);

    const addToCart = (item) => dispatch({ type: 'ADD_TO_CART', payload: item });
    const removeFromCart = (id) => dispatch({ type: 'REMOVE_FROM_CART', payload: id });
    const decreaseQty = (id) => dispatch({ type: 'DECREASE_QTY', payload: id });
    const clearCart = () => dispatch({ type: 'CLEAR_CART' });

    return (
        <CartContext.Provider value={{ cartItems: state.cartItems, addToCart, removeFromCart, decreaseQty, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
