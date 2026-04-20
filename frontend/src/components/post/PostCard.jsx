import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Avatar from "../common/Avatar";
import LikeButton from "./LikeButton";
import CommentSection from "./CommentSection";
import { formatDate } from "../../utils/formatDate";
import api from "../../services/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// pageOwnerId prop — passed from SinglePageView so page owner can edit/delete
const PostCard = ({ post, onDelete, pageOwnerId = null }) => {
  const { user } = useAuth();

  const [showComments, setShowComments] = useState(false);
  const [isEditing,    setIsEditing]    = useState(false);
  const [editText,     setEditText]     = useState(post.text || "");
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [currentText,  setCurrentText]  = useState(post.text || "");

  // If postedAs is set, display as page post
  const isPagePost    = !!post.postedAs;
  const displayName   = isPagePost ? post.postedAs?.name   : post.author?.name;
  const displayLink   = isPagePost ? `/pages/${post.page}` : `/profile/${post.author?._id}`;
  const displayEntity = isPagePost
    ? { name: post.postedAs?.name, avatar: post.postedAs?.avatar }
    : post.author;

  // Can manage if: real author OR page owner
  const isAuthor    = post.author?._id === user?._id;
  const isPageOwner = pageOwnerId && pageOwnerId === user?._id;
  const canManage   = isAuthor || isPageOwner;

  const handleSave = async () => {
    if (!editText.trim() || saving) return;
    setSaving(true);
    try {
      await api.put(`/api/posts/${post._id}`, { text: editText });
      setCurrentText(editText);
      setIsEditing(false);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    setDeleting(true);
    try {
      await api.delete(`/api/posts/${post._id}`);
      if (onDelete) onDelete(post._id);
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="card p-4 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <Link to={displayLink}>
            <Avatar user={displayEntity} size="sm" />
          </Link>
          <div>
            <Link
              to={displayLink}
              className="text-sm font-semibold text-gray-900 dark:text-white hover:text-brand-500 transition-colors"
            >
              {displayName}
            </Link>
            <p className="text-xs text-gray-400">
              {isPagePost ? "Page" : (
                <>
                  <span className="capitalize">{post.author?.role}</span>
                  {post.author?.department ? ` · ${post.author.department}` : ""}
                </>
              )}
              {" · "}{formatDate(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Edit / Delete — shown for author OR page owner */}
        {canManage && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setIsEditing(true); setEditText(currentText); }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-light-hover dark:hover:bg-dark-hover transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Post Text */}
      {isEditing ? (
        <div className="mb-3">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={3}
            className="input resize-none text-sm"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary text-xs px-4 py-1.5">
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setIsEditing(false)} className="btn-secondary text-xs px-4 py-1.5">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        currentText && (
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed mb-3 whitespace-pre-wrap">
            {currentText}
          </p>
        )
      )}

      {/* Post Image */}
      {post.image && (
        <div className="mb-3 rounded-xl overflow-hidden bg-light-panel dark:bg-dark-panel">
          <img
            src={`${BASE_URL}/uploads/images/${post.image}`}
            alt="Post"
            className="w-full max-h-96 object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <LikeButton post={post} />
        <button
          onClick={() => setShowComments((p) => !p)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-light-hover dark:hover:bg-dark-hover hover:text-brand-500 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{post.comments?.length || 0}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <CommentSection postId={post._id} commentCount={post.comments?.length} />
      )}

    </div>
  );
};

export default PostCard;