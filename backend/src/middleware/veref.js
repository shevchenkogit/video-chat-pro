const dbHelper = require('../utils/dbHelper');
const { env } = require('../conf/environment');
const path = require('path');

const userDbPath = path.join(env.dbPath, 'users.json');

/**
 * Middleware для перевірки, чи підтвердив користувач свою пошту
 */
const verifyCheck = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // 1. Асинхронно читаємо базу через наш хелпер
        const users = await dbHelper.read(userDbPath);

        // 2. Використовуємо .find() замість циклу for (це чистіше та швидше)
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        // 3. Перевіряємо існування користувача
        if (!user) {
            return res.status(404).json({ message: "User does not exist" });
        }

        // 4. Перевіряємо статус верифікації
        if (user.isVerified) { // Використовуємо нашу нову назву поля зі схеми
            return next();
        }

        // Якщо не верифікований — зупиняємо запит
        return res.status(403).json({ 
            message: "Need email verification!",
            needsVerification: true 
        });

    } catch (error) {
        console.error("Verification Middleware Error:", error.message);
        return res.status(500).json({ message: "Internal server error during verification check" });
    }
};

module.exports = { verifyCheck };