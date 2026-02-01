const express = require('express');
const { authenticate } = require("../middleware/authMiddleware");
const { verefCheck } = require('../middleware/verifyMiddleware');
const { 
    logIn, 
    validation, 
    OAuth2logIn, 
    creatNU, 
    verefication, 
    creatUserWG 
} = require("../controllers/userController");

const userRouter = new express.Router();

/**
 * Маршрути авторизації та реєстрації
 */

// Логін: спочатку перевіряємо верифікацію пошти, потім пускаємо
userRouter.post("/login", verefCheck, logIn);

// Логін через Google: також потребує верифікованого акаунту
userRouter.post("/loginOAuth2", verefCheck, OAuth2logIn);

// Створення нового користувача (стандартне та через Google)
userRouter.post("/create", creatNU);
userRouter.post("/createWG", creatUserWG);

// Підтвердження пошти через токен із листа
userRouter.get("/verefication", verefication);

// Перевірка валідності сесії (потребує JWT токен)
userRouter.get("/valid", authenticate, validation);

module.exports = { userRouter };