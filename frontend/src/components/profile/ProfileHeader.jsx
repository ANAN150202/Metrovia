// Cover photo, avatar, name, role, and bio section
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Avatar from "../common/Avatar";
import api from "../../services/api";
import { getRole, getRoleColor } from "../../utils/roleHelpers";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const ProfileHeader = ({ profileUser, isOwn, onUpdate }) => {
  const { user, login, token } = useAuth();
  const navigate = useNavigate();

  const [editMode,    setEditMode]    = useState(false);
  const [bio,         setBio]         = useState(profileUser?.bio || "");
  const [avatarFile,  setAvatarFile]  = useState(null);
  const [preview,     setPreview]     = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState(null);
  const [favouriting, setFavouriting] = useState(false);
  const [isFavourited, setIsFavourited] = useState(() => {
    return user?.favourites?.users?.some(
      (u) => u._id === profileUser?._id || u === profileUser?._id
    ) || false;
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("bio", bio);
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await api.put("/api/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update auth context with new user data
      login(res.data.user, token);
      setEditMode(false);
      setAvatarFile(null);
      setPreview(null);
      if (onUpdate) onUpdate(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleFavourite = async () => {
    setFavouriting(true);
    try {
      await api.post(`/api/users/favourites/user/${profileUser._id}`);
      setIsFavourited((p) => !p);
    } catch {
      // silently fail
    } finally {
      setFavouriting(false);
    }
  };

  const handleMessage = () => {
    navigate("/messages");
  };

  const bannerUrl = profileUser?.banner
    ? `${BASE_URL}/uploads/images/${profileUser.banner}`
    : null;

  return (
    <div className="card overflow-hidden mb-4 animate-fade-in">
      {/* Banner */}
      <div
        className="h-32 w-full relative"
        style={{
          background: bannerUrl
            ? `url(${bannerUrl}) center/cover no-repeat`
            : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Avatar + info */}
      <div className="px-5 pb-5">
        {/* Avatar row */}
        <div className="flex items-end justify-between -mt-8 mb-3">
          <div className="relative">
            {/* Avatar */}
            <div className="ring-4 ring-white dark:ring-dark-card rounded-full">
              {editMode ? (
                <label className="cursor-pointer block">
                  <Avatar
                    src={preview || profileUser?.avatar}
                    user={profileUser}
                    size="xl"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  {/* Camera overlay */}
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </label>
              ) : (
                <Avatar
                  src={preview || profileUser?.avatar}
                  user={profileUser}
                  size="xl"
                />
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {isOwn ? (
              editMode ? (
                <>
                  <button
                    onClick={() => { setEditMode(false); setPreview(null); setAvatarFile(null); }}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary text-sm px-4 py-2"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="btn-secondary text-sm px-4 py-2"
                >
                  Edit Profile
                </button>
              )
            ) : (
              <>
                <button
                  onClick={handleMessage}
                  className="btn-secondary text-sm px-4 py-2 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Message
                </button>
                <button
                  onClick={handleFavourite}
                  disabled={favouriting}
                  className={`text-sm px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-1.5
                    ${isFavourited
                      ? "bg-brand-500 text-white hover:bg-brand-600"
                      : "btn-secondary"
                    }
                  `}
                >
                  <svg className="w-4 h-4" fill={isFavourited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  {isFavourited ? "Favourited" : "Favourite"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Name + role */}
        <div className="mb-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white font-display">
            {profileUser?.name}
          </h1>
          <p className={`text-sm font-medium capitalize ${getRoleColor(profileUser)}`}>
            {getRole(profileUser)}
            {profileUser?.department ? ` · ${profileUser.department}` : ""}
          </p>
        </div>

        {/* Bio */}
        {editMode ? (
          <div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="Write something about yourself..."
              className="input resize-none text-sm"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{bio.length}/300</p>
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          </div>
        ) : (
          profileUser?.bio && (
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {profileUser.bio}
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;