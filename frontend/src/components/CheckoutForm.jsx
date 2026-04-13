import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const CheckoutForm = ({ amount, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        // This will simulate the checkout experience. 
        // Note: For a real Stripe integration, you would typically use stripe.confirmPayment() 
        // with the return_url, but since this is a local demo, we'll just mock the success locally 
        // to avoid redirecting away from your localhost.
        
        const paymentToast = toast.loading('Processing Payment...');
        try {
            // Validate the form
            const { error: submitError } = await elements.submit();
            if (submitError) {
                toast.error(submitError.message, { id: paymentToast });
                setIsProcessing(false);
                return;
            }
            
            // local demo success:
            setTimeout(() => {
                toast.success("Order Placed Successfully!", { 
                    id: paymentToast,
                    icon: '🍕',
                    duration: 5000
                });
                onSuccess();
            }, 1500);

        } catch (err) {
            toast.error("An unexpected error occurred.", { id: paymentToast });
        }

        setIsProcessing(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement id="payment-element" />
            <button 
                disabled={isProcessing || !stripe || !elements} 
                id="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '20px', padding: '14px', fontSize: '1.1rem' }}
            >
                <span id="button-text">
                    {isProcessing ? "Processing..." : `Pay ₹${amount.toFixed(2)}`}
                </span>
            </button>
            {message && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '16px', color: 'var(--primary)', fontWeight: 600, textAlign: 'center' }}>
                    {message}
                </motion.div>
            )}
        </form>
    );
};

export default CheckoutForm;
