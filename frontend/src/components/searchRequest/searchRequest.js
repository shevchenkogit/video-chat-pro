import React, { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Actions & Context
import { friendsActions } from "../../redux/slices/friendsSlice";
import { AppContext } from "../..";

// Styles
import "./searchRequest.css";

/**
 * SearchRequest Component
 * Displays a user found via search and allows sending a friend request.
 */
export const SearchRequest = ({ f: friendData }) => {
    const dispatch = useDispatch();
    const { socket } = useContext(AppContext);
    
    // UI State
    const [isSent, setIsSent] = useState(false);
    const { msg } = useSelector(state => state.friends);
    
    const { name, id, status } = friendData;

    // Local Storage Data
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem('ut');

    const handleAddFriend = () => {
        if (!user.id || !token) return;

        // Sending the request
        dispatch(friendsActions.addOrCancel({ 
            id: id, 
            frId: user.id, 
            action: "addReq", 
            token: token 
        }));

        setIsSent(true);
        
        // Refreshing friend list and notifying via socket
        dispatch(friendsActions.getUserFriends({ id: user.id, token: token }));
        
        if (socket) {
            socket.emit("logIn", id);
        }
    };

    return (
        <div className="search-item">
            <div className="friend-avatar-container">
                <div className="friend-avatar search-avatar">
                    {name ? name.charAt(0).toUpperCase() : "?"}
                </div>
                {status !== undefined && (
                    <span className={`status-dot ${status ? "online" : "offline"}`} />
                )}
            </div>

            <div className="search-info">
                <div className="friend-name">{name}</div>
                
                {!isSent ? (
                    <div className="search-actions">
                        <button className="btn-add-search" onClick={handleAddFriend}>
                            Add Friend
                        </button>
                    </div>
                ) : (
                    <div className="search-msg">
                        {msg?.msg || "Request sent"}
                    </div>
                )}
            </div>
        </div>
    );
};