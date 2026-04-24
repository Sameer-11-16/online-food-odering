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

const sendReceiptEmail = async (email, order, restaurantName) => {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "no-reply@foodordering.com";

    const itemsHtml = order.orderItems.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.qty}x ${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.qty).toFixed(2)}</td>
        </tr>
    `).join('');

    const emailData = {
        subject: `Order Receipt - #${order._id.toString().slice(-6).toUpperCase()}`,
        htmlContent: `
            <html>
                <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6;">
                    <div style="max-width: 600px; margin: 20px auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 12px; background: #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #ff4757; margin: 0; font-size: 28px;">BiteStream</h1>
                            <p style="color: #777; margin: 5px 0;">Your Food, Delivered with Love</p>
                        </div>
                        
                        <div style="border-top: 2px solid #ff4757; padding-top: 20px; margin-bottom: 20px;">
                            <h2 style="font-size: 20px; margin-bottom: 10px;">Order Receipt</h2>
                            <p style="font-size: 14px; color: #666;">Order ID: #${order._id}</p>
                            <p style="font-size: 14px; color: #666;">Date: ${new Date(order.createdAt).toLocaleString()}</p>
                            <p style="font-size: 14px; color: #666;">Restaurant: <strong>${restaurantName}</strong></p>
                        </div>

                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                            <thead>
                                <tr style="background: #f9f9f9;">
                                    <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eee;">Item</th>
                                    <th style="text-align: right; padding: 10px; border-bottom: 2px solid #eee;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>

                        <div style="text-align: right; margin-top: 20px;">
                            <p style="margin: 5px 0;">Subtotal: ₹${(order.totalPrice - (order.totalPrice * 0.08) - 3.99).toFixed(2)}</p>
                            <p style="margin: 5px 0;">Taxes & Fees: ₹${(order.totalPrice * 0.08 + 3.99).toFixed(2)}</p>
                            <h2 style="color: #ff4757; margin: 10px 0;">Total: ₹${order.totalPrice.toFixed(2)}</h2>
                        </div>

                        <div style="margin-top: 30px; padding: 20px; background: #fdf2f2; border-radius: 8px;">
                            <h3 style="font-size: 16px; margin-top: 0;">Delivery Address</h3>
                            <p style="font-size: 14px; margin-bottom: 0;">${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}</p>
                        </div>

                        <div style="text-align: center; margin-top: 40px; color: #999; font-size: 12px;">
                            <p>Thank you for choosing BiteStream!</p>
                            <p>&copy; 2026 BiteStream Food Delivery. All rights reserved.</p>
                        </div>
                    </div>
                </body>
            </html>
        `,
        sender: { name: "BiteStream Receipts", email: senderEmail },
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
        return await response.json();
    } catch (error) {
        console.error('Brevo Receipt Error:', error);
    }
};

module.exports = { sendOTPEmail, sendReceiptEmail };

