// Використовуємо змінні оточення (упевнись, що вони є в .env файлі)
const baseURL = process.env.REACT_APP_SERVER_URL;
const socketURL = process.env.REACT_APP_SOCKET_SERVER_URL;

const endpoints = {
    friends: "/userFriends",
    googleToken: process.env.REACT_APP_GOOGLE_AUTHORIZED + "/userinfo?access_token=",
    googleAuth: "/loginOAuth2",
    logIn: "/login",
    addOCancel: "/goc",
    isValid: "/valid",
    find: "/find",
    chat: "/chat",
    verification: "/verification", // Виправлено помилку в назві
    token: "/token",
    create: "/create",
    createWG: "/createWG",
    read: "/read"
};

/**
 * Стандартні заголовки для запитів до твого сервера.
 * Якщо токен не передано, намагається взяти його з localStorage.
 */
const headers = (token) => {
    const activeToken = token || localStorage.getItem('ut');
    return {
        headers: {
            'Authorization': activeToken ? `${activeToken}` : '',
            'Content-Type': 'application/json'
        }
    };
};

/**
 * Заголовки для запитів до Google API.
 */
const headersGoogle = (token) => {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
        }
    };
};

export { baseURL, socketURL, endpoints, headers, headersGoogle };