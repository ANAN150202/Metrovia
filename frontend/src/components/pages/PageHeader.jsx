import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Avatar from "../common/Avatar";
import api from "../../services/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const PageHeader = ({ page, onJoinToggle, onPageUpdate }) => {
  const { user } = useAuth();

  const [joining,      setJoining]      = useState(false);
  const [isMember,     setIsMember]     = useState(
    page.members?.some((m) => m._id === user?._id || m === user?._id) || false
  );
  const [memberCount,  setMemberCount]  = useState(page.members?.length || 0);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferQuery, setTransferQuery] = useState("");
  const [transferUsers, setTransferUsers] = useState([]);
  const [transferring,  setTransferring]  = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarRef = useRef(null);

  const isOwner = page.owner?._id === user?._id || page.owner === user?._id;

  const bannerUrl = page.banner
    ? `${BASE_URL}/uploads/images/${page.banner}`
    : null;

  const avatarObj = { name: page.name, avatar: page.avatar };

  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await api.post(`/api/pages/${page._id}/join`);
      setIsMember(res.data.joined);
      setMemberCount(res.data.memberCount);
      if (onJoinToggle) onJoinToggle(res.data.joined);
    } catch {
      // silently fail
    } finally {
      setJoining(false);
    }
  };

  // Upload page avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await api.put(`/api/pages/${page._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (onPageUpdate) onPageUpdate(res.data.page);
    } catch {
      // silently fail
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Search members for transfer
  const handleTransferSearch = async (q) => {
    setTransferQuery(q);
    if (!q.trim()) { setTransferUsers([]); return; }
    try {
      const res = await api.get(`/api/users/search?q=${q}`);
      // Only show members of this page
      const members = page.members || [];
      const filtered = res.data.users.filter((u) =>
        members.some((m) => m._id === u._id || m === u._id) &&
        u._id !== user?._id
      );
      setTransferUsers(filtered);
    } catch {
      // silently fail
    }
  };

  const handleTransfer = async (newOwnerId, newOwnerName) => {
    if (!window.confirm(`Transfer ownership to ${newOwnerName}? You will lose owner privileges.`)) return;
    setTransferring(true);
    try {
      await api.put(`/api/pages/${page._id}/transfer`, { newOwnerId });
      alert(`Ownership transferred to ${newOwnerName}`);
      setShowTransfer(false);
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Transfer failed.");
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="card overflow-hidden mb-4 animate-fade-in">
      {/* Banner */}
      <div
        className="h-36 w-full"
        style={{
          background: bannerUrl
            ? `url(${bannerUrl}) center/cover no-repeat`
            : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        }}
      />

      {/* Info */}
      <div className="px-5 pb-5 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            {/* Page avatar with upload for owner */}
            <div className="relative -mt-10">
              <div className="ring-4 ring-white dark:ring-dark-card rounded-full">
                <Avatar user={avatarObj} size="lg" />
              </div>
              {isOwner && (
                <>
                  <button
                    onClick={() => avatarRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand-500 hover:bg-brand-600 flex items-center justify-center shadow-md transition-colors"
                    title="Change page avatar"
                  >
                    {uploadingAvatar ? (
                      <svg className="w-3 h-3 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                  <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </>
              )}
            </div>

            {/* Name + info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white font-display truncate">
                {page.name}
              </h1>
              {page.description && (
                <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">{page.description}</p>
              )}
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs text-gray-400">
                  {memberCount} members
                </span>
                {page.owner && (
                  <span className="text-xs text-gray-400">
                    · Managed by{" "}
                    <Link
                      to={`/profile/${page.owner._id || page.owner}`}
                      className="text-brand-500 hover:underline"
                    >
                      {page.owner.name || "Owner"}
                    </Link>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            {!isOwner ? (
              <button
                onClick={handleJoin}
                disabled={joining}
                className={`text-sm px-4 py-2 rounded-xl font-medium transition-all duration-200 ${isMember ? "btn-secondary" : "btn-primary"}`}
              >
                {joining ? "..." : isMember ? "Leave" : "Join"}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="badge-brand text-xs px-3 py-1.5">Owner</span>
                <button
                  onClick={() => setShowTransfer((p) => !p)}
                  className="text-xs text-gray-400 hover:text-brand-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover"
                >
                  Transfer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Transfer ownership panel */}
        {showTransfer && isOwner && (
          <div className="mt-4 p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-panel dark:bg-dark-panel animate-fade-in">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Transfer ownership to a member
            </p>
            <input
              type="text"
              value={transferQuery}
              onChange={(e) => handleTransferSearch(e.target.value)}
              placeholder="Search members..."
              className="input text-sm mb-2"
            />
            {transferUsers.length === 0 && transferQuery && (
              <p className="text-xs text-gray-400">No members found. Only page members can receive ownership.</p>
            )}
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {transferUsers.map((u) => (
                <button
                  key={u._id}
                  onClick={() => handleTransfer(u._id, u.name)}
                  disabled={transferring}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-all text-left"
                >
                  <Avatar user={u} size="xs" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{u.role}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowTransfer(false)} className="mt-2 text-xs text-gray-400 hover:text-gray-600">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;