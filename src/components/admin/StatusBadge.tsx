// One colour map for every status across leads, quotations and invoices so
// the same word always looks the same (the dashboard used one colour for all).
const colors: Record<string, string> = {
  // leads
  new: "bg-amber-50 text-amber-700",
  contacted: "bg-blue-50 text-blue-600",
  quoted: "bg-indigo-50 text-indigo-600",
  booked: "bg-green-50 text-green-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-600",
  // quotations / invoices
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-blue-50 text-blue-600",
  accepted: "bg-green-50 text-green-700",
  declined: "bg-red-50 text-red-600",
  expired: "bg-yellow-50 text-yellow-700",
  paid: "bg-green-50 text-green-700",
  // derived
  overdue: "bg-red-50 text-red-600",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}
