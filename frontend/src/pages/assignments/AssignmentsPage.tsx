import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAssignments, getGrades } from "@/api/assignments";
import { format } from "date-fns";
import { clsx } from "clsx";
import { BookOpen, Clock, AlertCircle } from "lucide-react";

type Tab = "assignments" | "grades";

export default function AssignmentsPage() {
  const [tab, setTab] = useState<Tab>("assignments");
  const { data: assignments, isLoading: loadingAssignments } = useQuery({
    queryKey: ["assignments"],
    queryFn: () => getAssignments().then((r) => r.data),
  });

  const { data: grades, isLoading: loadingGrades } = useQuery({
    queryKey: ["grades"],
    queryFn: () => getGrades().then((r) => r.data),
    enabled: tab === "grades",
  });

  const TYPE_BADGE: Record<string, string> = {
    homework: "bg-blue-100 text-blue-700",
    exam: "bg-red-100 text-red-700",
    quiz: "bg-yellow-100 text-yellow-700",
    project: "bg-purple-100 text-purple-700",
    lab: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Assignments & Grades</h1>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(["assignments", "grades"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
              tab === t ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "assignments" && (
        <div className="space-y-3">
          {loadingAssignments ? (
            <p className="text-gray-500">Loading…</p>
          ) : assignments?.length === 0 ? (
            <div className="card text-center py-12 text-gray-400">
              <BookOpen size={40} className="mx-auto mb-3 opacity-50" />
              <p>No assignments yet</p>
            </div>
          ) : (
            assignments?.map((a) => (
              <div key={a.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div
                    className={clsx(
                      "mt-1 p-2 rounded-lg",
                      a.is_overdue ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                    )}
                  >
                    {a.is_overdue ? <AlertCircle size={18} /> : <Clock size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium">{a.title}</h3>
                      <span
                        className={clsx(
                          "text-xs px-2 py-0.5 rounded-full flex-shrink-0 capitalize",
                          TYPE_BADGE[a.assignment_type] ?? "bg-gray-100 text-gray-600"
                        )}
                      >
                        {a.assignment_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {a.subject_name} · by {a.assigned_by_name}
                    </p>
                    {a.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span
                        className={clsx(
                          "text-xs font-medium",
                          a.is_overdue ? "text-red-500" : "text-gray-500"
                        )}
                      >
                        Due {format(new Date(a.due_date), "MMM d, HH:mm")}
                      </span>
                      {a.max_score && (
                        <span className="text-xs text-gray-400">Max: {a.max_score} pts</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "grades" && (
        <div className="card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Subject</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Grade</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Score</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {loadingGrades ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    Loading…
                  </td>
                </tr>
              ) : (
                grades?.map((g) => (
                  <tr key={g.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium">{g.subject_name}</td>
                    <td className="py-2 px-3">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono font-bold">
                        {g.label || g.value}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-600">
                      {g.value}/{g.max_value}
                    </td>
                    <td className="py-2 px-3 text-gray-400">{format(new Date(g.date), "MMM d")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
