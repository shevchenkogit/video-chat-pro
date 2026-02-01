import React, { useContext, useState } from "react";
import { AppContext } from "../..";

// Styles
import "./friendsForCall.css";

/**
 * FriendsForCall Component
 * Handles inviting friends to a specific call room via Socket.io
 */
export const FriendsForCall = ({ f: friend, room, u: currentUser }) => {
    const { socket } = useContext(AppContext);
    
    // UI state for invitation feedback
    const [isInvited, setIsInvited] = useState(false);

    const { name = "Unknown", status, picture } = friend;

    const handleCallInvite = async (e) => {
        // Prevent event bubbling to parent containers
        e.stopPropagation(); 
        
        if (socket) {
            socket.emit("invToRoom", { 
                from: currentUser, 
                to: friend, 
                roomName: room 
            });
            
            // Temporary visual feedback
            setIsInvited(true);
            setTimeout(() => setIsInvited(false), 3000);
        }
    };

    return (
        <div className="friend-call-card">
            <div className="friend-avatar-wrapper">
                {picture ? (
                    <img src={picture} alt={name} className="friend-avatar-img" />
                ) : (
                    <div className="friend-avatar-initials">
                        {name.charAt(0).toUpperCase()}
                    </div>
                )}
                <div className={`status-indicator ${status ? "online" : "offline"}`} />
            </div>

            <div className="friend-details">
                <span className="friend-name-text">{name}</span>
                <span className="friend-status-label">
                    {status ? "Online" : "Offline"}
                </span>
            </div>

            <button 
                className={`invite-action-btn ${isInvited ? "sent" : ""}`} 
                onClick={handleCallInvite}
                disabled={isInvited || !status} // Optional: disable if friend is offline
                title={isInvited ? "Invitation sent" : "Invite to call"}
            >
                {isInvited ? "✓" : "+"}
            </button>
        </div>
    );
};