// Formats timestamps into relative strings like '2 hours ago'
// ─────────────────────────────────────────────────────────────
// formatDate.js — Date & Time Formatting Helpers
//
// Used everywhere timestamps appear:
//   - Post cards ("2 hours ago")
//   - Comments ("Just now")
//   - Notices ("Dec 12, 2024")
//   - Messages ("10:45 AM")
// ─────────────────────────────────────────────────────────────


// ── timeAgo() ────────────────────────────────────────────────
// Converts a date/timestamp into a human-readable relative
// string like "2 hours ago", "3 days ago", "Just now".
//
// Usage:
//   timeAgo("2024-12-10T08:30:00Z")  → "2 days ago"
//   timeAgo(new Date())              → "Just now"

export const timeAgo = (date) => {
  if (!date) return "";

  const now      = new Date();
  const past     = new Date(date);
  const secondsAgo = Math.floor((now - past) / 1000);

  // Handle invalid dates
  if (isNaN(secondsAgo)) return "";

  // Just now (under 30 seconds)
  if (secondsAgo < 30) {
    return "Just now";
  }

  // Less than a minute
  if (secondsAgo < 60) {
    return `${secondsAgo} seconds ago`;
  }

  const minutesAgo = Math.floor(secondsAgo / 60);

  // Less than an hour
  if (minutesAgo < 60) {
    return minutesAgo === 1 ? "1 minute ago" : `${minutesAgo} minutes ago`;
  }

  const hoursAgo = Math.floor(minutesAgo / 60);

  // Less than a day
  if (hoursAgo < 24) {
    return hoursAgo === 1 ? "1 hour ago" : `${hoursAgo} hours ago`;
  }

  const daysAgo = Math.floor(hoursAgo / 24);

  // Less than a week
  if (daysAgo < 7) {
    return daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`;
  }

  const weeksAgo = Math.floor(daysAgo / 7);

  // Less than a month
  if (weeksAgo < 4) {
    return weeksAgo === 1 ? "1 week ago" : `${weeksAgo} weeks ago`;
  }

  const monthsAgo = Math.floor(daysAgo / 30);

  // Less than a year
  if (monthsAgo < 12) {
    return monthsAgo === 1 ? "1 month ago" : `${monthsAgo} months ago`;
  }

  const yearsAgo = Math.floor(daysAgo / 365);

  return yearsAgo === 1 ? "1 year ago" : `${yearsAgo} years ago`;
};


// ── formatFullDate() ─────────────────────────────────────────
// Formats a date into a clean readable string.
//
// Usage:
//   formatFullDate("2024-12-10T08:30:00Z")  → "Dec 10, 2024"

export const formatFullDate = (date) => {
  if (!date) return "";

  const parsed = new Date(date);
  if (isNaN(parsed)) return "";

  return parsed.toLocaleDateString("en-US", {
    year:  "numeric",
    month: "short",
    day:   "numeric",
  });
};


// ── formatTime() ─────────────────────────────────────────────
// Formats a date into a time string.
//
// Usage:
//   formatTime("2024-12-10T08:30:00Z")  → "8:30 AM"

export const formatTime = (date) => {
  if (!date) return "";

  const parsed = new Date(date);
  if (isNaN(parsed)) return "";

  return parsed.toLocaleTimeString("en-US", {
    hour:   "numeric",
    minute: "2-digit",
    hour12: true,
  });
};


// ── formatDateTime() ─────────────────────────────────────────
// Combines date + time for things like messages.
//
// Usage:
//   formatDateTime("2024-12-10T08:30:00Z")  → "Dec 10, 2024 · 8:30 AM"

export const formatDateTime = (date) => {
  if (!date) return "";

  const d = formatFullDate(date);
  const t = formatTime(date);

  if (!d || !t) return "";

  return `${d} · ${t}`;
};


// ── formatDate() ─────────────────────────────────────────────
// Smart formatter — uses "time ago" for recent dates,
// falls back to full date for older ones.
// This is the main one to use in most places.
//
// Usage:
//   formatDate("2024-12-10T08:30:00Z")
//   → "2 days ago"   (if recent)
//   → "Dec 10, 2024" (if older than 7 days)

export const formatDate = (date) => {
  if (!date) return "";

  const now    = new Date();
  const past   = new Date(date);
  const daysAgo = Math.floor((now - past) / (1000 * 60 * 60 * 24));

  // Use "time ago" for anything within the last 7 days
  if (daysAgo < 7) {
    return timeAgo(date);
  }

  // Fall back to full date for older content
  return formatFullDate(date);
};

// Default export is the smart formatter
export default formatDate;