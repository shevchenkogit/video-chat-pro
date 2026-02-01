import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { UserSr } from "../../services/user";

const initialState = {
    newChat: null,
    callstat: false,
    joinRoomId: "",
    rCaller: null, 
    rCallerSignal: [],
    rAnswerCall: false,
    addRoomId: "",
    arrOfMedias: [],
    isCallActive: false,
    allChats: { messages: [], unreadCount: 0 },
};

// Отримання повідомлень чату
export const getAllChats = createAsyncThunk(
    "chatSlice/getAllChats",
    async ({ uid, fid }, { rejectWithValue }) => {
        try {
            // Токен підставиться автоматично в axiosService
            const { data } = await UserSr.getChat(uid, fid);
            return data;
        } catch (e) {
            return rejectWithValue(e.response?.data);
        }
    }
);

// Позначення як прочитане
export const markMessagesAsRead = createAsyncThunk(
    "chatSlice/markAsRead", 
    async ({ uid, fid }, { rejectWithValue }) => {
        try {
            const { data } = await UserSr.markAsRead(uid, fid); 
            return data; // Зазвичай повертає оновлений об'єкт чату або масив повідомлень
        } catch (e) {
            return rejectWithValue(e.response?.data);
        }
    }
);

const chatSlice = createSlice({
    name: "chatSlice",
    initialState,
    reducers: {
        changecallstat: (state, action) => { state.callstat = action.payload },
        setCaller: (state, action) => { state.rCaller = action.payload },
        setCallerSignal: (state, action) => { state.rCallerSignal = action.payload },
        saveJoinRoomId: (state, action) => { state.joinRoomId = action.payload },
        saveAddRoomId: (state, action) => { state.addRoomId = action.payload },
        setAnswerCall: (state, action) => { state.rAnswerCall = action.payload },
        addMediaToChat: (state, action) => { state.arrOfMedias = action.payload },
        setCallActive: (state, action) => { state.isCallActive = action.payload },
        
        // Додавання нового повідомлення в реальному часі (через сокети)
        pushMessage: (state, action) => {
            if (state.allChats && state.allChats.messages) {
                state.allChats.messages.push(action.payload);
            } else {
                state.allChats = { messages: [action.payload], unreadCount: 0 };
            }
        },
        // Очищення даних при виході з чату
        resetChat: (state) => {
            state.allChats = { messages: [], unreadCount: 0 };
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllChats.fulfilled, (state, action) => {
                state.allChats = action.payload;
            })
            .addCase(markMessagesAsRead.fulfilled, (state, action) => {
                // Оновлюємо чат (скидаємо візуальні позначки непрочитаних)
                state.allChats = action.payload;
            });
    }
});

export const chatReducer = chatSlice.reducer;

export const chatActions = {
    ...chatSlice.actions,
    getAllChats,
    markMessagesAsRead
};