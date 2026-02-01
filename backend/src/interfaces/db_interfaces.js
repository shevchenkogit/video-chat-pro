/**
 * Схеми даних проекту (Factory Functions)
 */

// Створення профілю користувача
const IUser = (id, email, name, password) => ({
    uid: id,
    email: email || "",
    name: name || "User",
    password: password,
    isVerified: false // Виправив verf на зрозумілу назву
});

// Створення структури друзів
const IFriend = (id) => ({
    uid: id,
    requests: [], // Виправив request на множину
    friends: []
});

// Стан онлайн
const IOnline = (id) => ({
    uid: id,
    status: false,
    socketid: ""
});

// Елемент чату (повідомлення)
const IchatElement = (uid, text, date = new Date()) => ({
    uid: uid,
    text: text || "",
    date: date,
    isRead: false
});

// Структура історії чату
const IChatHistory = (id) => ({
    id: id,
    chats: [] // Починаємо з порожнього масиву, а не з "пустого" повідомлення
});

// Відповідь для списку друзів (Data Transfer Object - DTO)
const IFriendsRes = (id, name, status, socketid) => ({
    id: id,
    name: name,
    status: status || false,
    socketid: socketid || ""
});

module.exports = { 
    IUser, 
    IFriend, 
    IOnline, 
    IFriendsRes, 
    IChatHistory, 
    IchatElement 
};