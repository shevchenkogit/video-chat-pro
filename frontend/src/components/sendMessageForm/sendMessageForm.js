import React, { useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";

// Context & Styles
import { AppContext } from "../..";
import "./sendMessageForm.css";

/**
 * SendMessageForm Component
 * Handles message input and emission via Socket.io
 */
export const SendMessageForm = () => {
    const { socket } = useContext(AppContext);
    const { chat } = useSelector(state => state.friends);
    
    const { register, handleSubmit, reset } = useForm();

    // Handle message submission
    const onSubmit = (data) => {
        if (!data.message?.trim() || !chat?.id) return;

        // Emit message to server
        // Logic: from current user to the active chat partner
        socket.emit("sm", {
            to: chat.id,        // Assuming 'id' is the recipient identifier
            m: data.message     // The actual text content
        });

        console.log("Message sent:", data.message);
        reset(); // Clear input after sending
    };

    // Debugging active chat changes
    useEffect(() => {
        if (chat) {
            console.log("Active chat switched to:", chat);
        }
    }, [chat]);

    return (
        <div className="allg">
            <form className="formg" onSubmit={handleSubmit(onSubmit)}>
                <div className="left">
                    <input 
                        className="inputG" 
                        placeholder="Type a message..." 
                        {...register("message", { required: true })} 
                    />
                </div>
                <div className="right">
                    <button type="submit" className="buttonG">
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};