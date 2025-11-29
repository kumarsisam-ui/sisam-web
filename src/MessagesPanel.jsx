// src/MessagesPanel.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  getConversations,
  getMessagesWith,
  sendMessageTo,
} from "./api";

export default function MessagesPanel({
  currentUser,
  onNewMessage,
  activeUser,
  onChangeActiveUser,
}) {
  const [conversations, setConversations] = useState([]);
  const [internalActiveUser, setInternalActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [status, setStatus] = useState("");

  const messagesContainerRef = useRef(null);

  const loggedIn = !!currentUser;

  // Use controlled active user if provided, otherwise internal state
  const effectiveActiveUser = activeUser || internalActiveUser;

  // Scroll to bottom when messages change
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Conversations error:", err);
    }
  };

  const loadMessages = async (username) => {
    try {
      const data = await getMessagesWith(username);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Messages error:", err);
    }
  };

  // Load conversations & poll
  useEffect(() => {
    if (!loggedIn) return;

    loadConversations();

    const interval = setInterval(() => {
      loadConversations();
      if (effectiveActiveUser) {
        loadMessages(effectiveActiveUser);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [loggedIn, effectiveActiveUser]);

  // Whenever parent changes activeUser, open that conversation
  useEffect(() => {
    if (activeUser) {
      setInternalActiveUser(activeUser);
      loadMessages(activeUser);
      setStatus("");
    }
  }, [activeUser]);

  const openConversation = async (username) => {
    setInternalActiveUser(username);
    if (onChangeActiveUser) onChangeActiveUser(username);
    setMessages([]);
    setStatus("");
    await loadMessages(username);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !effectiveActiveUser) return;
    try {
      setStatus("");
      await sendMessageTo(effectiveActiveUser, newMessage.trim());
      setNewMessage("");
      await loadMessages(effectiveActiveUser);
      await loadConversations();

      if (onNewMessage) {
        onNewMessage();
      }
    } catch (err) {
      console.error("Send message error:", err);
      setStatus("Could not send message.");
    }
  };

  if (!loggedIn) {
    return (
      <div className="messages-panel sidebar-card">
        <strong>Messages</strong>
        <p style={{ fontSize: 12 }}>Login to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="messages-panel sidebar-card">
      <strong>Messages</strong>
      <div className="chat-layout">
        {/* LEFT: conversations */}
        <div className="chat-convo-list">
          {conversations.length === 0 && (
            <div className="chat-convo-empty">No conversations yet.</div>
          )}
          {conversations.map((c) => {
            const u = c.user;
            const isActive = effectiveActiveUser === u.username;
            return (
              <div
                key={u.username}
                className={`chat-convo-item ${isActive ? "active" : ""}`}
                onClick={() => openConversation(u.username)}
              >
                <div className="chat-avatar">
                  {u.username?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="chat-convo-text">
                  <div className="chat-convo-username">@{u.username}</div>
                  <div className="chat-convo-preview">
                    {c.last_message?.text || ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: messages */}
        <div className="chat-window">
          {!effectiveActiveUser ? (
            <div className="chat-empty">Select a conversation to start.</div>
          ) : (
            <>
              <div className="chat-header">@{effectiveActiveUser}</div>
              <div className="chat-messages" ref={messagesContainerRef}>
                {messages.map((m) => {
                  const isMine = m.sender.username === currentUser;
                  return (
                    <div
                      key={m.id}
                      className={`chat-bubble-row ${
                        isMine ? "mine" : "theirs"
                      }`}
                    >
                      <div className="chat-bubble">
                        <div className="chat-bubble-text">{m.text}</div>
                        <div className="chat-bubble-time">
                          {new Date(m.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="chat-input-row">
                <input
                  type="text"
                  placeholder={`Message @${effectiveActiveUser}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button type="button" onClick={handleSend}>
                  Send
                </button>
              </div>
              {status && <div className="chat-status">{status}</div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
