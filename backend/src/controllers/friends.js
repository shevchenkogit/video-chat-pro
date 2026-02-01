const { getFriends, addOrcancelFriends, findFriends } = require("../services/friends");

/**
 * Отримання списку друзів користувача
 */
const getFriendsController = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const friends = await getFriends(id);
        res.status(200).json(friends);
    } catch (error) {
        console.error(`Error in getFriends: ${error.message}`);
        res.status(500).json({ message: "Failed to retrieve friends list" });
    }
};

/**
 * Керування запитами в друзі (додавання або скасування)
 */
const handleFriendRequest = async (req, res) => {
    try {
        const { id, frId, action } = req.body;

        // Перевірка необхідних полів
        if (!id || !frId || !action) {
            return res.status(400).json({ message: "Missing required fields: id, frId, or action" });
        }

        const result = await addOrcancelFriends(id, frId, action);
        return res.status(200).json(result);
    } catch (error) {
        console.error(`Error in handleFriendRequest: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Пошук нових друзів за іменем
 */
const findFriendsController = async (req, res) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(200).json([]); // Повертаємо пустий список, якщо пошуковий запит порожній
        }

        const foundUsers = await findFriends(name);
        res.status(200).json(foundUsers);
    } catch (error) {
        console.error(`Search Error: ${error.message}`);
        res.status(500).json({ message: "Error during friend search" });
    }
};

module.exports = {
    getFriendsController,
    handleFriendRequest, // Виправлена назва
    findFriendsController
};