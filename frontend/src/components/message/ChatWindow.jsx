import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Avatar from "../common/Avatar";
import MessageBubble from "./MessageBubble";
import Spinner from "../common/Spinner";
import api from "../../services/api";

const POLL_INTERVAL = 5000; // Poll every 5 seconds for new messages

const ChatWindow = ({ conversation, onMessageSent }) => {
  const { user } = useAuth();

  const [messages,  setMessages]  = useState([]);
  const [text,      setText]      = useState("");
  const [loading,   setLoading]   = useState(true);
  const [sending,   setSending]   = useState(false);
  const bottomRef   = useRef(null);
  const pollRef     = useRef(null); // stores the interval ID

  const other = conversation?.participants?.find((p) => p._id !== user?._id);

  // ── Fetch messages ─────────────────────────────────────────
  const fetchMessages = useCallback(async (markRead = false) => {
    if (!conversation) return;
    try {
      const res = await api.get(`/api/messages/conversation/${conversation._id}`);
      const newMessages = res.data.messages || [];
      setMessages(newMessages);

      // Mark as read when first opening or when new messages arrive
      if (markRead) {
        await api.put(`/api/messages/conversation/${conversation._id}/read`);
        if (onMessageSent) onMessageSent(); // refresh unread count in navbar
      }
    } catch {
      // silently fail
    }
  }, [conversation?._id]);

  // ── Initial load + start polling ───────────────────────────
  useEffect(() => {
    if (!conversation) return;

    // Initial load
    setLoading(true);
    fetchMessages(true).finally(() => setLoading(false));

    // Start polling every 5 seconds
    pollRef.current = setInterval(() => {
      fetchMessages(true);
    }, POLL_INTERVAL);

    // Cleanup: stop polling when conversation changes or component unmounts
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [conversation?._id]);

  // ── Scroll to bottom on new messages ──────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ───────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    const msgText = text.trim();
    setText("");

    // Optimistic UI — add message immediately before API responds
    const optimisticMsg = {
      _id:       `temp-${Date.now()}`,
      sender:    { _id: user?._id, name: user?.name, avatar: user?.avatar },
      receiver:  other,
      text:      msgText,
      createdAt: new Date().toISOString(),
      isRead:    false,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await api.post("/api/messages", {
        receiverId: other?._id,
        text:       msgText,
      });
      if (onMessageSent) onMessageSent();
      // Fetch real messages to replace optimistic one
      fetchMessages(false);
    } catch {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m._id !== optimisticMsg._id));
      setText(msgText);
    } finally {
      setSending(false);
    }
  };

  // ── Empty state ────────────────────────────────────────────
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500/10 to-violet-500/10 border border-brand-200 dark:border-brand-900/30 flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Select a conversation</p>
          <p className="text-xs text-gray-400 mt-1">or start a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">

      {/* Header */}
      <div className="px-4 py-3.5 border-b border-light-border dark:border-dark-border flex items-center gap-3 shrink-0">
        <Avatar user={other} size="sm" />
        <div>
          <Link
            to={`/profile/${other?._id}`}
            className="text-sm font-semibold text-gray-900 dark:text-white hover:text-brand-500 transition-colors"
          >
            {other?.name}
          </Link>
          <p className="text-xs text-gray-400 capitalize">{other?.role}</p>
        </div>
        {/* Live indicator */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner size="sm" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center py-10">
            <p className="text-xs text-gray-400">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={msg.sender?._id === user?._id || msg.sender === user?._id}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="px-4 py-3 border-t border-light-border dark:border-dark-border flex items-center gap-3 shrink-0"
      >
        <Avatar user={user} size="xs" />
        <div className="flex-1 flex items-center gap-2 bg-light-panel dark:bg-dark-panel border border-light-border dark:border-dark-border rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-brand-500/30 transition-all">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message ${other?.name || ""}...`}
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="text-brand-500 hover:text-brand-600 disabled:opacity-30 transition-colors shrink-0"
          >
            <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </form>

    </div>
  );
};

export default ChatWindow;