const jwt = require('jsonwebtoken');
const { env } = require("../conf/environment");

/**
 * Сервіс для керування JWT токенами
 */
const tokenService = {
    /**
     * Генерує основний токен доступу (Session)
     */
    generateAuthToken: (user) => {
        const payload = {
            id: user.uid, // Використовуємо uid з нашої схеми
            name: user.name,
        };
        return jwt.sign(payload, env.jwtSecret, { expiresIn: '12h' });
    },

    /**
     * Генерує токен для тривалих дій (Email Verification)
     */
    generateActionToken: (email) => {
        const payload = { email };
        return jwt.sign(payload, env.jwtActionSecret, { expiresIn: '21d' }); // 3 тижні
    },

    /**
     * Перевіряє токен авторизації та повертає дані користувача
     */
    checkJWTToken: (token) => {
        try {
            return jwt.verify(token, env.jwtSecret);
        } catch (err) {
            tokenService._logError(err);
            return null;
        }
    },

    /**
     * Перевіряє токен дії (наприклад, для верифікації пошти)
     */
    checkActionJWTToken: (token) => {
        try {
            return jwt.verify(token, env.jwtActionSecret);
        } catch (err) {
            tokenService._logError(err);
            return null;
        }
    },

    /**
     * Приватний метод для логування помилок (Internal use)
     */
    _logError: (err) => {
        if (err.name === 'TokenExpiredError') {
            console.warn('⚠️ JWT: Token expired at', err.expiredAt);
        } else {
            console.error('❌ JWT: Verification failed:', err.message);
        }
    }
};

module.exports = tokenService;