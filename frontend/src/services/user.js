import axios from 'axios';
import { axiosService } from "./axiosService";
import { endpoints, headersGoogle } from "../configs/urls";

const UserSr = {
    // 1. Реєстрація та логін (Токен ще не потрібен)
    creat: (data) => axiosService.post(endpoints.create, data),
    creatWG: (data) => axiosService.post(endpoints.createWG, data),
    logIn: (data) => axiosService.post(endpoints.logIn, data),  

    // 2. Google OAuth (Прямий запит до API Google)
    OAuth2LogIn: (token) => axios.get(`${endpoints.googleToken}${token}`, headersGoogle(token)),
    LogInWithGoogle: (data) => axiosService.post(endpoints.googleAuth, data),

    // 3. Авторизація та Верифікація
    tokenAuth: () => axiosService.get(endpoints.isValid), // Токен підставиться автоматично
    verefication: (token) => axiosService.get(`${endpoints.verefication}?token=${token}`),

    // 4. Друзі та Пошук
    userFriendsById: (id) => axiosService.get(`${endpoints.friends}?id=${id}`),
    findFriends: (name) => axiosService.get(`${endpoints.friends + endpoints.find}?name=${name}`),   
    addOrCancel: (data) => axiosService.post(endpoints.friends + endpoints.addOCancel, data),

    // 5. Чати та Повідомлення
    getChat: (uid, fid) => axiosService.get(`${endpoints.chat}?uid=${uid}&fid=${fid}`),
    markAsRead: (uid, fid) => axiosService.get(`${endpoints.chat + endpoints.read}?uid=${uid}&fid=${fid}`),   
}

export { UserSr };