const express = require('express');
const { authenticate } = require("../middleware/authMiddleware");
const { 
    getFriendsController, 
    handleFriendRequest, // Оновлена назва без друкарських помилок
    findFriendsController 
} = require("../controllers/friendsController");

const friendsRouter = new express.Router();

/**
 * Глобальний захист роутера.
 * Кожен, хто звертається до списку друзів або пошуку, має бути авторизованим.
 */
friendsRouter.use(authenticate);

// GET /api/userFriends/ - Отримати список друзів
friendsRouter.get("/", getFriendsController);

// POST /api/userFriends/goc - Додати друга або скасувати запит
// goc (get or cancel) — краще змінити на /request у майбутньому для зрозумілості
friendsRouter.post("/goc", handleFriendRequest);

// GET /api/userFriends/find - Пошук нових людей
friendsRouter.get("/find", findFriendsController);

module.exports = { friendsRouter };