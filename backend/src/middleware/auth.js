const { checkJWTToken } = require("../services/token");

/**
 * Middleware для перевірки авторизації користувача через JWT
 */
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // 1. Перевіряємо наявність заголовка Authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentication required. Format: Bearer <token>' });
        }

        // 2. Витягуємо токен (прибираємо "Bearer ")
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token missing' });
        }

        // 3. Валідуємо токен через сервіс
        const decoded = checkJWTToken(token);

        if (decoded) {
            // Зберігаємо дані користувача в об'єкт запиту, 
            // щоб контролери могли знати, хто робить запит (req.user.id)
            req.user = decoded;
            return next();
        } else {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        return res.status(500).json({ message: "Internal Server Error during authentication" });
    }
};

module.exports = { authenticate };