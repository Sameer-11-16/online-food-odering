const sendOTPEmail = async (email, otp, subject = "Your Verification Code", message = "Your verification code is:") => {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "no-reply@foodordering.com";

    const emailData = {
        subject: subject,
        htmlContent: `
            <html>
                <body>
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #333;">${subject}</h2>
                        <p>Hello,</p>
                        <p>${message}</p>
                        <div style="font-size: 24px; font-weight: bold; color: #ff4d4d; letter-spacing: 5px; margin: 20px 0;">${otp}</div>
                        <p>This code is valid for 5 minutes. Do not share it with anyone.</p>
                        <p>Best regards,<br>The Food Ordering System Team</p>
                    </div>
                </body>
            </html>
        `,
        sender: { name: "Food Ordering System", email: senderEmail },
        to: [{ email: email }]
    };


    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Brevo API error:', data);
            throw new Error(data.message || 'Failed to send email');
        }

        console.log('Email sent successfully via Brevo:', data);
        return data;
    } catch (error) {
        console.error('Error while sending email via Brevo:', error);
        throw error;
    }
};

module.exports = { sendOTPEmail };

