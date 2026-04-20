// Single notice display card
import { formatDate } from "../../utils/formatDate";
import useAuth from "../../hooks/useAuth";
import api from "../../services/api";
import { useState } from "react";

const NoticeCard = ({ notice, onDelete }) => {
  const { user }    = useAuth();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Delete this notice?")) return;
    setDeleting(true);
    try {
      await api.delete(`/api/notices/${notice._id}`);
      if (onDelete) onDelete(notice._id);
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        {/* Left — dot + content */}
        <div className="flex gap-3">
          <span className="mt-2 w-2 h-2 rounded-full bg-brand-500 shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">
              {notice.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed">
              {notice.body}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {formatDate(notice.createdAt)}
              {notice.postedBy?.name ? ` · Posted by ${notice.postedBy.name}` : ""}
            </p>
          </div>
        </div>

        {/* Delete — admin only */}
        {user?.role === "admin" && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default NoticeCard;