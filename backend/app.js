const express = require("express");
const cors = require('cors');
const { corsf } = require("./src/conf/cors");
const { friendsRouter } = require("./src/routers/friends");
const { userRouter } = require("./src/routers/user");
const { chatRouter } = require("./src/routers/chat");

const app = express();

// Конфігурація Middleware
app.use(cors(corsf.all));
// Використовуємо вбудовані функції express замість body-parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Роути
app.use("/api/userFriends", friendsRouter);
app.use("/api", userRouter);
app.use("/api/chat", chatRouter);

module.exports = app;