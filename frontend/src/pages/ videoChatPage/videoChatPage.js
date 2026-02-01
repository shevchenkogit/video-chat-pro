import React, { useEffect } from "react";
import { VideoChat } from "../../components/videoChat/videoChat";

/**
 * VideoChatPage Component
 * Acts as a full-screen layout container for the VideoChat system.
 */
export const VideoChatPage = () => {
    
    // Прибираємо прокрутку сторінки, поки користувач у відеочаті
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    return (
        <div className="video-chat-page-wrapper" style={{ width: '100vw', height: '100vh' }}>
            <VideoChat />
        </div>
    );
};