const axios = require('axios');

const sendEmail = async (options) => {
    try {
        const data = {
            sender: { 
                name: "BiteStream", 
                email: process.env.BREVO_SENDER 
            },
            to: [{ email: options.email }],
            subject: options.subject,
            htmlContent: options.html,
        };

        await axios.post('https://api.brevo.com/v3/smtp/email', data, {
            headers: {
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
        
    } catch (error) {
        throw new Error(`Brevo API Error: ${error.response?.data?.message || error.message}`);
    }
};

module.exports = sendEmail;
