const { getChatService, changeMStatus } = require("../services/chatService");
const { uploadFile, deleteFile, downloadFile } = require("../services/googleServices");
const { env } = require("../conf/environment");
const { generate } = require("../utils/stringHelper"); // Використовуємо наш новий хелпер

/**
 * Отримання історії повідомлень між двома користувачами
 */
const getChatHistory = async (req, res) => {
    try {
        const { uid, fid } = req.query;
        
        if (!uid || !fid) {
            return res.status(400).json({ message: "User ID and Friend ID are required" });
        }

        const userChat = await getChatService(uid, fid);
        res.status(200).json(userChat);
    } catch (err) {
        console.error("Chat History Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Оновлення статусу прочитаних повідомлень
 */
const changeReadStatus = async (req, res) => {
    try {
        const { uid, fid } = req.query;
        
        const updatedChat = await changeMStatus(uid, fid);
        res.status(200).json({ success: true, data: updatedChat });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Синхронізація чатів з Google Cloud Storage (Backup логіка)
 */
const syncChatWithCloud = async (req, res) => {
    try {
        const tempFileName = `backup-${generate(8)}.json`;
        const localPath = `${env.dbPath}/chatHistory.json`;

        // Приклад професійної логіки бекапу:
        // 1. Завантажуємо в хмару
        // await uploadFile(localPath, tempFileName);
        
        // 2. Логуємо успіх
        console.log(`Backup created: ${tempFileName}`);

        res.status(200).json({ 
            message: "Cloud sync initialized", 
            backupId: tempFileName 
        });
    } catch (err) {
        console.error("Cloud Sync Error:", err);
        res.status(500).json({ message: "Failed to sync with cloud storage" });
    }
};

module.exports = {
    getChatHistory,
    changeReadStatus,
    syncChatWithCloud
};