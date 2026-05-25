import { useQuery } from "@tanstack/react-query";
import { getMyAttendance } from "@/api/attendance";
import { format } from "date-fns";
import { clsx } from "clsx";

const STATUS_STYLES: Record<string, string> = {
  present: "bg-green-100 text-green-700",
  absent: "bg-red-100 text-red-700",
  late: "bg-yellow-100 text-yellow-700",
  excused: "bg-blue-100 text-blue-700",
};

export default function AttendancePage() {
  const { data: records, isLoading } = useQuery({
    queryKey: ["my-attendance"],
    queryFn: () => getMyAttendance().then((r) => r.data),
  });

  const stats = {
    present: records?.filter((r) => r.status === "present").length ?? 0,
    absent: records?.filter((r) => r.status === "absent").length ?? 0,
    late: records?.filter((r) => r.status === "late").length ?? 0,
    excused: records?.filter((r) => r.status === "excused").length ?? 0,
  };
  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  const attendanceRate = total > 0 ? Math.round((stats.present / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(stats).map(([status, count]) => (
          <div key={status} className="card text-center">
            <div className="text-3xl font-bold">{count}</div>
            <div
              className={clsx(
                "text-sm mt-1 capitalize px-2 py-0.5 rounded-full inline-block",
                STATUS_STYLES[status]
              )}
            >
              {status}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Overall attendance rate</span>
          <span
            className={clsx(
              "font-bold text-lg",
              attendanceRate >= 80 ? "text-green-600" : "text-red-600"
            )}
          >
            {attendanceRate}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={clsx(
              "h-2 rounded-full",
              attendanceRate >= 80 ? "bg-green-500" : "bg-red-500"
            )}
            style={{ width: `${attendanceRate}%` }}
          />
        </div>
      </div>

      {/* Records table */}
      <div className="card">
        <h2 className="font-semibold mb-4">Attendance Records</h2>
        {isLoading ? (
          <p className="text-gray-500">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Date</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Subject</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {records?.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3">{format(new Date(record.date), "MMM d, yyyy")}</td>
                    <td className="py-2 px-3">{record.subject_name || "—"}</td>
                    <td className="py-2 px-3">
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded-full text-xs capitalize",
                          STATUS_STYLES[record.status]
                        )}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-500">{record.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
