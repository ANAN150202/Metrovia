// Like/unlike toggle button with live count
import { useState } from "react";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";

const LikeButton = ({ post, onLikeUpdate }) => {
  const { user } = useAuth();

  const alreadyLiked = post.likes?.some(
    (id) => id === user?._id || id?._id === user?._id
  );

  const [liked,     setLiked]     = useState(alreadyLiked);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [loading,   setLoading]   = useState(false);

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);

    // Optimistic update
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));

    try {
      if (liked) {
        await api.delete(`/api/posts/${post._id}/like`);
      } else {
        await api.post(`/api/posts/${post._id}/like`);
      }
      if (onLikeUpdate) onLikeUpdate();
    } catch {
      // Revert on failure
      setLiked((prev) => !prev);
      setLikeCount((prev) => (liked ? prev + 1 : prev - 1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
        transition-all duration-200 disabled:opacity-50
        ${liked
          ? "text-red-500 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20"
          : "text-gray-500 dark:text-gray-400 hover:bg-light-hover dark:hover:bg-dark-hover hover:text-red-500"
        }
      `}
    >
      <svg
        className="w-4 h-4 transition-transform duration-200 hover:scale-110"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <span>{likeCount}</span>
    </button>
  );
};

export default LikeButton;