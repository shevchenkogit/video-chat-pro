import React, { useContext, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Peer from "simple-peer";
import { useNavigate } from "react-router-dom";

// Components & Context
import { Video } from "../video/video"; 
import { chatActions } from "../../redux/slices/chatSlice";
import { friendsActions } from "../../redux/slices/friendsSlice";
import { FriendsForCall } from "../friends/friendsForCall";
import { AppContext } from "../..";

// Styles
import "./videoChat.css";

export const VideoChat = () => {
    const { socket } = useContext(AppContext);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // --- Конфігурація та Стейт ---
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const [layoutMode, setLayoutMode] = useState('grid'); 
    const [focusedPeer, setFocusedPeer] = useState('me'); 
    const [peers, setPeers] = useState([]);
    const [localStream, setLocalStream] = useState(null);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [showFriends, setShowFriends] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [cameraMode, setCameraMode] = useState('user');
    const [showControls, setShowControls] = useState(true);

    const [receivingCall, setReceivingCall] = useState(false);
    const [rCaller, setRCaller] = useState(null);
    const [newJoinRoomId, setNewJoinRoomId] = useState(null);

    // --- Рефи ---
    const myVideo = useRef();
    const peersRef = useRef([]);
    const screenTrackRef = useRef(null);
    const callTimerRef = useRef(null);
    const callSound = useRef(new Audio("/call.mp3"));
    const controlsTimeoutRef = useRef(null);

    // --- Дані з Redux/Storage ---
    const { joinRoomId } = useSelector(state => state.chat);
    const { allFriends, chat } = useSelector(state => state.friends);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem('ut');
    const roomId = joinRoomId || "default-room";

    // 1. Управління панеллю керування (автоприховування)
    const resetControlsTimeout = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (!showFriends) setShowControls(false);
        }, 5000);
    };

    // 2. Логіка вхідних дзвінків та подій сокетів
    useEffect(() => {
        if (!socket || !user) return;

        socket.on("newOnline", () => {
            dispatch(friendsActions.getUserFriends({ id: user.id, token: token }));
        });
        
        socket.on("recOffer", (data) => {
            callSound.current.loop = true;
            callSound.current.play().catch(e => console.log("Audio play error"));
            setRCaller(data.from);
            setNewJoinRoomId(data.roomName);
            setReceivingCall(true);

            if (callTimerRef.current) clearTimeout(callTimerRef.current);
            callTimerRef.current = setTimeout(() => {
                setReceivingCall(false);
                callSound.current.pause();
            }, 10000);
        });
    
        return () => {
            socket.off("recOffer");
            socket.off("newOnline");
        };
    }, [socket, user, token, dispatch]);

    // 3. Основна WebRTC логіка (Кімната та Піри)
    useEffect(() => {
        let currentStream = null;
        navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: cameraMode }, 
            audio: true 
        }).then((stream) => {
            currentStream = stream;
            setLocalStream(stream);
            if (myVideo.current) myVideo.current.srcObject = stream;
            
            socket.emit("join-room", roomId);
            dispatch(chatActions.setCallActive(true));

            socket.on("all-users", (users) => {
                users.forEach((userID) => {
                    const peer = createPeer(userID, socket.id, stream);
                    peersRef.current.push({ peerID: userID, peer });
                });
            });

            socket.on("user-joined", (payload) => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({ peerID: payload.callerID, peer });
            });

            socket.on("receiving-returned-signal", (payload) => {
                const item = peersRef.current.find((p) => p.peerID === payload.id);
                if (item) item.peer.signal(payload.signal);
            });

            socket.on("user-left", (id) => {
                const pObj = peersRef.current.find(p => p.peerID === id);
                if (pObj) pObj.peer.destroy();
                peersRef.current = peersRef.current.filter(p => p.peerID !== id);
                setPeers(prev => prev.filter(p => p.id !== id));
                if (focusedPeer === id) setFocusedPeer('me');
            });
        });

        return () => {
            dispatch(chatActions.setCallActive(false));
            if (currentStream) currentStream.getTracks().forEach(t => t.stop());
            if (screenTrackRef.current) screenTrackRef.current.stop();
            peersRef.current.forEach(p => p.peer.destroy());
            peersRef.current = [];
            setPeers([]);
            socket.off("all-users");
            socket.off("user-joined");
            socket.off("receiving-returned-signal");
            socket.off("user-left");
            socket.emit("leave-room", roomId);
        };
    }, [roomId, socket]);

    // --- Функції керування медіа ---

    function createPeer(userToCall, callerID, stream) {
        const peer = new Peer({ initiator: true, trickle: false, stream });
        peer.on("signal", signal => socket.emit("sending-signal", { userToCall, callerID, signal }));
        peer.on("stream", remoteStream => {
            setPeers(prev => {
                const exists = prev.find(p => p.id === userToCall);
                if (exists) return prev;
                return [...prev, { id: userToCall, stream: remoteStream }];
            });
        });
        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({ initiator: false, trickle: false, stream });
        peer.on("signal", signal => socket.emit("returning-signal", { signal, callerID }));
        peer.on("stream", remoteStream => {
            setPeers(prev => [...prev.filter(p => p.id !== callerID), { id: callerID, stream: remoteStream }]);
        });
        peer.signal(incomingSignal);
        return peer;
    }

    const toggleCamera = async () => {
        const nextMode = cameraMode === 'user' ? 'environment' : 'user';
        try {
            if (localStream) localStream.getVideoTracks().forEach(track => track.stop());
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: nextMode },
                audio: false 
            });
            const newVideoTrack = newStream.getVideoTracks()[0];
            const oldVideoTrack = localStream.getVideoTracks()[0];

            peersRef.current.forEach(({ peer }) => {
                peer.replaceTrack(oldVideoTrack, newVideoTrack, localStream);
            });

            localStream.removeTrack(oldVideoTrack);
            localStream.addTrack(newVideoTrack);
            myVideo.current.srcObject = localStream;
            setCameraMode(nextMode);
        } catch (err) { console.error("Camera error:", err); }
    };

    const startScreenShare = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ cursor: true });
            const screenTrack = stream.getTracks()[0];
            peersRef.current.forEach(({ peer }) => {
                peer.replaceTrack(localStream.getVideoTracks()[0], screenTrack, localStream);
            });
            myVideo.current.srcObject = stream;
            screenTrackRef.current = screenTrack;
            setIsScreenSharing(true);
            screenTrack.onended = stopScreenShare;
        } catch (e) { console.error(e); }
    };

    const stopScreenShare = () => {
        if (screenTrackRef.current) {
            screenTrackRef.current.stop();
            peersRef.current.forEach(({ peer }) => {
                peer.replaceTrack(screenTrackRef.current, localStream.getVideoTracks()[0], localStream);
            });
            myVideo.current.srcObject = localStream;
            setIsScreenSharing(false);
        }
    };

    const toggleLayout = () => {
        const modes = isMobile ? ['grid', 'pip'] : ['grid', 'speaker', 'pip'];
        setLayoutMode(modes[(modes.indexOf(layoutMode) + 1) % modes.length]);
    };

    const answerNewCall = () => {
        callSound.current.pause();
        socket.emit("cancelCall", { roomId, fromId: user.id, to: chat?.socketid });
        window.location.reload(); // Найбільш надійний спосіб для WebRTC при зміні кімнати
    };

    return (
        <div className="video-chat-container" onClick={resetControlsTimeout}>
            {receivingCall && (
                <div className="recivingCall">
                    <div className="caller-info">
                        <h2>{rCaller?.name} телефонує...</h2>
                    </div>
                    <div className="call-buttons">
                        <button className="btn-accept" onClick={answerNewCall}>Прийняти</button>
                        <button className="btn-decline" onClick={() => setReceivingCall(false)}>Відхилити</button>
                    </div>
                </div>
            )}

            <div className={`VideoFrames layout-${layoutMode} count-${peers.length + 1}`}>
                {peers.map((p) => (
                    <div className={`video-box ${focusedPeer === p.id ? 'focused' : 'minimized'}`} key={p.id} onClick={() => setFocusedPeer(p.id)}>
                        <Video stream={p.stream} />
                        <div className="user-label">Учасник</div>
                    </div>
                ))}
                
                <div className={`video-box my-video ${focusedPeer === 'me' ? 'focused' : 'minimized'}`} onClick={() => setFocusedPeer('me')}>
                    <video playsInline muted ref={myVideo} autoPlay className="VideoFrame" 
                        style={{ transform: (cameraMode === 'user' && !isScreenSharing) ? 'scaleX(-1)' : 'none' }}
                    />
                    {isMobile && showControls && (
                        <button className="switch-cam-floating" onClick={(e) => { e.stopPropagation(); toggleCamera(); }}>🔄</button>
                    )}
                    <div className="user-label">Ви</div>
                </div>
            </div>

            <div className={`ModernControlPanel ${showControls ? "visible" : "hidden"}`}>
                <div className="GlassButtons">
                    <button className={`btn-round ${!isMicOn ? "off" : ""}`} onClick={() => {
                        localStream.getAudioTracks()[0].enabled = !isMicOn;
                        setIsMicOn(!isMicOn);
                    }}>{isMicOn ? "🎤" : "🔇"}</button>
                    
                    <button className={`btn-round ${!isCameraOn ? "off" : ""}`} onClick={() => {
                        localStream.getVideoTracks()[0].enabled = !isCameraOn;
                        setIsCameraOn(!isCameraOn);
                    }}>{isCameraOn ? "📹" : "❌"}</button>
                    
                    <button className="btn-round" onClick={toggleLayout}>{layoutMode === 'grid' ? '🔳' : '🖼️'}</button>
                    <button className="btn-round" onClick={() => setShowFriends(!showFriends)}>{showFriends ? "✕" : "➕"}</button>

                    {!isMobile && (
                        <button className={`btn-round ${isScreenSharing ? "active-screen" : ""}`} onClick={isScreenSharing ? stopScreenShare : startScreenShare}>
                            🖥️
                        </button>
                    )}

                    <button className="btn-round end-call-btn" onClick={() => navigate("/")}>📞</button>
                </div>
            </div>

            <div className={`side-invite-menu ${showFriends ? "open" : ""}`}>
                 <h4>Запросити друзів</h4>
                 {allFriends?.friends?.map((data) => (
                    <FriendsForCall key={data.id} f={data} room={roomId} u={user} />
                 ))}
            </div>
        </div>
    );
};