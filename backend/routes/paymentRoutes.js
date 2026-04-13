const express = require('express');
const router = express.Router();
// We use a dummy key if STRIPE_SECRET_KEY is not defined so the server doesn't crash during development
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key');

router.post('/create-payment-intent', async (req, res) => {
    try {
        const { items, totalPrice } = req.body;
        
        // Stripe expects the amount in the smallest currency unit (e.g., cents or paise)
        // Since we are using Indian Rupees (₹), 1 INR = 100 paise
        const amountInPaise = Math.round(totalPrice * 100);

        // We wrap in a try-catch to simulate success if the user doesn't have a real API key yet
        if (!process.env.STRIPE_SECRET_KEY) {
            return res.status(200).json({ 
                clientSecret: 'pi_dummy_secret_for_ui_testing',
                message: "This is a mock payment intent. Add a real STRIPE_SECRET_KEY to .env to process real test cards."
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInPaise,
            currency: 'inr',
            // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Stripe Error:", error);
        res.status(500).json({ message: error.message || "Failed to create payment intent" });
    }
});

module.exports = router;
