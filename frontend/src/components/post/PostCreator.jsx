import { useState, useRef } from "react";
import useAuth from "../../hooks/useAuth";
import Avatar from "../common/Avatar";
import api from "../../services/api";

// pageId prop — if provided, post is created under that page
const PostCreator = ({ onPostCreated, pageId = null }) => {
  const { user } = useAuth();

  const [text,        setText]        = useState("");
  const [image,       setImage]       = useState(null);
  const [preview,     setPreview]     = useState(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState(null);
  const fileRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image) return;
    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      if (text.trim()) formData.append("text", text.trim());
      if (image) formData.append("image", image);

      let res;

      if (pageId) {
        // Post to a specific page
        res = await api.post(`/api/pages/${pageId}/posts`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Regular feed post
        res = await api.post("/api/posts", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setText("");
      removeImage();
      if (onPostCreated) onPostCreated(res.data.post);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-4 mb-4">
      <form onSubmit={handleSubmit}>
        {/* Top row — avatar + textarea */}
        <div className="flex gap-3">
          <Avatar user={user} size="sm" />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`What's on your mind, ${user?.name?.split(" ")[0]}?`}
            rows={text ? 3 : 1}
            className="
              flex-1 resize-none bg-light-panel dark:bg-dark-panel
              border border-light-border dark:border-dark-border
              rounded-xl px-4 py-2.5 text-sm
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-600
              focus:outline-none focus:ring-2 focus:ring-brand-500/30
              transition-all duration-200
            "
          />
        </div>

        {/* Image preview */}
        {preview && (
          <div className="relative mt-3 ml-11 rounded-xl overflow-hidden">
            <img src={preview} alt="Preview" className="w-full max-h-64 object-cover rounded-xl" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {error && (
          <p className="mt-2 ml-11 text-xs text-red-400">{error}</p>
        )}

        {/* Bottom actions */}
        {(text || preview) && (
          <div className="flex items-center justify-between mt-3 ml-11">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Photo
            </button>
            <button
              type="submit"
              disabled={(!text.trim() && !image) || submitting}
              className="btn-primary text-sm px-5 py-2"
            >
              {submitting ? "Posting..." : "Post"}
            </button>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />

        {/* Show actions row even when no text typed yet */}
        {!text && !preview && (
          <div className="flex items-center gap-4 mt-3 ml-11">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Add photo
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PostCreator;