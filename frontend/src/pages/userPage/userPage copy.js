import { useForm } from "react-hook-form";
import "./userPage.css";
import { useEffect, useState, useContext, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { friendsActions } from "../../redux/slices/friendsSlice";
import { Friend } from "../../components/friends/friends";
import { jwtDecode } from 'jwt-decode';
import { chatActions } from "../../redux/slices/chatSlice";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../..";
import { userActions } from "../../redux/slices/userSlice";
import { Request } from "../../components/requests/requests";
import { SearchRequest } from "../../components/searchRequest/searchRequest";
import { ChatInput } from "../../components/textChat/input";
import { MessageBoard } from "../../components/textChat/messageBord";

// Поза компонентом UserPage
const msgSound = new Audio("/msg.mp3");
const callSound = new Audio("/call.mp3");
callSound.loop = true; // Дзвінок має повторюватися

export const UserPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { socket } = useContext(AppContext);
    const { register, handleSubmit } = useForm();

    const { rCaller, joinRoomId, isCallActive, allChats } = useSelector(state => state.chat);
    const { isAuth } = useSelector(state => state.user);
    const { allFriends, requestFromSearch, chat } = useSelector(state => state.friends);

    const [receivingCall, setReceivingCall] = useState(false);
    const [showJoinButton, setShowJoinButton] = useState(false);
    const [use, setUse] = useState(null);
    const [endMessage, setEndMessage] = useState(null);
    const [isFriendTyping, setIsFriendTyping] = useState(false);

    const callTimerRef = useRef(null);
    const userData = JSON.parse(localStorage.getItem("user")) || {};
    const token = localStorage.getItem('ut');

    // 1. Авторизація та ініціалізація
    useEffect(() => {
        if (token) {
            try {
                const decodedUser = jwtDecode(token.split(" ")[1]);
                setUse(decodedUser);
                dispatch(userActions.authToken(token));
                socket.emit("logIn", decodedUser.id);
            } catch (e) {
                navigate("/");
            }
        } else if (!isAuth) {
            navigate("/");
        }
    }, [token, dispatch, navigate, socket]);

    // 2. Отримання друзів
    useEffect(() => {
        if (use?.id && token) {
            dispatch(friendsActions.getUserFriends({ id: use.id, token: token }));
        }
    }, [use?.id, token, dispatch]);

    // 3. Основна сокет-логіка
    useEffect(() => {
        if (!use || !socket) return;

        // Очистка перед підпискою
        socket.off("reciv");
        socket.off("newOnline");
        socket.off("recOffer");
        socket.off("callWasCancelled");
        socket.off("displayTyping");
        socket.off("messagesReadUpdate");

        // Хтось друкує
        socket.on("displayTyping", (data) => {
            // ПЕРЕВІРКА ЗА ID КОРИСТУВАЧА (стабільна після F5)
            if (chat && String(chat.id) === String(data.fromUserId)) {
                setIsFriendTyping(data.isTyping);
            }
        });

        socket.on("reciv", (data) => {
            if (chat && String(chat.id) === String(data.uid)) {
                // Ми в чаті — читаємо і оновлюємо повідомлення
                dispatch(friendsActions.markMessagesAsRead({ uid: use.id, fid: chat.id, token }));
                dispatch(chatActions.getAllChats({ uid: use.id, fid: chat.id, token }));
                socket.emit("readMessage", { uid: use.id, fid: chat.id, toSocketId: data.senderSocketId });
            } else {

                msgSound.play().catch(e => console.log("User interaction required for audio"));
                // ЯКЩО ЧАТ НЕ ВІДКРИТИЙ — замість простого incrementUnread
                // робимо повне оновлення друзів з сервера
                dispatch(friendsActions.getUserFriends({ id: use.id, token: token }));
                
                // (Опціонально) можна залишити incrementUnread для миттєвої реакції, 
                // але getUserFriends все одно прийде і замінить його точними даними
            }
        });
        // Нове повідомлення
        // socket.on("reciv", (data) => {
        //     if (chat && String(chat.id) === String(data.uid)) {
        //         // Якщо ми в чаті — читаємо і оновлюємо повідомлення
        //         dispatch(friendsActions.markMessagesAsRead({ uid: use.id, fid: chat.id, token }));
        //         dispatch(chatActions.getAllChats({ uid: use.id, fid: chat.id, token }));
        //         // Шлемо сигнал прочитання відправнику
        //         socket.emit("readMessage", { uid: use.id, fid: chat.id, toSocketId: data.senderSocketId });
        //     } else {
        //         // Якщо чат не відкритий — збільшуємо лічильник
        //         dispatch(friendsActions.incrementUnread(data.uid));
        //     }
        // });

        // Підтвердження прочитання (для галочок)
        socket.on("messagesReadUpdate", (data) => {
            // Оновлюємо чат, щоб зникли "одинички" або з'явилися "галочки"
            if (chat && String(chat.id) === String(data.readerId)) {
                dispatch(chatActions.getAllChats({ uid: use.id, fid: chat.id, token }));
            }
            // Оновлюємо список друзів, щоб синхронізувати лічильники в боковій панелі
            dispatch(friendsActions.getUserFriends({ id: use.id, token: token }));
        });

        socket.on("newOnline", () => {
            dispatch(friendsActions.getUserFriends({ id: use.id, token: token }));
        });

        socket.on("recOffer", (data) => {

            if (window.location.pathname === "/video_chat") return;

            callSound.play().catch(e => console.log("Audio play error"));

            dispatch(chatActions.setCallActive(true));
            dispatch(chatActions.saveJoinRoomId(data.roomName));
            dispatch(chatActions.setCaller(data.from));
            setReceivingCall(true);

            if (callTimerRef.current) clearTimeout(callTimerRef.current);
            callTimerRef.current = setTimeout(() => {
                setReceivingCall(false);
                setShowJoinButton(true); 
                dispatch(friendsActions.addMissedCall({ senderId: data.from.id }));
            }, 10000);
        });

        socket.on("callWasCancelled", (data) => {
            callSound.pause(); // Зупиняємо звук
            callSound.currentTime = 0;

            if (callTimerRef.current) clearTimeout(callTimerRef.current);
            setReceivingCall(false);
            dispatch(chatActions.setCallActive(false)); 
            if (data.fromId) dispatch(friendsActions.addMissedCall({ senderId: data.fromId}));
            setEndMessage("Чат завершився");
            setTimeout(() => setEndMessage(null), 5000);
        });

        return () => {
            socket.off("reciv");
            socket.off("newOnline");
            socket.off("recOffer");
            socket.off("callWasCancelled");
            socket.off("displayTyping");
            socket.off("messagesReadUpdate");
        };
    }, [use, socket, chat, token, dispatch]);

    // 4. Логіка при відкритті/зміні чату
    useEffect(() => {
        if (chat && chat.id && use?.id && token) {
            setIsFriendTyping(false); // Скидаємо статус "друкує" при зміні чату
            // dispatch(friendsActions.markMessagesAsRead({ uid: use.id, fid: chat.id, token }));
            if (chat?.id && use?.id) {
                // Позначаємо як прочитані
                dispatch(friendsActions.markMessagesAsRead({ uid: use.id, fid: chat.id, token }))
                    .then(() => {
                        // Оновлюємо список друзів, щоб лічильник зник
                        dispatch(friendsActions.getUserFriends({ id: use.id, token }));
                    });
            }
            // dispatch(friendsActions.markMessagesAsRead({ uid: use.id, fid: chat.id, token }))
            // .then(() => {
            //     // 2. Тільки після успішного запису у файл оновлюємо список друзів,
            //     // щоб сервер повернув unreadCount: 0 для цього чату
            //     dispatch(friendsActions.getUserFriends({ id: use.id, token: token }));
            // });
            // dispatch(friendsActions.resetUnread(chat.id));
            
            // Якщо є socketid друга, кажемо йому що ми прочитали все старе
            if (chat.socketid) {
                socket.emit("readMessage", { uid: use.id, fid: chat.id, toSocketId: chat.socketid });
            }
        }
    }, [chat?.id]);

    const searchFriends = async (data) => {
        const formattedName = data.name ? data.name.trim().toLowerCase() : "";
        dispatch(friendsActions.searchFriends({ name: formattedName, token: token }));
    };

    const answer = () => {
        callSound.pause(); // Зупиняємо звук
        callSound.currentTime = 0;

        if (callTimerRef.current) clearTimeout(callTimerRef.current);
        setReceivingCall(false);
        if (joinRoomId) navigate("/video_chat");
    };

    const call = async () => {
        if (!chat || !use) return;
        const roomName = `${chat.name}__${use.name}`;
        dispatch(chatActions.saveJoinRoomId(roomName));
        socket.emit("invToRoom", { from: use, to: chat, roomName: roomName });
        navigate("/video_chat");
    };

    const closeChat = () => {
        if (chat) {
            dispatch(friendsActions.setChat(null));
        }
    };

    const declineCall = () => {

        callSound.pause(); // Зупиняємо звук
    callSound.currentTime = 0;

        if (callTimerRef.current) clearTimeout(callTimerRef.current);
        setReceivingCall(false);
        dispatch(chatActions.setCallActive(false));
        if (rCaller) socket.emit("declineCall", { toSocketId: rCaller.socketid, fromId: use.id });
    };

    return (
        <div className="page-wrapper">
            {receivingCall && isCallActive && rCaller && (
                <div className="recivingCall">
                    <div className="caller-info">
                        <h1>{rCaller.name} запрошує вас</h1>
                    </div>
                    <div className="call-buttons">
                        <button className="btn-accept" onClick={answer}>Приєднатися</button>
                        <button className="btn-decline" onClick={declineCall}>Відхилити</button>
                    </div>
                </div>
            )}

            <div className={`container ${chat ? "chat-active" : ""}`}>
                <div className="sidebar">
                    <div className="sidebar-header">
                        <div className="my-profile-info">
                            <div className="user-avatar-container">
                                {userData.picture && <img src={userData.picture} alt="Me" className="user-main-avatar" />}
                                <span className="my-status-dot online"></span>
                            </div>
                            <div className="user-name-display"><strong>{userData.name}</strong></div>
                        </div>
                        <div className="search-container">
                            <form className="search-form" onSubmit={handleSubmit(searchFriends)}>
                                <input className="sidebar-search-input" placeholder="Пошук людей..." {...register("name")} />
                            </form>
                        </div>
                    </div>

                    <div className="chat-list">
                        {requestFromSearch?.length > 0 && (
                            <div className="section-container">
                                <h3 className="section-title">Глобальний пошук</h3>
                                {requestFromSearch.map((data) => <SearchRequest key={data.id} f={data} />)}
                            </div>
                        )}

                        {allFriends?.requests?.length > 0 && (
                            <div className="section-container">
                                <h3 className="section-title">Запити</h3>
                                {allFriends.requests.map((data, index) => <Request key={index} f={data} />)}
                            </div>
                        )}

                        <div className="section-container">
                            <h3 className="section-title">Друзі</h3>
                            {allFriends?.friends?.map((data) => (
    <div key={data.id} className="friend-list-item-wrapper">
        <Friend f={data} />
        <div className="badges-container">
            {/* Це значення тепер завжди приходитиме з сервера при завантаженні */}
            {data.unreadCount > 0 && <span className="unread-badge">{data.unreadCount}</span>}
        </div>
    </div>
))}
                        </div>
                    </div>
                </div>

                <div className="chat-area">
                    <div className="chat-header">
                        <button className="mobile-back-btn" onClick={closeChat}>←</button>
                        <div className="chat-title">
                            {chat ? (
                                <div className="chat-header-info">
                                    <strong>{chat.name}</strong>
                                    {isFriendTyping && <span className="typing-status">друкує...</span>}
                                </div>
                            ) : (
                                <strong>Оберіть чат</strong>
                            )}
                        </div>
                        {chat && chat.socketid && <button className="modern-call-btn" onClick={call}>📞</button>}
                    </div>

                    <div className="message-area">
                        {chat ? (
                            <>
                                <MessageBoard />
                                {endMessage && <div className="call-ended-toast">{endMessage}</div>}
                            </>
                        ) : (
                            <div className="no-chat-placeholder">Оберіть друга для спілкування</div>
                        )}
                    </div>
                    
                    <div className="message-input">
                        {chat && <ChatInput />}
                    </div>
                </div>
            </div>
        </div>
    );
};