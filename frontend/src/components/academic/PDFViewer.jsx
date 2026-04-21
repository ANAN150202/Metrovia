import Spinner from "../common/Spinner";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// ─────────────────────────────────────────────────────────────
// Transforms a Cloudinary raw URL to force inline display
// Without this, Cloudinary serves PDFs as downloads
// ─────────────────────────────────────────────────────────────
const getInlinePdfUrl = (url) => {
  if (!url) return url;

  // For Cloudinary raw URLs, insert fl_attachment:false transformation
  // Before: https://res.cloudinary.com/xxx/raw/upload/metrovia/pdfs/...
  // After:  https://res.cloudinary.com/xxx/raw/upload/fl_attachment:false/metrovia/pdfs/...
  if (url.includes("cloudinary.com") && url.includes("/raw/upload/")) {
    return url.replace("/raw/upload/", "/raw/upload/fl_attachment:false/");
  }

  return url;
};

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

  // Build full URL and apply inline transformation
  const rawUrl    = fileUrl.startsWith("http") ? fileUrl : `${BASE_URL}${fileUrl}`;
  const inlineUrl = getInlinePdfUrl(rawUrl);

  return (
    <div className="card overflow-hidden">
      <iframe
        src={inlineUrl}
        title="PDF Viewer"
        className="w-full"
        style={{ height: "80vh", border: "none" }}
      />
    </div>
  );
};

export default PDFViewer;