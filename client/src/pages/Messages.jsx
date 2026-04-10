import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import './Messages.css';

const ENDPOINT = "http://localhost:5000";
let socket;

const Messages = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // States
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    
    // Refs
    const messagesEndRef = useRef(null);

    // Current User
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const token = localStorage.getItem('token');

    // Socket Initialization
    useEffect(() => {
        if (!currentUser) return;
        socket = io(ENDPOINT);
        socket.emit("join", currentUser._id);

        return () => {
            socket.disconnect();
        };
    }, []);

    // Socket Receive Message listener
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (message) => {
            if (id && message.conversation === id) {
                setMessages((prev) => [...prev, message]);
            }
            // Update conversations list latest message if needed
            setConversations(prev => prev.map(conv => {
                if(conv._id === message.conversation) {
                    return { ...conv, lastMessage: message.text, updatedAt: message.createdAt };
                }
                return conv;
            }));
        };

        socket.on("receiveMessage", handleReceiveMessage);

        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
        };
    }, [id]);

    // Fetch Conversations
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchConversations = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/chat", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setConversations(res.data);
            } catch (error) {
                console.error("Error fetching conversations:", error);
            } finally {
                setLoadingConversations(false);
            }
        };

        fetchConversations();
    }, [token, navigate]);

    // Fetch Messages when in a specific conversation
    useEffect(() => {
        if (!id) return;

        const fetchMessages = async () => {
            setLoadingMessages(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/chat/${id}/messages`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessages(res.data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            } finally {
                setLoadingMessages(false);
            }
        };

        fetchMessages();
    }, [id, token]);

    // Auto-scroll
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = async (textToSend) => {
        if (!textToSend.trim() || sending) return;

        setSending(true);
        try {
            const res = await axios.post(`http://localhost:5000/api/chat/${id}/message`, { text: textToSend }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const savedMessage = res.data;
            setMessages((prev) => [...prev, savedMessage]);
            setNewMessage("");

            // Find receiver ID from conversation participants
            const currentConv = conversations.find(c => c._id === id);
            if (currentConv) {
                const receiver = currentConv.participants.find(p => p._id !== currentUser._id);
                if (receiver) {
                    socket.emit("sendMessage", {
                        receiverId: receiver._id,
                        message: savedMessage
                    });
                }
                
                // Update local conversation list
                setConversations(prev => prev.map(conv => {
                    if (conv._id === id) {
                        return { ...conv, lastMessage: savedMessage.text, updatedAt: savedMessage.createdAt };
                    }
                    return conv;
                }));
            }
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message.");
        } finally {
            setSending(false);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="page-container messages-page">
            <div className="messages-layout">
                {/* LEFT: CONVERSATIONS LIST */}
                <div className={`conversations-sidebar ${id ? 'hidden-on-mobile' : ''}`}>
                    <div className="sidebar-header">
                        <h2>Messages</h2>
                    </div>
                    <div className="conversations-list">
                        {loadingConversations ? (
                            <div className="loading-state">Loading chats...</div>
                        ) : conversations.length === 0 ? (
                            <div className="empty-state">No conversations yet.</div>
                        ) : (
                            conversations.map(conv => {
                                const otherUser = conv.participants.find(p => p._id !== currentUser._id);
                                return (
                                    <Link 
                                        to={`/messages/${conv._id}`} 
                                        className={`conversation-card ${id === conv._id ? 'active' : ''}`}
                                        key={conv._id}
                                    >
                                        <div className="conv-avatar">
                                            {(otherUser?.name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="conv-details">
                                            <div className="conv-header">
                                                <h4>{otherUser?.name || 'Unknown User'}</h4>
                                                <span className="conv-time">
                                                    {conv.updatedAt && new Date(conv.updatedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {conv.product && <small className="conv-product-tag">{conv.product.title}</small>}
                                            <p className="conv-last-msg">{conv.lastMessage || 'No messages yet'}</p>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* RIGHT: CHAT WINDOW */}
                <div className={`chat-window ${!id ? 'hidden-on-mobile' : ''}`}>
                    {!id ? (
                        <div className="chat-placeholder">
                            <div className="placeholder-content">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, marginBottom: '1rem' }}>
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                <h3>Your Messages</h3>
                                <p>Select a conversation from the sidebar to view your messages and reply.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="chat-header">
                                <Link to="/messages" className="back-btn mobile-only">←</Link>
                                {(() => {
                                    const activeConv = conversations.find(c => c._id === id);
                                    if(!activeConv && loadingConversations) return <div/>;
                                    const otherUser = activeConv?.participants.find(p => p._id !== currentUser._id);
                                    return (
                                        <div className="chat-header-info">
                                            <h3>{otherUser?.name || 'Chat'}</h3>
                                            {activeConv?.product && (
                                                <span className="chat-header-product">
                                                    Re: {activeConv.product.title}
                                                </span>
                                            )}
                                        </div>
                                    )
                                })()}
                            </div>

                            <div className="chat-policy-bar">
                                <span className="policy-icon">💡</span>
                                <span>UniMart follows a fixed-price policy. Negotiation is not supported.</span>
                            </div>

                            <div className="chat-messages-container">
                                {loadingMessages ? (
                                    <div className="loading-state">Loading messages...</div>
                                ) : (
                                    messages.map((msg, index) => {
                                        const isMine = msg.sender === currentUser._id;
                                        return (
                                            <div key={index} className={`message-bubble-wrapper ${isMine ? 'mine' : 'theirs'}`}>
                                                <div className="message-bubble">{msg.text}</div>
                                                <div className="message-timestamp">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="chat-input-area">
                                <form 
                                    className="chat-input-form"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSendMessage(newMessage);
                                    }}
                                >
                                    <input 
                                        type="text" 
                                        className="chat-input"
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        disabled={sending}
                                    />
                                    <button 
                                        type="submit" 
                                        className="btn-primary-action chat-send-btn"
                                        disabled={!newMessage.trim() || sending}
                                    >
                                        Send
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
