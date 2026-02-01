const fs = require('fs').promises; // Використовуємо проміси для асинхронності
const path = require('path');

/**
 * Універсальний помічник для роботи з JSON БД
 */
const dbHelper = {
    // Асинхронне читання
    read: async (filePath) => {
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error reading db at ${filePath}:`, error);
            return [];
        }
    },

    // Асинхронний запис
    write: async (filePath, data) => {
        try {
            await fs.writeFile(filePath, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            console.error(`Error writing to db at ${filePath}:`, error);
            return false;
        }
    },

    // Генерація нового ID (надійна версія)
    generateId: async (filePath) => {
        const data = await dbHelper.read(filePath);
        if (data.length === 0) return 1;
        
        // Знаходимо максимальний id серед об'єктів
        const maxId = Math.max(...data.map(item => item.id || 0));
        return maxId + 1;
    },

    // Валідація схеми (виправлене порівняння ключів)
    checkSchema: async (filePath, templateObject) => {
        const data = await dbHelper.read(filePath);
        if (data.length === 0) return true;

        const keysHave = Object.keys(data[0]).sort().join(',');
        const keysExpect = Object.keys(templateObject).sort().join(',');
        
        return keysHave === keysExpect;
    }
};

module.exports = dbHelper;