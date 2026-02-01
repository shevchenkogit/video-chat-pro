const { postChatService, markAsReadService } = require("../services/chatService");

module.exports = (io, socket) => {
    socket.on("sendMessage", async (data) => {
        try {
            await postChatService(data.uid, data.fid, data.message);
            
            // Надсилаємо отримувачу
            io.to(data.to).emit("reciv", {
                ...data,
                senderId: data.uid,
                senderSocketId: socket.id 
            });

            // Оновлюємо статус у друзів
            io.to(data.to).emit("newOnline");
        } catch (e) {
            socket.emit("error", { message: "Failed to send message" });
        }
    });

    socket.on("typing", (data) => {
        // Логіка знаходження сокета тепер у сервісі, а не через fs тут
        socket.to(data.toSocketId).emit("displayTyping", {
            isTyping: data.isTyping,
            fromUserId: data.fromUserId 
        });
    });
};