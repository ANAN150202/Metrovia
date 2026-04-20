// Admin panel: upload PDFs, manage users, post notices
import { useState } from "react";
import UploadForm from "../components/admin/UploadForm";
import UserTable from "../components/admin/UserTable";
import ManageNotices from "../components/admin/ManageNotices";

const TABS = [
  { id: "upload",  label: "Upload PDFs",    icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" },
  { id: "notices", label: "Manage Notices", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
  { id: "users",   label: "Manage Users",   icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <div className="animate-fade-in">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white font-display">
          Admin Dashboard
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Manage academic files, notices and users
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 mb-6 bg-dark-card border border-dark-border rounded-2xl p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
              text-sm font-medium transition-all duration-200
              ${activeTab === tab.id
                ? "bg-gradient-brand text-white shadow-glow-sm"
                : "text-gray-400 hover:text-gray-200 hover:bg-dark-hover"
              }
            `}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        className="rounded-2xl border border-dark-border p-6"
        style={{ background: "rgba(20, 20, 30, 0.6)" }}
      >
        {activeTab === "upload"  && <UploadForm />}
        {activeTab === "notices" && <ManageNotices />}
        {activeTab === "users"   && <UserTable />}
      </div>

    </div>
  );
};

export default AdminDashboard;