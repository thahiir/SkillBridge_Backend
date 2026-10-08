const sendEmail = async (options) => {

    const response = await fetch(
        "https://api.resend.com/emails",
        {
            method: "POST",

            headers: {
                Authorization:
                    `Bearer ${process.env.RESEND_API_KEY}`,

                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                from: process.env.EMAIL_FROM,

                to: [options.email],

                subject: options.subject,

                text: options.message,
            }),
        }
    );

    const result = await response.json();

    if (!response.ok) {

        throw new Error(
            result.message ||
            "Failed to send email"
        );

    }

    return result;
};

module.exports = sendEmail;