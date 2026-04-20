// Browse all club/society pages
import { useState, useEffect } from "react";
import PageCard from "../components/pages/PageCard";
import CreatePageModal from "../components/pages/CreatePageModal";
import Spinner from "../components/common/Spinner";
import api from "../services/api";

const PagesPage = () => {
  const [pages,       setPages]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching,   setSearching]   = useState(false);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/pages");
      setPages(res.data.pages || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (!q.trim()) {
      fetchPages();
      return;
    }
    setSearching(true);
    try {
      const res = await api.get(`/api/pages/search?q=${q}`);
      setPages(res.data.pages || []);
    } catch {
      // silently fail
    } finally {
      setSearching(false);
    }
  };

  const handlePageCreated = (newPage) => {
    setPages((prev) => [newPage, ...prev]);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            Pages
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Clubs, societies and communities
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary text-sm flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search pages..."
          className="input pl-9"
        />
      </div>

      {/* Grid */}
      {loading || searching ? (
        <div className="flex justify-center py-12">
          <Spinner size="md" />
        </div>
      ) : pages.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-gray-900 dark:text-white font-semibold text-sm">
            {searchQuery ? "No pages found" : "No pages yet"}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            {searchQuery ? "Try a different search" : "Be the first to create one!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pages.map((page) => (
            <PageCard key={page._id} page={page} />
          ))}
        </div>
      )}

      <CreatePageModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreated={handlePageCreated}
      />
    </div>
  );
};

export default PagesPage;