const express = require('express');
const { authenticate } = require("../middleware/authMiddleware"); // Оновлена назва
const { 
    getChatHistory, 
    changeReadStatus, 
    syncChatWithCloud // Виправлена назва з goodleController
} = require("../controllers/chatController");

const chatRouter = new express.Router();

/**
 * Усі маршрути чату захищені Middleware 'authenticate'
 * Це гарантує, що історію повідомлень бачать лише авторизовані юзери
 */
chatRouter.use(authenticate); 

// GET /api/chat - Отримати історію повідомлень
chatRouter.get("/", getChatHistory);

// GET /api/chat/read - Позначити повідомлення як прочитані
chatRouter.get("/read", changeReadStatus);

// POST /api/chat/sync - Синхронізація з хмарою (якщо це POST запит)
chatRouter.post("/sync", syncChatWithCloud);

module.exports = { chatRouter };