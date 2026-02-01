import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import EmojiPicker from 'emoji-picker-react';

// Actions & Context
import { chatActions } from "../../redux/slices/chatSlice";
import { AppContext } from "../..";


/**
 * ChatInput Component
 * Handles message composition, emoji selection, auto-resizing textarea,
 * and real-time "typing" status.
 */
export const ChatInput = () => {
    const dispatch = useDispatch();
    const { socket } = useContext(AppContext);
    const { chat } = useSelector(state => state.friends);
    
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const textareaRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const { register, handleSubmit, reset, watch, setValue } = useForm();
    const { ref, ...messageRegister } = register("message");
    const currentMessage = watch("message") || "";

    // Memoized User Data from Token
    const currentUser = useMemo(() => {
        const token = localStorage.getItem('ut');
        return token ? jwtDecode(token.split(" ")[1]) : null;
    }, []);

    // 1. Typing Status Logic
    const handleInput = (e) => {
        const target = e.target;
        
        // Auto-resize height
        target.style.height = "inherit";
        target.style.height = `${target.scrollHeight}px`;

        // Emit typing status
        if (socket && chat?.id && currentUser?.id) {
            socket.emit("typing", { 
                toUserId: chat.id, 
                fromUserId: currentUser.id, 
                isTyping: true 
            });

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

            typingTimeoutRef.current = setTimeout(() => {
                socket.emit("typing", { 
                    toUserId: chat.id, 
                    isTyping: false 
                });
            }, 2000);
        }
    };

    // 2. Message Submission
    const onSubmit = async (data) => {
        if (!data.message?.trim() || !chat?.id || !currentUser?.id) return;
        
        const token = localStorage.getItem('ut');

        // Stop typing status immediately
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socket.emit("typing", { toUserId: chat.id, isTyping: false });

        // Refresh chat history locally
        dispatch(chatActions.getAllChats({ 
            uid: currentUser.id, 
            fid: chat.id, 
            token 
        }));
        
        // Send message via socket
        socket.emit("sendMessage", { 
            to: chat.socketid, 
            message: data.message, 
            from: currentUser.name, 
            uid: currentUser.id, 
            fid: chat.id 
        });

        reset();
        setShowEmojiPicker(false);
        if (textareaRef.current) textareaRef.current.style.height = "40px"; 
    };

    // 3. Helpers
    const onEmojiClick = (emojiData) => {
        setValue("message", currentMessage + emojiData.emoji);
        
        if (textareaRef.current) {
            textareaRef.current.focus();
            // Trigger auto-resize after emoji insertion
            handleInput({ target: textareaRef.current });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(onSubmit)();
        }
    };

    // 4. Click Outside Listener for Emoji Picker
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showEmojiPicker && !event.target.closest(".chat-input-container")) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showEmojiPicker]);

    return (
        <div className="chat-input-container">
            {showEmojiPicker && (
                <div className="emoji-picker-wrapper">
                    <EmojiPicker 
                        onEmojiClick={onEmojiClick} 
                        autoFocusSearch={false}
                        width="100%"
                        height={350}
                    />
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="chat-input-form">
                <button 
                    type="button" 
                    className="emoji-toggle-button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    aria-label="Open emoji picker"
                >
                    😊
                </button>

                <textarea 
                    {...messageRegister}
                    ref={(e) => {
                        ref(e);
                        textareaRef.current = e;
                    }}
                    rows="1"
                    placeholder="Type a message..." 
                    className="chat-textarea"
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                />
                
                <button type="submit" className="send-button" disabled={!currentMessage.trim()}>
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                </button>
            </form>
        </div>
    );
};