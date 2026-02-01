const dbHelper = require('../utils/dbHelper');
const { uploadFile } = require('./googleServices');
const { env } = require('../conf/environment');
const path = require('path');

const lastSavePath = path.join(env.dbPath, 'lastsave.json');

/**
 * Сервіс автоматичного резервного копіювання БД у Google Cloud
 */
const autoDbSaver = async () => {
    try {
        // 1. Отримуємо дату останнього збереження
        const lastSaveData = await dbHelper.read(lastSavePath);
        const currentDate = new Date();
        const pastDate = new Date(lastSaveData.date || 0);

        // Розраховуємо різницю (5 днів)
        const diffInDays = (currentDate - pastDate) / (1000 * 60 * 60 * 24);

        if (diffInDays >= 5) {
            console.log("🚀 Starting scheduled cloud backup...");

            // 2. Оновлюємо дату останнього збереження асинхронно
            await dbHelper.write(lastSavePath, { date: currentDate });

            // 3. Завантажуємо файли (використовуємо Promise.all для паралельного завантаження)
            const filesToBackup = [
                { path: path.join(env.dbPath, 'users.json'), name: "users" },
                { path: path.join(env.dbPath, 'tokens.json'), name: "tokens" },
                { path: path.join(env.dbPath, 'friends.json'), name: "friends" },
                { path: path.join(env.dbPath, 'online.json'), name: "online" },
                { path: path.join(env.dbPath, 'chatHistory.json'), name: "chatHistory" },
                { path: lastSavePath, name: "lastSave" }
            ];

            // Запускаємо всі завантаження одночасно — це значно швидше!
            await Promise.all(filesToBackup.map(file => uploadFile(file.path, file.name)));

            console.log("✅ Backup successfully uploaded to Google Cloud.");
        }
    } catch (error) {
        console.error("❌ Backup Service Error:", error.message);
    }
};

module.exports = { autoDbSaver };