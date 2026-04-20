// Single message bubble styled for sent or received
import { formatTime } from "../../utils/formatDate";

const MessageBubble = ({ message, isOwn }) => {
  return (
    <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {/* Bubble */}
      <div
        className={`
          max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
          ${isOwn
            ? "bg-gradient-to-br from-brand-500 to-violet-600 text-white rounded-br-sm"
            : "bg-light-panel dark:bg-dark-panel text-gray-900 dark:text-white border border-light-border dark:border-dark-border rounded-bl-sm"
          }
        `}
      >
        <p>{message.text}</p>
      </div>

      {/* Time */}
      <span className="text-[10px] text-gray-400 shrink-0 mb-0.5">
        {formatTime(message.createdAt)}
      </span>
    </div>
  );
};

export default MessageBubble;