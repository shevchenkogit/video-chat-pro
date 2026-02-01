const http = require("http");
const app = require("./app");
const initSocket = require("./src/sockets/index");
const { env } = require("./src/conf/environment");

const server = http.createServer(app);

// Запускаємо сокети
initSocket(server);

server.listen(env.port, () => {
    console.log(`🚀 Server is running on port ${env.port}`);
});