import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { UserSr } from "../../services/user";

const initialState = {
    newUser: {},
    getToken: null, // Сюди приходять повідомлення типу "user not exist" або "need verification"
    myRoomId: "",
    joinRoomId: "",
    stream: [],
    error: null,
    isOnline: {},
    isAuth: null,
    OAuth2User: null,
    verefication: null,
    isLoading: false,
};

// --- Async Thunks ---

// 1. Звичайний логін
export const logIn = createAsyncThunk("userSlice/logIn", async (logData, { rejectWithValue }) => {
    try {
        const { data } = await UserSr.logIn(logData);
        if (data?.access_token) {
            localStorage.setItem("ut", `Bearer ${data.access_token}`);
        }
        return data;
    } catch (e) {
        return rejectWithValue(e.response?.data);
    }
});

// 2. Перевірка токена при завантаженні сторінки
export const authToken = createAsyncThunk("userSlice/authToken", async (_, { rejectWithValue }) => {
    try {
        const { data } = await UserSr.tokenAuth(); // Токен підставиться автоматично
        return !!data;
    } catch (e) {
        return rejectWithValue(false);
    }
});

// 3. Отримання даних профілю з Google API
export const OAuth2logIn = createAsyncThunk("userSlice/OAuth2logIn", async (token, { rejectWithValue }) => {
    try {
        const { data } = await UserSr.OAuth2LogIn(token);
        if (data) {
            localStorage.setItem("user", JSON.stringify(data));
            return data;
        }
    } catch (e) {
        return rejectWithValue(e.response?.data);
    }
});

// 4. Логін через Google на твій бекенд
export const logInWithGoogle = createAsyncThunk("userSlice/logInWithGoogle", async (cred, { rejectWithValue }) => {
    try {
        const { data } = await UserSr.LogInWithGoogle(cred);
        if (data?.access_token) {
            localStorage.setItem("ut", `Bearer ${data.access_token}`);
        }
        return data;
    } catch (e) {
        return rejectWithValue(e.response?.data);
    }
});

// 5. Верифікація пошти
export const emailVereficate = createAsyncThunk("userSlice/emailVereficate", async (token, { rejectWithValue }) => {
    try {
        const { data } = await UserSr.verefication(token);
        return !!data;
    } catch (e) {
        return rejectWithValue(e.response?.data);
    }
});

// Інші thunks (createNewUser, createNewUserWG тощо) залишаємо за аналогією...
export const createNewUser = createAsyncThunk("userSlice/createNewUser", async (user, { rejectWithValue }) => {
    try {
        const { data } = await UserSr.creat(user);
        return data;
    } catch (e) {
        return rejectWithValue(e.response?.data);
    }
});

const userSlice = createSlice({
    name: "userSlice",
    initialState,
    reducers: {
        saveMyRoomId: (state, action) => { state.myRoomId = action.payload },
        saveJoinRoomId: (state, action) => { state.joinRoomId = action.payload },
        clearError: (state) => { state.error = null },
        logout: (state) => {
            state.isAuth = false;
            state.getToken = null;
            state.OAuth2User = null;
            localStorage.removeItem("ut");
            localStorage.removeItem("user");
        }
    },
    extraReducers: builder => builder
        .addCase(logIn.fulfilled, (state, action) => {
            state.getToken = action.payload;
            if (action.payload?.access_token) state.isAuth = true;
        })
        .addCase(authToken.fulfilled, (state, action) => {
            state.isAuth = action.payload;
        })
        .addCase(OAuth2logIn.fulfilled, (state, action) => {
            state.OAuth2User = action.payload;
        })
        .addCase(logInWithGoogle.fulfilled, (state, action) => {
            state.getToken = action.payload;
            if (action.payload?.access_token) state.isAuth = true;
        })
        .addCase(emailVereficate.fulfilled, (state, action) => {
            state.verefication = action.payload;
        })
        .addCase(createNewUser.fulfilled, (state, action) => {
            state.getToken = action.payload;
        })
        // Глобальна обробка станів завантаження та помилок
        .addMatcher(action => action.type.endsWith('/pending'), (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addMatcher(action => action.type.endsWith('/fulfilled'), (state) => {
            state.isLoading = false;
        })
        .addMatcher(action => action.type.endsWith('/rejected'), (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
});

export const userReducer = userSlice.reducer;
export const userActions = {
    ...userSlice.actions,
    logIn,
    authToken,
    OAuth2logIn,
    logInWithGoogle,
    emailVereficate,
    createNewUser
};