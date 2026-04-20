// Table listing all registered users
import { useState, useEffect } from "react";
import Avatar from "../common/Avatar";
import Spinner from "../common/Spinner";
import api from "../../services/api";
import { formatDate } from "../../utils/formatDate";

const UserTable = () => {
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search,    setSearch]    = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/admin/users");
        setUsers(res.data.users || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    setDeletingId(userId);
    try {
      await api.delete(`/api/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-sm"
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>{users.filter((u) => u.role === "student").length} students</span>
        <span>·</span>
        <span>{users.filter((u) => u.role === "teacher").length} teachers</span>
        <span>·</span>
        <span>{users.length} total</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size="md" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-sm">
          {search ? "No users match your search" : "No users registered yet"}
        </div>
      ) : (
        <div className="rounded-xl border border-dark-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-dark-panel border-b border-dark-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filtered.map((u) => (
                <tr key={u._id} className="bg-dark-card hover:bg-dark-hover transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={u} size="sm" />
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{u.name}</p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`
                      inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${u.role === "teacher"
                        ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                        : "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                      }
                    `}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(u._id)}
                      disabled={deletingId === u._id}
                      className="text-xs text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50 px-2 py-1 rounded-lg hover:bg-red-500/10"
                    >
                      {deletingId === u._id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserTable;