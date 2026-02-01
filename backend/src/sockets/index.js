const { Server } = require('socket.io');
const { corsf } = require("../conf/cors");
const { getSocketsOfFriendsByUserId, getSocketsOfFriendsByUserSocketsId } = require("../services/friends");
const { changeUserStatus } = require("../services/users");
const { postChatService, markAsReadService } = require("../services/chatService");
const { autoDbSaver } = require("../services/autoDbSaver");
const fs = require("fs"); 
const path = require("path");

// Сховище кімнат
const usersInRooms = {};

const initSocket = (server) => {
    const io = new Server(server, { cors: corsf.all });

    // Допоміжні функції (leaveAllRooms, findSocketByUserId) переносимо сюди або в utils
    const leaveAllRooms = (socket) => {
        for (const roomID in usersInRooms) {
            if (usersInRooms[roomID].includes(socket.id)) {
                usersInRooms[roomID] = usersInRooms[roomID].filter(id => id !== socket.id);
                socket.to(roomID).emit("user-left", socket.id);
                if (usersInRooms[roomID].length === 0) delete usersInRooms[roomID];
            }
        }
    };

    io.on("connection", (socket) => {
        console.log(`🔌 Connected: ${socket.id}`);

        // --- Логіка статусів ---
        socket.on("logIn", async (id) => {
            await changeUserStatus(id, socket.id, true);
            const sockets = await getSocketsOfFriendsByUserId(id);
            await autoDbSaver();
            if (sockets) io.to(sockets).emit("newOnline");
        });

        // --- WebRTC Кімнати ---
        socket.on("join-room", (roomID) => {
            leaveAllRooms(socket);
            if (!usersInRooms[roomID]) usersInRooms[roomID] = [];
            usersInRooms[roomID].push(socket.id);
            socket.join(roomID);
            const otherUsers = usersInRooms[roomID].filter(id => id !== socket.id);
            socket.emit("all-users", otherUsers);
        });

        socket.on("sending-signal", payload => {
            io.to(payload.userToCall).emit("user-joined", { signal: payload.signal, callerID: payload.callerID });
        });

        socket.on("returning-signal", payload => {
            io.to(payload.callerID).emit("receiving-returned-signal", { signal: payload.signal, id: socket.id });
        });

        // --- Чат ---
        socket.on("sendMessage", async (data) => {
            await postChatService(data.uid, data.fid, data.message);
            io.to(data.to).emit("reciv", { ...data, senderId: data.uid, senderSocketId: socket.id });
            io.to(data.to).emit("newOnline"); 
        });

        socket.on("readMessage", async (data) => {
            await markAsReadService(data.uid, data.fid);
            if (data.toSocketId) io.to(data.toSocketId).emit("messagesReadUpdate", { readerId: data.uid });
        });

        // --- Дзвінки ---
        socket.on("invToRoom", (data) => {
            if (data.to?.socketid) {
                io.to(data.to.socketid).emit("recOffer", { from: data.from, roomName: data.roomName, at: new Date() });
            }
        });

        socket.on("disconnect", async () => {
            await changeUserStatus("", socket.id, false);
            leaveAllRooms(socket);
            const sockets = await getSocketsOfFriendsByUserSocketsId(socket.id);
            if (sockets) io.to(sockets).emit("newOnline");
        });
    });

    return io;
};

module.exports = initSocket;