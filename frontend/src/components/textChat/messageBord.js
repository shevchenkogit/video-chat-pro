import React, { useContext, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";

// Components & Logic
import { OneMessage } from "./oneMessage";
import { chatActions } from "../../redux/slices/chatSlice";
import { AppContext } from "../..";

/**
 * MessageBoard Component
 * Displays message history, handles real-time updates via Sockets,
 * and manages automatic scrolling to the latest messages.
 */
export const MessageBoard = () => {
    const dispatch = useDispatch();
    const { socket } = useContext(AppContext);
    
    // Selectors
    const chatData = useSelector(state => state.chat.allChats);
    const { chat: activeChat } = useSelector(state => state.friends);
    
    const messages = chatData?.messages || [];
    const messagesEndRef = useRef(null);
    const isFirstLoad = useRef(true);

    // Get current user data safely
    const currentUser = useMemo(() => {
        const token = localStorage.getItem('ut');
        return token ? jwtDecode(token.split(" ")[1]) : null;
    }, []);

    const token = localStorage.getItem('ut');

    // Scroll helper
    const scrollToBottom = (behavior = "auto") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    // 1. Initial Load: Fetch messages when active chat changes
    useEffect(() => {
        if (activeChat?.id && token && currentUser?.id) {
            dispatch(chatActions.getAllChats({ 
                uid: currentUser.id, 
                fid: activeChat.id, 
                token 
            }));
            isFirstLoad.current = true;
        }
    }, [activeChat?.id, dispatch, token, currentUser?.id]);

    // 2. Real-time updates: Listen for new messages and read status
    useEffect(() => {
        if (!socket) return;

        const refreshChat = () => {
            if (activeChat?.id && currentUser?.id) {
                dispatch(chatActions.getAllChats({ 
                    uid: currentUser.id, 
                    fid: activeChat.id, 
                    token 
                }));
            }
        };

        socket.on("reciv", (data) => {
            // Check if incoming message is from the person we are currently chatting with
            if (activeChat && activeChat.id === data.uid) {
                refreshChat();
            }
        });

        socket.on("messagesReadUpdate", (data) => {
            if (activeChat && activeChat.id === data.readerId) {
                refreshChat();
            }
        });

        return () => {
            socket.off("reciv");
            socket.off("messagesReadUpdate");
        };
    }, [socket, activeChat, dispatch, token, currentUser?.id]);

    // 3. Auto-scroll: Handle scrolling on new messages
    useEffect(() => {
        if (messages.length > 0) {
            if (isFirstLoad.current) {
                scrollToBottom("auto");
                isFirstLoad.current = false;
            } else {
                scrollToBottom("smooth");
            }
        }
    }, [messages]);

    return (
        <div className="message-area" style={{ overflowY: 'auto', height: '100%' }}>
            {messages.length > 0 ? (
                messages.map((msg, index) => (
                    <OneMessage 
                        key={msg.id || index} 
                        message={msg} 
                        myId={currentUser?.id} 
                    />
                ))
            ) : (
                <div className="no-messages">No messages yet. Start the conversation!</div>
            )}
            
            {/* Scroll Anchor */}
            <div ref={messagesEndRef} style={{ clear: "both" }} />
        </div>
    );
};