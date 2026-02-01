import React from 'react';
import { useDispatch } from "react-redux";
import { jwtDecode } from 'jwt-decode';

// Redux Actions
import { chatActions } from "../../redux/slices/chatSlice";
import { friendsActions } from "../../redux/slices/friendsSlice";

// Styles
import "./friends.css";

/**
 * Friend Component
 * Represents a single friend in the list and handles chat initiation
 */
export const Friend = ({ f: friendData }) => {
    const dispatch = useDispatch();
    const { name, id, status } = friendData;

    const handleChatOpen = () => {
        const token = localStorage.getItem('ut');
        
        // 1. Set active chat friend
        dispatch(friendsActions.chatWith(friendData));
        
        // 2. Reset unread messages counter for this friend
        dispatch(friendsActions.resetUnread(id));

        // 3. Load message history if token exists
        if (token) {
            try {
                const tokenBody = token.split(" ")[1] || token; 
                const decoded = jwtDecode(tokenBody);
                
                dispatch(chatActions.getAllChats({ 
                    uid: decoded.id, 
                    fid: id 
                }));
            } catch (error) {
                console.error("Token decoding error:", error);
            }
        }
    };

    return (
        <div className="friend-item" onClick={handleChatOpen}>
            <div className="friend-avatar-container">
                <div className="friend-avatar">
                    {name ? name.charAt(0).toUpperCase() : "?"}
                </div>
                <span className={`status-dot ${status ? "online" : "offline"}`} />
            </div>

            <div className="friend-info">
                <div className="friend-name">{name}</div>
                <div className={`friend-status-text ${status ? "status-online" : ""}`}>
                    {status ? "online" : "offline"}
                </div>
            </div>
        </div>
    );
};