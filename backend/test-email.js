const dotenv = require('dotenv');
const sendEmail = require('./utils/sendEmail');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const testEmail = async () => {
    try {
        console.log('Testing email credentials...');
        console.log('User:', process.env.EMAIL_USER);
        
        await sendEmail({
            email: process.env.EMAIL_USER,
            subject: 'System Check - Credentials Verified',
            html: '<h1>Success!</h1><p>Your Antigravity Food email system is configured correctly.</p>'
        });
        
        console.log('✅ Email sent successfully! Credentials are valid.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to send email:', error.message);
        process.exit(1);
    }
};

testEmail();
