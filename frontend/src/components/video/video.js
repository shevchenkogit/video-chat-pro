import React, { useEffect, useRef } from "react";

/**
 * Video Component
 * Safely attaches a MediaStream to a video element.
 */
export const Video = ({ stream, isLocal = false }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        const videoElement = videoRef.current;
        
        if (videoElement && stream) {
            videoElement.srcObject = stream;
        }

        // Cleanup: remove srcObject when component unmounts or stream changes
        return () => {
            if (videoElement) {
                videoElement.srcObject = null;
            }
        };
    }, [stream]);

    return (
        <video
            ref={videoRef}
            className="VideoFrame"
            autoPlay
            playsInline
            // Muted is often required for autoPlay to work reliably, 
            // especially for local previews.
            muted={isLocal} 
        />
    );
};