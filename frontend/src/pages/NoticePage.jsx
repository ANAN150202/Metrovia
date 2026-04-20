// Full list of all notices
import { useState, useEffect } from "react";
import api from "../services/api";
import NoticeCard from "../components/notice/NoticeCard";
import Spinner from "../components/common/Spinner";

const NoticePage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
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
    fetch();
  }, []);

  const handleDelete = (id) => {
    setNotices((prev) => prev.filter((n) => n._id !== id));
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
          Notices
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Official announcements from the administration
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="md" />
        </div>
      ) : notices.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-gray-900 dark:text-white font-semibold text-sm">No notices yet</p>
          <p className="text-gray-400 text-xs mt-1">Check back later for announcements</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((notice) => (
            <NoticeCard key={notice._id} notice={notice} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default NoticePage;