import React from "react";

// Styles
import "./oneMessage.css";

/**
 * OneMessage Component
 * Renders an individual message bubble with status indicators for sent/read.
 */
export const OneMessage = ({ message, myId }) => {
    const { uid, text, date, isRead } = message;

    // Determine if the message belongs to the current user
    const isOwn = String(uid) === String(myId);

    // Format time safely
    const formattedTime = date 
        ? new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        : "";

    return (
        <div className={`message-wrapper ${isOwn ? "own" : "friend"}`}>
            <div className="message-bubble">
                <div className="message-text">{text}</div>
                
                <div className="message-info">
                    {formattedTime && (
                        <span className="message-time">{formattedTime}</span>
                    )}

                    {/* Status indicators for outgoing messages only */}
                    {isOwn && (
                        <div className={`message-status ${isRead ? "read" : "sent"}`}>
                            {isRead ? (
                                // Double checkmark (Read)
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path 
                                        d="M2 12L7 17L18 6M7 17L22 2M12 12L17 7" 
                                        stroke="currentColor" 
                                        strokeWidth="2.5" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            ) : (
                                // Single checkmark (Sent)
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path 
                                        d="M4 12L10 18L20 6" 
                                        stroke="currentColor" 
                                        strokeWidth="2.5" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};