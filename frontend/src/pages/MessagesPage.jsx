import { useState, useEffect, useCallback } from "react";
import ChatList from "../components/message/ChatList";
import ChatWindow from "../components/message/ChatWindow";
import NewChatModal from "../components/message/NewChatModal";
import api from "../services/api";

const MessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selected,      setSelected]      = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [showNewChat,   setShowNewChat]   = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get("/api/messages/conversations");
      setConversations(res.data.conversations || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleSelect = (conv) => {
    setSelected(conv);
  };

  const handleNewConversation = async (conversationId) => {
    await fetchConversations();
    const res   = await api.get("/api/messages/conversations");
    const convs = res.data.conversations || [];
    const found = convs.find((c) => c._id === conversationId);
    if (found) setSelected(found);
  };

  // Called by ChatWindow when messages are sent or read
  // Refreshes conversation list to update last message + unread state
  const handleMessagesUpdate = () => {
    fetchConversations();
  };

  return (
    <div className="-mx-4 -my-6">
      <div
        className="flex bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl overflow-hidden"
        style={{ height: "calc(100vh - 5rem)" }}
      >
        {/* Left — conversation list */}
        <div className="w-80 shrink-0 border-r border-light-border dark:border-dark-border flex flex-col">
          <div className="px-4 py-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white font-display">Messages</h2>
            <button
              onClick={() => setShowNewChat(true)}
              className="p-2 rounded-xl text-gray-400 hover:text-brand-500 hover:bg-light-hover dark:hover:bg-dark-hover transition-all"
              title="New message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatList
              conversations={conversations}
              loading={loading}
              selectedId={selected?._id}
              onSelect={handleSelect}
            />
          </div>
        </div>

        {/* Right — chat window */}
        <ChatWindow
          conversation={selected}
          onMessageSent={handleMessagesUpdate}
        />
      </div>

      <NewChatModal
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        onConversationStart={handleNewConversation}
      />
    </div>
  );
};

export default MessagesPage;