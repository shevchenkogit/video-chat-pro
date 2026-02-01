import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { UserSr } from "../../services/user";

const initialState = {
    newFriends: [],
    requestFromSearch: null,
    allFriends: { friends: [] },
    error: null,
    msg: null,
    chat: null,
}

// 1. Скидання лічильника на сервері
export const markMessagesAsRead = createAsyncThunk(
    "friendsSlice/markAsRead", 
    async ({ uid, fid }, { rejectWithValue }) => {
        try {
            await UserSr.markAsRead(uid, fid); 
            return fid; 
        } catch (e) {
            return rejectWithValue(e.response?.data);
        }
    }
);

// 2. Отримання списку друзів (токен береться автоматично з axiosService)
export const getUserFriends = createAsyncThunk(
    "friendsSlice/getUserFriends", 
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await UserSr.userFriendsById(id);
            return data;
        } catch (e) {
            return rejectWithValue(e.response?.data);
        }
    }
);

// 3. Запит у друзі
export const addOrCancel = createAsyncThunk(
    "friendsSlice/addOrCancel", 
    async (changeReq, { rejectWithValue }) => {
        try {
            const { data } = await UserSr.addOrCancel(changeReq);
            return data;
        } catch (e) {
            return rejectWithValue(e.response?.data);
        }
    }
);

// 4. Глобальний пошук
export const searchFriends = createAsyncThunk(
    "friendsSlice/searchFriends", 
    async (name, { rejectWithValue }) => {
        try {
            const { data } = await UserSr.findFriends(name);
            return data;
        } catch (e) {
            return rejectWithValue(e.response?.data);
        }
    }
);

const friendsSlice = createSlice({
    name: "friendsSlice",
    initialState,
    reducers: {
        setChat: (state, action) => {
            state.chat = action.payload;
        },
        incrementUnread: (state, action) => {
            const friend = state.allFriends?.friends?.find(f => String(f.id) === String(action.payload));
            if (friend) {
                friend.unreadCount = (friend.unreadCount || 0) + 1;
            }
        },
        resetUnread: (state, action) => {
            const friend = state.allFriends?.friends?.find(f => String(f.id) === String(action.payload));
            if (friend) {
                friend.unreadCount = 0;
                friend.hasMissedCall = false;
            }
        },
        addMissedCall: (state, action) => {
            const friend = state.allFriends?.friends?.find(f => String(f.id) === String(action.payload.senderId));
            if (friend) {
                friend.hasMissedCall = true;
            }
        }
    },
    extraReducers: builder => builder
        .addCase(getUserFriends.fulfilled, (state, action) => {
            state.allFriends = action.payload;
        })
        .addCase(markMessagesAsRead.fulfilled, (state, action) => {
            const friend = state.allFriends?.friends?.find(f => String(f.id) === String(action.payload));
            if (friend) {
                friend.unreadCount = 0;
            }
        })
        .addCase(addOrCancel.fulfilled, (state, action) => {
            state.msg = action.payload;
        })
        .addCase(searchFriends.fulfilled, (state, action) => {
            state.requestFromSearch = action.payload;
        })
});

const { reducer: friendsReducer, actions } = friendsSlice;

const friendsActions = {
    ...actions,
    getUserFriends,
    addOrCancel,
    searchFriends,
    markMessagesAsRead
};

export { friendsActions, friendsReducer };