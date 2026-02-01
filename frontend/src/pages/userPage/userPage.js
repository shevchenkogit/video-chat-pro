import { useForm } from "react-hook-form";
import { useEffect, useState, useContext, useRef, useCallback } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

import { friendsActions } from "../../redux/slices/friendsSlice";
import { chatActions } from "../../redux/slices/chatSlice";
import { userActions } from "../../redux/slices/userSlice";
import { AppContext } from "../..";

import { Friend } from "../../components/friends/friends";
import { Request } from "../../components/requests/requests";
import { SearchRequest } from "../../components/searchRequest/searchRequest";
import { ChatInput } from "../../components/textChat/input";
import { MessageBoard } from "../../components/textChat/messageBord";

import "./userPage.css";

const msgSound = new Audio("/msg.mp3");
const callSound = new Audio("/call.mp3");
callSound.loop = true;

export const UserPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { socket } = useContext(AppContext);
    const { register, handleSubmit } = useForm();

    const { rCaller, joinRoomId, isCallActive } = useSelector(state => state.chat);
    const { isAuth } = useSelector(state => state.user);
    const { allFriends, requestFromSearch, chat } = useSelector(state => state.friends);

    const [receivingCall, setReceivingCall] = useState(false);
    const [use, setUse] = useState(null);
    const [endMessage, setEndMessage] = useState(null);
    const [isFriendTyping, setIsFriendTyping] = useState(false);

    const callTimerRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const token = localStorage.getItem('ut');
    const userData = JSON.parse(localStorage.getItem("user")) || {};

    // 1. Авторизація
    useEffect(() => {
        if (token) {
            try {
                const decodedUser = jwtDecode(token.includes(" ") ? token.split(" ")[1] : token);
                setUse(decodedUser);
                dispatch(userActions.authToken(token));
                if (socket) socket.emit("logIn", decodedUser.id);
            } catch (e) { navigate("/"); }
        } else if (!isAuth) {
            navigate("/");
        }
    }, [token, isAuth, socket, dispatch, navigate]);

    // 2. Отримання даних
    useEffect(() => {
        if (use?.id && token) {
            dispatch(friendsActions.getUserFriends({ id: use.id, token }));
        }
    }, [use?.id, token, dispatch]);

    // 3. Сокет-логіка
    useEffect(() => {
        if (!use || !socket) return;

        socket.on("displayTyping", (data) => {
            if (chat && String(chat.id) === String(data.fromUserId)) {
                setIsFriendTyping(data.isTyping);
                // Авто-скидання статусу через 3 секунди
                clearTimeout(typingTimeoutRef.current);
                if (data.isTyping) {
                    typingTimeoutRef.current = setTimeout(() => setIsFriendTyping(false), 3000);
                }
            }
        });

        socket.on("reciv", (data) => {
            if (chat && String(chat.id) === String(data.uid)) {
                dispatch(friendsActions.markMessagesAsRead({ uid: use.id, fid: chat.id, token }));
                dispatch(chatActions.getAllChats({ uid: use.id, fid: chat.id, token }));
                socket.emit("readMessage", { uid: use.id, fid: chat.id, toSocketId: data.senderSocketId });
            } else {
                msgSound.play().catch(() => {});
                dispatch(friendsActions.getUserFriends({ id: use.id, token }));
            }
        });

        socket.on("messagesReadUpdate", (data) => {
            if (chat && String(chat.id) === String(data.readerId)) {
                dispatch(chatActions.getAllChats({ uid: use.id, fid: chat.id, token }));
            }
            dispatch(friendsActions.getUserFriends({ id: use.id, token }));
        });

        socket.on("recOffer", (data) => {
            if (window.location.pathname === "/video_chat") return;
            callSound.play().catch(() => {});
            dispatch(chatActions.setCallActive(true));
            dispatch(chatActions.saveJoinRoomId(data.roomName));
            dispatch(chatActions.setCaller(data.from));
            setReceivingCall(true);

            if (callTimerRef.current) clearTimeout(callTimerRef.current);
            callTimerRef.current = setTimeout(() => {
                setReceivingCall(false);
                dispatch(friendsActions.addMissedCall({ senderId: data.from.id }));
            }, 10000);
        });

        socket.on("callWasCancelled", (data) => {
            callSound.pause();
            callSound.currentTime = 0;
            if (callTimerRef.current) clearTimeout(callTimerRef.current);
            setReceivingCall(false);
            dispatch(chatActions.setCallActive(false));
            setEndMessage("Чат завершився");
            setTimeout(() => setEndMessage(null), 5000);
        });

        return () => {
            socket.off("reciv");
            socket.off("displayTyping");
            socket.off("messagesReadUpdate");
            socket.off("recOffer");
            socket.off("callWasCancelled");
        };
    }, [use, socket, chat, token, dispatch]);

    // 4. Дії
    const call = () => {
        if (!chat || !use) return;
        const roomName = `room_${use.id}_${chat.id}`;
        dispatch(chatActions.saveJoinRoomId(roomName));
        socket.emit("invToRoom", { from: use, to: chat, roomName });
        navigate("/video_chat");
    };

    const declineCall = () => {
        callSound.pause();
        callSound.currentTime = 0;
        setReceivingCall(false);
        dispatch(chatActions.setCallActive(false));
        if (rCaller) socket.emit("declineCall", { toSocketId: rCaller.socketid, fromId: use.id });
    };

    return (
        <div className="page-wrapper">
            {receivingCall && isCallActive && rCaller && (
                <div className="recivingCall">
                    <div className="caller-info">
                        <h1>{rCaller.name} телефонує...</h1>
                    </div>
                    <div className="call-buttons">
                        <button className="btn-accept" onClick={() => navigate("/video_chat")}>Відповісти</button>
                        <button className="btn-decline" onClick={declineCall}>Відхилити</button>
                    </div>
                </div>
            )}

            <div className={`container ${chat ? "chat-active" : ""}`}>
                <div className="sidebar">
                    <div className="sidebar-header">
                        <div className="my-profile-info">
                            <div className="user-avatar-container">
                                {userData.picture ? <img src={userData.picture} alt="" className="user-main-avatar" /> : <div className="avatar-placeholder">{userData.name?.[0]}</div>}
                                <span className="my-status-dot online"></span>
                            </div>
                            <strong>{userData.name}</strong>
                        </div>
                        <form className="search-container" onSubmit={handleSubmit((d) => dispatch(friendsActions.searchFriends({ name: d.name.toLowerCase(), token })))}>
                            <input className="sidebar-search-input" placeholder="Пошук..." {...register("name")} />
                        </form>
                    </div>

                    <div className="chat-list">
                        {requestFromSearch?.length > 0 && (
                            <div className="section">
                                <h3 className="section-title">Глобальний пошук</h3>
                                {requestFromSearch.map(f => <SearchRequest key={f.id} f={f} />)}
                            </div>
                        )}
                        {allFriends?.requests?.length > 0 && (
                            <div className="section">
                                <h3 className="section-title">Запити</h3>
                                {allFriends.requests.map(f => <Request key={f.id} f={f} />)}
                            </div>
                        )}
                        <div className="section">
                            <h3 className="section-title">Друзі</h3>
                            {allFriends?.friends?.map(f => (
                                <div key={f.id} className="friend-item">
                                    <Friend f={f} />
                                    {f.unreadCount > 0 && <span className="unread-badge">{f.unreadCount}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="chat-area">
                    <div className="chat-header">
                        <button className="mobile-back-btn" onClick={() => dispatch(friendsActions.setChat(null))}>←</button>
                        <div className="chat-header-info">
                            <strong>{chat ? chat.name : "Оберіть чат"}</strong>
                            {isFriendTyping && <span className="typing-status">друкує...</span>}
                        </div>
                        {chat?.socketid && <button className="modern-call-btn" onClick={call}>📞</button>}
                    </div>

                    <div className="message-area">
                        {chat ? <MessageBoard /> : <div className="no-chat">Почніть спілкування</div>}
                        {endMessage && <div className="toast">{endMessage}</div>}
                    </div>
                    
                    {chat && <div className="message-input"><ChatInput /></div>}
                </div>
            </div>
        </div>
    );
};