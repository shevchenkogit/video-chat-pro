const path = require('path');

const db = {
    users: path.join(process.env.INIT_CWD, "/src/db/users.json"),
    tokens : path.join(process.env.INIT_CWD, "/src/db/tokens.json"),
    friends : path.join(process.env.INIT_CWD, "/src/db/friends.json"),
    online: path.join(process.env.INIT_CWD, "/src/db/online.json"),
    chatHistory: path.join(process.env.INIT_CWD, "/src/db/chatHistory.json"),
    lastsave: path.join(process.env.INIT_CWD, "/src/db/lastsave.json")
}

module.exports = {db}

