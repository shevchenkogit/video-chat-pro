import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./slices/userSlice";
import { chatReducer } from "./slices/chatSlice";
import { friendsReducer } from "./slices/friendsSlice";

const rootReducer = combineReducers({
    user: userReducer,
    chat: chatReducer,
    friends: friendsReducer,
});

const setUpStorage = () => configureStore({
    reducer: rootReducer,
    // Додаємо middleware для ігнорування несеріалізованих даних
    // Це корисно, якщо ти випадково передаси об'єкт сокета або події в стейт
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ігноруємо певні екшени або шляхи, якщо там будуть складні об'єкти
                ignoredActions: ['chat/setSocket'], 
                ignoredPaths: ['chat.socket'],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production', // Вмикаємо DevTools тільки в розробці
});

// Створюємо екземпляр стору
const store = setUpStorage();

export {
    setUpStorage,
    store
};