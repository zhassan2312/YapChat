export const EmailHTML= (url) => {

    return(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #333;">Email Verification</h2>
            <p style="font-size: 16px; color: #555;">
                Thank you for registering with us. Please click the button below to verify your email address.
            </p>
            <div style="text-align: center; margin: 20px 0;">
                <a href="${url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                    Verify Email
                </a>
            </div>
            <p style="font-size: 14px; color: #999;">
                If you did not request this email, please ignore it.
            </p>
        </div>
    `);
}
