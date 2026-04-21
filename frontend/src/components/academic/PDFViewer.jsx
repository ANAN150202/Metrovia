import Spinner from "../common/Spinner";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const PDFViewer = ({ fileUrl, loading, error }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="md" text="Loading PDF..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-10 text-center">
        <p className="text-gray-900 dark:text-white font-semibold text-sm">{error}</p>
        <p className="text-gray-400 text-xs mt-1">No file has been uploaded yet</p>
      </div>
    );
  }

  if (!fileUrl) {
    return (
      <div className="card p-10 text-center">
        <p className="text-gray-900 dark:text-white font-semibold text-sm">No file available</p>
        <p className="text-gray-400 text-xs mt-1">Admin has not uploaded this file yet</p>
      </div>
    );
  }

  const rawUrl = fileUrl.startsWith("http") ? fileUrl : `${BASE_URL}${fileUrl}`;

  // Use Google Docs Viewer to embed PDF inline
  // This works for any publicly accessible PDF URL including Cloudinary
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`;

  return (
    <div className="card overflow-hidden">
      <iframe
        src={googleViewerUrl}
        title="PDF Viewer"
        className="w-full"
        style={{ height: "80vh", border: "none" }}
      />
    </div>
  );
};

export default PDFViewer;