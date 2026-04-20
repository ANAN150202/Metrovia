// List of all conversations shown in the left panel
import Avatar from "../common/Avatar";
import Spinner from "../common/Spinner";
import useAuth from "../../hooks/useAuth";
import { formatDate } from "../../utils/formatDate";

const ChatList = ({ conversations, loading, selectedId, onSelect }) => {
  const { user } = useAuth();

  // Get the other participant in a conversation
  const getOther = (conversation) => {
    return conversation.participants?.find((p) => p._id !== user?._id);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="sm" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-gray-400">No conversations yet</p>
        <p className="text-xs text-gray-500 mt-1">Start a new chat</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto no-scrollbar">
      {conversations.map((conv) => {
        const other      = getOther(conv);
        const isSelected = conv._id === selectedId;
        const lastMsg    = conv.lastMessage;
        const isUnread   = lastMsg && !lastMsg.isRead && lastMsg.sender?._id !== user?._id;

        return (
          <button
            key={conv._id}
            onClick={() => onSelect(conv)}
            className={`
              w-full flex items-center gap-3 px-4 py-3.5
              border-b border-light-border dark:border-dark-border
              transition-all duration-200 text-left
              ${isSelected
                ? "bg-brand-50 dark:bg-brand-900/20"
                : "hover:bg-light-hover dark:hover:bg-dark-hover"
              }
            `}
          >
            <Avatar user={other} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm truncate ${isUnread ? "font-semibold text-gray-900 dark:text-white" : "font-medium text-gray-700 dark:text-gray-300"}`}>
                  {other?.name || "Unknown"}
                </p>
                {lastMsg && (
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {formatDate(lastMsg.createdAt)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <p className={`text-xs truncate ${isUnread ? "text-gray-900 dark:text-white font-medium" : "text-gray-400"}`}>
                  {lastMsg
                    ? (lastMsg.sender?._id === user?._id ? "You: " : "") + lastMsg.text
                    : "No messages yet"
                  }
                </p>
                {isUnread && (
                  <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ChatList;