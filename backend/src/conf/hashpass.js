const bcrypt = require('bcrypt');

// 10-12 раундів — золотий стандарт балансу між швидкістю та безпекою
const SALT_ROUNDS = 10;

/**
 * Асинхронне хешування пароля
 */
const hashPass = async (password) => {
    try {
        // Використовуємо асинхронний метод, щоб не блокувати Event Loop
        return await bcrypt.hash(password, SALT_ROUNDS);
    } catch (error) {
        console.error("Hashing error:", error);
        throw new Error("Error securing password");
    }
};

/**
 * Асинхронне порівняння пароля
 */
const comparePass = async (enteredPassword, storedHash) => {
    try {
        if (!storedHash) return false;
        return await bcrypt.compare(enteredPassword, storedHash);
    } catch (error) {
        console.error("Comparison error:", error);
        return false;
    }
};

module.exports = {
    hashPass,
    comparePass
};