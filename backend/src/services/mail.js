const nodemailer = require("nodemailer");
const { env } = require("../conf/environment");
const { htmlContent } = require("./htmlContent");

// Створюємо транспортер один раз (поза межами функції)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: env.mail,
        pass: env.mailPass // Тут має бути "App Password" від Google
    }
});

/**
 * Сервіс для відправки електронних листів
 */
const mailService = async (email, name, token, templatePath) => {
    try {
        // 1. Отримуємо HTML-контент (чекаємо асинхронно)
        const html = await htmlContent(templatePath, name, token);

        const mailOptions = {
            from: `"Easy Call Support" <${env.mail}>`,
            to: email,
            subject: 'Easy Call — Підтвердження реєстрації',
            html: html
        };

        // 2. Відправляємо лист, використовуючи проміси
        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️ Email sent: ${info.messageId}`);
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("❌ Mail Service Error:", error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { mailService };