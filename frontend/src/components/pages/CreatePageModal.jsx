import { useState, useRef } from "react";
import Modal from "../common/Modal";
import api from "../../services/api";

const CreatePageModal = ({ isOpen, onClose, onCreated }) => {
  const [name,        setName]        = useState("");
  const [description, setDescription] = useState("");
  const [banner,      setBanner]      = useState(null);
  const [avatar,      setAvatar]      = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState(null);
  const bannerRef = useRef(null);
  const avatarRef = useRef(null);

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBanner(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleClose = () => {
    setName(""); setDescription("");
    setBanner(null); setAvatar(null);
    setBannerPreview(null); setAvatarPreview(null);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Page name is required."); return; }
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("name",        name.trim());
      formData.append("description", description.trim());
      if (banner) formData.append("banner", banner);
      if (avatar) formData.append("avatar", avatar);

      const res = await api.post("/api/pages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (onCreated) onCreated(res.data.page);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create page.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create a Page" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Banner */}
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Cover Banner</p>
          <div
            className="h-24 rounded-xl overflow-hidden cursor-pointer relative group"
            style={{
              background: bannerPreview
                ? `url(${bannerPreview}) center/cover no-repeat`
                : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            }}
            onClick={() => bannerRef.current?.click()}
          >
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-medium">Click to add banner</span>
            </div>
            <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
          </div>
        </div>

        {/* Avatar */}
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Page Profile Picture</p>
          <div className="flex items-center gap-3">
            <div
              className="w-16 h-16 rounded-full overflow-hidden cursor-pointer border-2 border-dashed border-light-border dark:border-dark-border hover:border-brand-500 transition-colors flex items-center justify-center bg-light-panel dark:bg-dark-panel"
              onClick={() => avatarRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </div>
            <p className="text-xs text-gray-400">Click to upload a profile picture for this page</p>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Page Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Photography Club"
            className="input"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this page about?"
            rows={3}
            maxLength={500}
            className="input resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={handleClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting ? "Creating..." : "Create Page"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePageModal;