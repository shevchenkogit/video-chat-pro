const dbHelper = require('../utils/dbHelper');
const { env } = require("../conf/environment");
const path = require('path');

const onlineDbPath = path.join(env.dbPath, 'online.json');

/**
 * Socket Service: обробка логіки реального часу та сигналінгу
 */
const socketService = (io) => ({
    
    // Оновлення статусу користувача (Online)
    changeStatus: async (userId, socket) => {
        try {
            const dbData = await dbHelper.read(onlineDbPath);
            let userFound = false;

            const updatedData = dbData.map(entry => {
                if (String(entry.uid) === String(userId)) {
                    userFound = true;
                    return { ...entry, status: true, socketid: socket.id };
                }
                return entry;
            });

            if (userFound) {
                await dbHelper.write(onlineDbPath, updatedData);
                // Можна додати сповіщення друзів: 
                // socket.broadcast.emit("friendOnline", { userId });
            }
        } catch (error) {
            console.error("Socket changeStatus error:", error.message);
        }
    },

    // Обробка відключення (Offline)
    handleDisconnect: async (socket) => {
        try {
            // Повідомляємо іншу сторону про розрив дзвінка
            socket.broadcast.emit("callEnded");

            const dbData = await dbHelper.read(onlineDbPath);
            let changed = false;

            const updatedData = dbData.map(entry => {
                if (entry.socketid === socket.id) {
                    changed = true;
                    return { ...entry, status: false, socketid: "" };
                }
                return entry;
            });

            if (changed) {
                await dbHelper.write(onlineDbPath, updatedData);
            }
        } catch (error) {
            console.error("Socket disconnect error:", error.message);
        }
    },

    // WebRTC Сигналінг: Дзвінок
    callUser: (data, socket) => {
        // data: { to, signalData, from, name }
        io.to(data.to).emit("callUserf", { 
            signal: data.signalData, 
            from: data.from,
            name: data.name 
        });
    },

    // WebRTC Сигналінг: Відповідь
    answerCall: (data, socket) => {
        // data: { to, signal }
        io.to(data.to).emit("callAccepted", data.signal);
    }
});

module.exports = socketService;