// Admin UI to create and delete notices
import { useState, useEffect } from "react";
import Spinner from "../common/Spinner";
import api from "../../services/api";
import { formatDate } from "../../utils/formatDate";

const ManageNotices = () => {
  const [notices,    setNotices]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [title,      setTitle]      = useState("");
  const [body,       setBody]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error,      setError]      = useState(null);
  const [success,    setSuccess]    = useState(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/notices");
      setNotices(res.data.notices || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Title and body are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.post("/api/notices", { title, body });
      setNotices((prev) => [res.data.notice, ...prev]);
      setTitle("");
      setBody("");
      setSuccess("Notice posted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post notice.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/notices/${id}`);
      setNotices((prev) => prev.filter((n) => n._id !== id));
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* Post new notice form */}
      <form onSubmit={handlePost} className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setError(null); setSuccess(null); }}
          placeholder="Notice title"
          className="w-full px-4 py-3 rounded-xl bg-dark-card border border-dark-border text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-sm"
        />
        <textarea
          value={body}
          onChange={(e) => { setBody(e.target.value); setError(null); setSuccess(null); }}
          placeholder="Notice content..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl bg-dark-card border border-dark-border text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-sm resize-none"
        />

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-green-400">{success}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full py-2.5"
        >
          {submitting ? "Posting..." : "Post Notice"}
        </button>
      </form>

      {/* Divider */}
      <div className="border-t border-dark-border" />

      {/* Existing notices */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Posted Notices ({notices.length})
        </p>

        {loading ? (
          <div className="flex justify-center py-6">
            <Spinner size="sm" />
          </div>
        ) : notices.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No notices posted yet</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto no-scrollbar">
            {notices.map((notice) => (
              <div
                key={notice._id}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-dark-card border border-dark-border group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{notice.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{notice.body}</p>
                  <p className="text-xs text-gray-600 mt-1">{formatDate(notice.createdAt)}</p>
                </div>
                <button
                  onClick={() => handleDelete(notice._id)}
                  disabled={deletingId === notice._id}
                  className="shrink-0 p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageNotices;