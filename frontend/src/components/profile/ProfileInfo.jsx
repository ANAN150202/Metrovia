// Info tab: department, year, email, etc.
import { formatDate } from "../../utils/formatDate";

const InfoRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-light-border dark:border-dark-border last:border-0">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider w-24 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-gray-800 dark:text-gray-200 capitalize">
        {value}
      </span>
    </div>
  );
};

const ProfileInfo = ({ profileUser }) => {
  return (
    <div className="card p-5 mb-4">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 font-display">
        About
      </h2>
      <div>
        <InfoRow label="Role"       value={profileUser?.role} />
        <InfoRow label="Department" value={profileUser?.department} />
        <InfoRow label="Year"       value={profileUser?.year} />
        <InfoRow label="ID"         value={profileUser?.studentId} />
        <InfoRow label="Email"      value={profileUser?.email} />
        <InfoRow
          label="Joined"
          value={profileUser?.createdAt
            ? new Date(profileUser.createdAt).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
              })
            : null
          }
        />
      </div>
    </div>
  );
};

export default ProfileInfo;