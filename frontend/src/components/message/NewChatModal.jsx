// Modal to search users and start a new conversation
import { useState } from "react";
import Modal from "../common/Modal";
import Avatar from "../common/Avatar";
import api from "../../services/api";

const NewChatModal = ({ isOpen, onClose, onConversationStart }) => {
  const [query,   setQuery]   = useState("");
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(null);

  const handleSearch = async (q) => {
    setQuery(q);
    if (!q.trim()) { setUsers([]); return; }
    setLoading(true);
    try {
      const res = await api.get(`/api/users/search?q=${q}`);
      setUsers(res.data.users || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (targetUser) => {
    setStarting(targetUser._id);
    try {
      // Send an empty-ish initial message to create the conversation
      const res = await api.post("/api/messages", {
        receiverId: targetUser._id,
        text: "👋",
      });
      if (onConversationStart) onConversationStart(res.data.conversationId);
      onClose();
      setQuery("");
      setUsers([]);
    } catch {
      // silently fail
    } finally {
      setStarting(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Message" size="sm">
      {/* Search input */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search people..."
          className="input pl-9"
          autoFocus
        />
      </div>

      {/* Results */}
      <div className="space-y-1 max-h-64 overflow-y-auto no-scrollbar">
        {loading ? (
          <p className="text-center text-sm text-gray-400 py-4">Searching...</p>
        ) : users.length === 0 && query ? (
          <p className="text-center text-sm text-gray-400 py-4">No users found</p>
        ) : (
          users.map((u) => (
            <button
              key={u._id}
              onClick={() => handleStart(u)}
              disabled={starting === u._id}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-light-hover dark:hover:bg-dark-hover transition-all text-left disabled:opacity-50"
            >
              <Avatar user={u} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {u.name}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {u.role}{u.department ? ` · ${u.department}` : ""}
                </p>
              </div>
              {starting === u._id ? (
                <svg className="w-4 h-4 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          ))
        )}
      </div>
    </Modal>
  );
};

export default NewChatModal;