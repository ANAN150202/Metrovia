// Displays the uploaded Routine PDF
import { useState, useEffect } from "react";
import PDFViewer from "../components/academic/PDFViewer";
import { Link } from "react-router-dom";
import api from "../services/api";

const RoutinePage = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/academic/routine");
        setFileUrl(res.data.file?.fileUrl || null);
      } catch (err) {
        setError(err.response?.data?.message || "File not available.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Back + header */}
      <div className="flex items-center gap-3 mb-5">
        <Link
          to="/academic"
          className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-light-hover dark:hover:bg-dark-hover transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white font-display">
            Routine
          </h1>
          <p className="text-xs text-gray-400">Academic document</p>
        </div>
      </div>

      <PDFViewer fileUrl={fileUrl} loading={loading} error={error} />
    </div>
  );
};

export default RoutinePage;