require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.BREVO_USER,
            pass: process.env.BREVO_PASS,
        },
    });

    try {
        console.log('Testing Brevo SMTP connection...');
        await transporter.verify();
        console.log('✅ Connection Successful! Brevo is ready.');
        
        // Optional: Send a test email to the user's login email
        await transporter.sendMail({
            from: `"Antigravity Test" <${process.env.BREVO_USER}>`,
            to: 'sameeransari000009@gmail.com',
            subject: 'Brevo SMTP Test',
            text: 'If you see this, Brevo is working perfectly!',
        });
        console.log('✅ Test email sent to sameeransari000009@gmail.com');
    } catch (error) {
        console.error('❌ SMTP Connection Failed:', error.message);
    }
};

testEmail();
