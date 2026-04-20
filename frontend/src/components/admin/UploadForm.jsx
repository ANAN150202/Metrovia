// Admin PDF upload form with category selector
import { useState, useRef } from "react";
import api from "../../services/api";

const TYPES = [
  { value: "routine",  label: "Class Routine",  color: "from-blue-500 to-cyan-500" },
  { value: "result",   label: "Exam Results",   color: "from-green-500 to-emerald-500" },
  { value: "seatplan", label: "Seat Plan",      color: "from-violet-500 to-purple-500" },
];

const UploadForm = ({ onUploaded }) => {
  const [selectedType, setSelectedType] = useState("routine");
  const [file,         setFile]         = useState(null);
  const [uploading,    setUploading]    = useState(false);
  const [success,      setSuccess]      = useState(null);
  const [error,        setError]        = useState(null);
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }
    setFile(f);
    setError(null);
    setSuccess(null);
  };

  const handleUpload = async () => {
    if (!file) { setError("Please select a PDF file."); return; }
    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      await api.post(`/api/admin/upload/${selectedType}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const label = TYPES.find((t) => t.value === selectedType)?.label;
      setSuccess(`${label} uploaded successfully.`);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      if (onUploaded) onUploaded(selectedType);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">

      {/* Type selector */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Select document type
        </p>
        <div className="grid grid-cols-3 gap-3">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => { setSelectedType(t.value); setFile(null); setError(null); setSuccess(null); if (fileRef.current) fileRef.current.value = ""; }}
              className={`
                p-3 rounded-xl border text-sm font-medium transition-all duration-200
                ${selectedType === t.value
                  ? "border-brand-500/50 bg-brand-500/10 text-brand-400 shadow-glow-sm"
                  : "border-dark-border text-gray-400 hover:border-gray-600 hover:text-gray-300"
                }
              `}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* File drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${file
            ? "border-brand-500/50 bg-brand-500/5"
            : "border-dark-border hover:border-gray-600"
          }
        `}
      >
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="ml-2 text-gray-500 hover:text-red-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div>
            <svg className="w-10 h-10 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-400">
              Click to select a PDF file
            </p>
            <p className="text-xs text-gray-600 mt-1">Max 20MB</p>
          </div>
        )}
      </div>

      {/* Feedback */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <svg className="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
          <svg className="w-4 h-4 text-green-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-green-400">{success}</p>
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full btn-primary py-3 disabled:opacity-50"
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Uploading...
          </span>
        ) : (
          "Upload PDF"
        )}
      </button>
    </div>
  );
};

export default UploadForm;