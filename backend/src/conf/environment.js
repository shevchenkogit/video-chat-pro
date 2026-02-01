const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { env } = require('../conf/environment');
const dbHelper = require('../utils/dbHelper');
const path = require('path');

const userDbPath = path.join(env.dbPath, 'users.json');

const userController = {
    // Реєстрація нового користувача
    register: async (req, res) => {
        const { email, password, userName } = req.body;
        
        // 1. Читаємо базу
        const users = await dbHelper.read(userDbPath);
        
        // 2. Перевіряємо чи юзер вже є
        if (users.find(u => u.email === email)) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 3. Хешуємо пароль (сіль = 10)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 4. Створюємо юзера
        const newUser = {
            id: await dbHelper.generateId(userDbPath),
            email,
            password: hashedPassword,
            userName,
            status: false
        };

        users.push(newUser);
        await dbHelper.write(userDbPath, users);

        res.status(201).json({ message: "User registered successfully" });
    },

    // Логін
    login: async (req, res) => {
        const { email, password } = req.body;
        const users = await dbHelper.read(userDbPath);
        
        const user = users.find(u => u.email === email);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Порівнюємо хеш
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Створюємо JWT
        const token = jwt.sign({ id: user.id }, env.jwtSecret, { expiresIn: '24h' });

        res.json({ token, user: { id: user.id, email: user.email, userName: user.userName } });
    }
};

module.exports = userController;