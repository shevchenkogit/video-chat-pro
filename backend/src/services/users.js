const dbHelper = require('../utils/dbHelper');
const { env } = require("../conf/environment");
const { generateAuthToken, generateActionToken, checkActionJWTToken } = require("./tokenService");
const { IUser, IFriend, IOnline, IToken } = require('../models/schemas');
const { mailService } = require('./mailService');
const { allTemplates } = require('../templates/allTemplates');
const { hashPass, comparePass } = require('../conf/hashpass');
const path = require('path');

const paths = {
    users: path.join(env.dbPath, 'users.json'),
    tokens: path.join(env.dbPath, 'tokens.json'),
    online: path.join(env.dbPath, 'online.json'),
    friends: path.join(env.dbPath, 'friends.json')
};

const userService = {
    /**
     * Авторизація за поштою та паролем
     */
    logInService: async (email, password) => {
        const users = await dbHelper.read(paths.users);
        const user = users.find(u => u.email === email.toLowerCase());

        if (user && comparePass(password, user.password)) {
            const token = generateAuthToken({ id: user.uid, name: user.name });

            // Оновлюємо токен в базі
            const tokensDb = await dbHelper.read(paths.tokens);
            const userToken = tokensDb.find(t => t.uid === user.uid);
            if (userToken) {
                userToken.token = token;
                await dbHelper.write(paths.tokens, tokensDb);
            }

            return token;
        }
        throw new Error("Invalid credentials");
    },

    /**
     * Створення нового акаунта (Registration)
     */
    creatUService: async (email, name, password) => {
        const users = await dbHelper.read(paths.users);
        
        if (users.some(u => u.email === email.toLowerCase())) {
            throw new Error("Email already exists");
        }

        const newId = users.length > 0 ? users[users.length - 1].uid + 1 : 1;
        const hashedPassword = hashPass(password);

        // Створюємо записи для всіх таблиць
        const newUser = IUser(newId, email.toLowerCase(), name.toLowerCase(), hashedPassword);
        const newFriend = IFriend(newId);
        const newToken = IToken(newId);
        const newOnline = IOnline(newId);

        // Асинхронно оновлюємо всі бази даних паралельно
        const [friendsDb, tokensDb, onlineDb] = await Promise.all([
            dbHelper.read(paths.friends),
            dbHelper.read(paths.tokens),
            dbHelper.read(paths.online)
        ]);

        users.push(newUser);
        friendsDb.push(newFriend);
        tokensDb.push(newToken);
        onlineDb.push(newOnline);

        await Promise.all([
            dbHelper.write(paths.users, users),
            dbHelper.write(paths.friends, friendsDb),
            dbHelper.write(paths.tokens, tokensDb),
            dbHelper.write(paths.online, onlineDb)
        ]);

        // Відправка листа верифікації
        const actionToken = generateActionToken(email);
        mailService(email.toLowerCase(), name, actionToken, allTemplates.wird);

        return { msg: "User created! Please check your email." };
    },

    /**
     * Верифікація Email через JWT
     */
    userVerefication: async (token) => {
        const decoded = checkActionJWTToken(token);
        if (!decoded) return false;

        const users = await dbHelper.read(paths.users);
        const user = users.find(u => u.email === decoded.email);

        if (user) {
            user.isVerified = true;
            await dbHelper.write(paths.users, users);
            return true;
        }
        return false;
    }
};

module.exports = userService;