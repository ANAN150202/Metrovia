// Inline comment list with add comment input
import { useState, useEffect } from "react";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";
import Avatar from "../common/Avatar";
import { formatDate } from "../../utils/formatDate";

const CommentSection = ({ postId, commentCount }) => {
  const { user } = useAuth();

  const [comments,  setComments]  = useState([]);
  const [text,      setText]      = useState("");
  const [loading,   setLoading]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch comments
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/posts/${postId}/comments`);
        setComments(res.data.comments || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [postId]);

  // Add comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/api/posts/${postId}/comments`, { text });
      setComments((prev) => [...prev, res.data.comment]);
      setText("");
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  // Delete comment
  const handleDelete = async (commentId) => {
    setDeletingId(commentId);
    try {
      await api.delete(`/api/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-3 border-t border-light-border dark:border-dark-border pt-3 space-y-3">

      {/* Comment list */}
      {loading ? (
        <p className="text-xs text-gray-400 text-center py-2">Loading comments...</p>
      ) : (
        <div className="space-y-2.5">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-2.5 group">
              <Avatar user={comment.author} size="xs" />
              <div className="flex-1 min-w-0">
                <div className="bg-light-panel dark:bg-dark-panel rounded-xl px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {comment.author?.name}
                    </span>
                    {/* Delete — only for comment author */}
                    {comment.author?._id === user?._id && (
                      <button
                        onClick={() => handleDelete(comment._id)}
                        disabled={deletingId === comment._id}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all duration-200"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                    {comment.text}
                  </p>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 ml-3">
                  {formatDate(comment.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add comment input */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <Avatar user={user} size="xs" />
        <div className="flex-1 flex items-center gap-2 bg-light-panel dark:bg-dark-panel rounded-xl px-3 py-2 border border-light-border dark:border-dark-border focus-within:ring-2 focus-within:ring-brand-500/30 transition-all">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!text.trim() || submitting}
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

export default CommentSection;