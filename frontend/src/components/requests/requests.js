import React, { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Actions & Context
import { friendsActions } from "../../redux/slices/friendsSlice";
import { AppContext } from "../..";

// Styles
import "./requests.css";

/**
 * Request Component
 * Handles incoming/outgoing friend requests with Accept/Decline actions
 */
export const Request = ({ f: friendData }) => {
    const dispatch = useDispatch();
    const { socket } = useContext(AppContext);
    
    // Selectors & Local State
    const { msg } = useSelector(state => state.friends);
    const [showActions, setShowActions] = useState(true);

    const { name, id, status } = friendData;

    // Get auth data safely
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem('ut');

    const handleAdd = () => {
        if (!user.id || !token) return;

        dispatch(friendsActions.addOrCancel({ 
            id: user.id, 
            frId: id, 
            action: "add", 
            token: token 
        }));
        
        setShowActions(false);
        dispatch(friendsActions.getUserFriends({ id: user.id, token: token }));
        
        if (socket) socket.emit("logIn", id);
    };

    const handleCancel = () => {
        if (!user.id || !token) return;

        dispatch(friendsActions.addOrCancel({ 
            id: user.id, 
            frId: id, 
            action: "cancel", 
            token: token 
        }));
        
        setShowActions(false);
        if (socket) socket.emit("logIn", user.id);
    };

    return (
        <div className="request-item">
            <div className="friend-avatar-container">
                <div className="friend-avatar request-avatar">
                    {name ? name.charAt(0).toUpperCase() : "?"}
                </div>
                {name && (
                    <span className={`status-dot ${status ? "online" : "offline"}`} />
                )}
            </div>

            <div className="request-info">
                <div className="friend-name">{name}</div>
                
                {showActions ? (
                    <div className="request-actions">
                        <button className="btn-add" onClick={handleAdd}>Accept</button>
                        <button className="btn-cancel" onClick={handleCancel}>Decline</button>
                    </div>
                ) : (
                    <div className="request-msg">
                        {msg?.msg || "Success"}
                    </div>
                )}
            </div>
        </div>
    );
};