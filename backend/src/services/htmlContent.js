const handlebars = require('handlebars');
const fs = require('fs').promises; // Використовуємо асинхронні проміси
const path = require('path');
const { env } = require('../conf/environment');

/**
 * Сервіс для генерації HTML-контенту листів
 */
const htmlContent = async (templatePath, userName, actionToken) => {
    try {
        // 1. Асинхронне читання файлу шаблону
        const source = await fs.readFile(templatePath, 'utf8');
        
        // 2. Компіляція шаблону через Handlebars
        const template = handlebars.compile(source);

        // 3. Підготовка даних для вставки
        const data = {
            name: userName || 'Користувач',
            token: actionToken,
            frontendUrl: env.frontend,
            year: new Date().getFullYear() // Корисно для копірайту в футері листа
        };

        // 4. Повернення готового HTML
        return template(data);
    } catch (error) {
        console.error(`❌ Template Error at ${templatePath}:`, error.message);
        // Повертаємо базовий текст, якщо шаблон не завантажився, щоб не блокувати відправку
        return `Hello ${userName}, your token is: ${actionToken}`;
    }
};

module.exports = { htmlContent };