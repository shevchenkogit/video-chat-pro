const dbHelper = require('../utils/dbHelper');
const { env } = require('../conf/environment');
const { IchatElement, IChatHistory } = require('../models/schemas');
const path = require('path');

const chatDbPath = path.join(env.dbPath, 'chatHistory.json');

// Допоміжна функція для пошуку ID чату (комбінація двох UID)
const getChatId = (uid1, uid2) => [uid1, uid2].sort().join('_');

const chatService = {
    /**
     * Отримання історії чату та кількості непрочитаних
     */
    getChatService: async (uid, fid) => {
        const chatId = getChatId(uid, fid);
        const dbChat = await dbHelper.read(chatDbPath);

        const currentChat = dbChat.find(chat => chat.id === chatId);

        if (!currentChat) {
            return { messages: [], unreadCount: 0 };
        }

        // Сортування (хоча зазвичай вони вже по порядку)
        const sortedMessages = currentChat.chats.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Рахуємо непрочитані від співрозмовника
        const unreadCount = sortedMessages.filter(msg => !msg.isRead && msg.uid === fid).length;

        return {
            messages: sortedMessages,
            unreadCount: unreadCount
        };
    },

    /**
     * Збереження нового повідомлення
     */
    postChatService: async (uid, fid, text) => {
        const chatId = getChatId(uid, fid);
        const dbChat = await dbHelper.read(chatDbPath);
        const existingChat = dbChat.find(chat => chat.id === chatId);

        if (existingChat) {
            existingChat.chats.push(IchatElement(uid, text));
        } else {
            const newChat = IChatHistory(chatId);
            newChat.chats = [IchatElement(uid, text)];
            dbChat.push(newChat);
        }

        await dbHelper.write(chatDbPath, dbChat);
        return { success: true };
    },

    /**
     * Оновлення статусу повідомлень на "прочитано"
     */
    changeMStatus: async (uid, fid) => {
        const chatId = getChatId(uid, fid);
        let dbChat = await dbHelper.read(chatDbPath);
        let changed = false;

        const chat = dbChat.find(c => c.id === chatId);

        if (chat) {
            chat.chats = chat.chats.map(msg => {
                if (msg.uid === fid && !msg.isRead) {
                    changed = true;
                    return { ...msg, isRead: true };
                }
                return msg;
            });

            if (changed) {
                await dbHelper.write(chatDbPath, dbChat);
            }
            return { success: true };
        }
        return { success: false, msg: "Chat not found" };
    }
};

module.exports = chatService;