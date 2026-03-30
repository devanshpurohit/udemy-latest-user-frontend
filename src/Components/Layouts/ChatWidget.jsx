import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaTimes, FaComments, FaUser, FaCircle, FaSpinner } from 'react-icons/fa';
import { getMessages, createOrGetConversation } from '../../services/conversationService';
import { getCurrentUser } from '../../services/apiService';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import './ChatWidget.css';

const ChatWidget = () => {
    const { user, isAuthenticated } = useAuth();
    const socket = useSocket();
    

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [conversation, setConversation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [adminOnline, setAdminOnline] = useState(true);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        const handleToggle = () => setIsOpen(prev => !prev);
        window.addEventListener('toggleChat', handleToggle);
        return () => window.removeEventListener('toggleChat', handleToggle);
    }, []);

    // 📡 Handle Join on Mount if socket changes
    useEffect(() => {
        if (socket && user) {
            socket.emit('join', user._id || user.id);
        }
    }, [socket, user]);

    // 📡 Update receiveMessage listener whenever conversation changes to avoid stale closure
    useEffect(() => {
        if (!socket) return;

        const handleReceive = (msg) => {
            console.log('📥 ChatWidget received message:', msg);
            const currentConvoId = (conversation?._id || conversation?.id)?.toString();
            console.log('📥 ChatWidget Comparison:', { msgConvo: msg.conversationId?.toString(), currentConvo: currentConvoId });
            
            if (currentConvoId && msg.conversationId.toString() === currentConvoId) {
                setMessages(prev => {
                    if (prev.some(m => (m._id || m.id) === (msg._id || msg.id))) return prev;
                    return [...prev, msg];
                });
            }
        };

        socket.off('receiveMessage');
        socket.on('receiveMessage', handleReceive);

        return () => {
            socket.off('receiveMessage');
        };
    }, [socket, conversation]);

    const setupConversation = async () => {
        if (!user) return;
        console.log("🛠️ [DEBUG] ChatWidget: Setting up conversation...");
        setLoading(true);
        try {
            const res = await createOrGetConversation(); 
            console.log("🛠️ [DEBUG] ChatWidget: createOrGetConversation res:", res);
            if (res.success) {
                console.log("🛠️ [DEBUG] ChatWidget: Setting conversation state:", res.data);
                setConversation(res.data);
                const msgRes = await getMessages(res.data._id);
                if (msgRes.success) {
                    console.log("🛠️ [DEBUG] ChatWidget: Messages loaded:", msgRes.data.length);
                    setMessages(msgRes.data);
                }
            } else {
                console.error("🛠️ [DEBUG] ChatWidget: createOrGetConversation FAILED:", res.error);
            }
        } catch (error) {
            console.error("🛠️ [DEBUG] Setup chat error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen || !user) return;
        setupConversation();
    }, [isOpen, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        console.log("📤 Attempting to send message. Conversation:", conversation);
        console.log("📤 Current user ID:", user._id || user.id);

        if (!inputText.trim() || !conversation || !socket) {
            console.error("❌ Send failed: missing data or socket", { inputText, conversation, socket: !!socket });
            return;
        }

        const myId = (user._id || user.id).toString();
        const adminMember = conversation.members.find(m => (m._id || m.id || m).toString() !== myId);
        const receiverId = adminMember?._id || adminMember?.id || adminMember || '678f844b62db5cc74df3b868';

        console.log("📤 Receiver ID determined:", receiverId);

        const messageData = {
            senderId: myId,
            receiverId: receiverId.toString(),
            text: inputText,
            conversationId: (conversation._id || conversation.id).toString()
        };

        console.log("📤 Emitting sendMessage event:", messageData);
        socket.emit('sendMessage', messageData);
        setInputText("");
    };

    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const dragItem = useRef();
    const dragStartPos = useRef();

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            const x = window.innerWidth - e.clientX - 30; // 30 is half of button width
            const y = window.innerHeight - e.clientY - 30;
            setPosition({
                x: Math.max(10, Math.min(window.innerWidth - 70, x)),
                y: Math.max(10, Math.min(window.innerHeight - 70, y))
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleMouseDown = (e) => {
        if (e.button !== 0) return; // Only left click
        setIsDragging(true);
        dragStartPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleClick = (e) => {
        if (dragStartPos.current) {
            const distance = Math.sqrt(
                Math.pow(e.clientX - dragStartPos.current.x, 2) + 
                Math.pow(e.clientY - dragStartPos.current.y, 2)
            );
            if (distance > 5) return; // It was a drag, not a click
        }
        setIsOpen(!isOpen);
    };

    return (
        <div 
            className={`chat-widget-container ${isOpen ? 'open' : ''}`}
            style={{ 
                right: `${position.x}px`, 
                bottom: `${position.y}px`,
                width: '60px',
                height: '60px',
                transition: isDragging ? 'none' : 'bottom 0.3s, right 0.3s'
            }}
        >
            {/* Floating Button */}
            <button 
                className="chat-toggle-btn" 
                style={{ 
                    cursor: isDragging ? 'grabbing' : 'grab',
                }}
                onMouseDown={handleMouseDown}
                onClick={handleClick}
            >
                {isOpen ? <FaTimes /> : <FaComments />}
            </button>

            {/* Chat Box */}
            <div className="chat-box-card shadow">
                <div className="chat-header">
                    <div className="d-flex align-items-center gap-2">
                        <div className="user-avatar-sm">
                            <FaUser />
                        </div>
                        <div>
                            <h6 className="mb-0 text-white">Admin Support</h6>
                            <small className="text-white-50 d-flex align-items-center gap-1">
                                <FaCircle className="online-dot" /> Online
                            </small>
                        </div>
                    </div>
                </div>

                {!isAuthenticated || !user ? (
                    <div className="chat-messages-area text-center justify-content-center">
                        <FaUser className="fs-1 text-muted  mx-auto" />
                        <h5>Please Login</h5>
                        <p className="text-muted small">You need to be logged in to chat with our support team.</p>
                        <button 
                            className="thm-btn mt-auto"
                            onClick={() => {
                                setIsOpen(false);
                                document.querySelector('[data-bs-target="#loginModal"]')?.click();
                            }}
                        >
                            Login Now
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="chat-messages-area">
                            {loading ? (
                                <div className="text-center mt-5">
                                    <FaSpinner className="fa-spin text-primary fs-3" />
                                    <p className="small text-muted mt-2">Connecting to support...</p>
                                </div>
                            ) : !conversation ? (
                                <div className="text-center text-muted mt-5 p-3">
                                    <p>Support is currently unavailable.</p>
                                    <button 
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={setupConversation}
                                    >
                                        Try Connecting Again
                                    </button>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-muted mt-5">
                                    <p>How can we help you today?</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMe = (msg.sender?._id || msg.sender || '').toString() === (user.id || user._id || '').toString();
                                    return (
                                        <div key={msg._id || index} className={`chat-bubble-wrapper ${isMe ? 'chat-right' : 'chat-left'}`}>
                                            <div className={`chat-bubble ${isMe ? 'udemy-chat-msg text-white' : 'bg-light'}`}>
                                                <p className="mb-0" style={{color: isMe ? "white" : "black"}}>{msg.text}</p>
                                                <small className={isMe ? 'text-white-50' : 'text-muted'}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </small>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input-area border-top" onSubmit={handleSendMessage}>
                            <input 
                                type="text" 
                                placeholder={loading ? "Initializing..." : !conversation ? "Unavailable" : "Type your message..."} 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                disabled={loading || !conversation}
                            />
                            <button type="submit" disabled={!inputText.trim() || loading || !conversation}>
                                <FaPaperPlane />
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatWidget;
