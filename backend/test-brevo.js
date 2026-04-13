require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

const testAPI = async () => {
    try {
        console.log('Testing Brevo API connection...');
        await sendEmail({
            email: 'sameeransari000009@gmail.com',
            subject: 'Brevo API Test',
            html: '<h1>✅ API Working!</h1><p>If you see this, Brevo API is sending emails successfully via HTTPS.</p>',
        });
        console.log('✅ Success! Test email sent successfully via Brevo API.');
    } catch (error) {
        console.error('❌ API Test Failed:', error.message);
    }
};

testAPI();
