const statusColors = {
  draft: "bg-orange-50 text-orange-600 border-orange-100",
  scheduled: "bg-blue-50 text-blue-600 border-blue-100",
  active: "bg-green-50 text-green-600 border-green-100",
  running: "bg-green-50 text-green-600 border-green-100",
  completed: "bg-gray-50 text-gray-600 border-gray-100",
  queued: "bg-purple-50 text-purple-600 border-purple-100",
  paused: "bg-yellow-50 text-yellow-600 border-yellow-100",
  failed: "bg-red-50 text-red-600 border-red-100",
  cancelled: "bg-gray-50 text-gray-500 border-gray-100",
  APPROVED: "bg-green-50 text-green-600 border-green-100",
  PENDING: "bg-orange-50 text-orange-600 border-orange-100",
  IN_REVIEW: "bg-orange-50 text-orange-600 border-orange-100",
  REJECTED: "bg-red-50 text-red-600 border-red-100",
  DRAFT: "bg-gray-50 text-gray-500 border-gray-100",
};

export default function StatusBadge({ status }) {
  const label = status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase().replace("_", " ");
  const color = statusColors[status] || statusColors.draft;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {label}
    </span>
  );
}
