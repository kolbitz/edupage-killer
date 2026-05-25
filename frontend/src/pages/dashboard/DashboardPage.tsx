import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { getMyTimetable } from "@/api/timetable";
import { getAssignments } from "@/api/assignments";
import { Calendar, BookOpen, UserCheck, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const today = new Date().getDay() || 7;

  const { data: timetable } = useQuery({
    queryKey: ["my-timetable"],
    queryFn: () => getMyTimetable().then((r) => r.data),
  });

  const { data: assignments } = useQuery({
    queryKey: ["assignments"],
    queryFn: () => getAssignments().then((r) => r.data),
  });

  const todayEntries = timetable?.filter((e) => e.day === today) ?? [];
  const upcomingAssignments = assignments?.filter((a) => !a.is_overdue).slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Good {getGreeting()}, {user?.full_name?.split(" ")[0]}
        </h1>
        <p className="text-gray-500">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Calendar}
          label="Today's lessons"
          value={String(todayEntries.length)}
          color="blue"
        />
        <StatCard
          icon={BookOpen}
          label="Pending work"
          value={String(upcomingAssignments.length)}
          color="orange"
        />
        <StatCard icon={UserCheck} label="Role" value={user?.role ?? "-"} color="green" />
        <StatCard
          icon={TrendingUp}
          label="This week"
          value={`${timetable?.length ?? 0} lessons`}
          color="purple"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's schedule */}
        <div className="card">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-blue-500" />
            Today's Schedule
          </h2>
          {todayEntries.length === 0 ? (
            <p className="text-gray-500 text-sm">No classes today</p>
          ) : (
            <div className="space-y-2">
              {todayEntries.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.subject.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{entry.subject.name}</p>
                    <p className="text-xs text-gray-500">
                      {entry.period_info.start_time}–{entry.period_info.end_time}
                      {entry.room_name && ` · ${entry.room_name}`}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">P{entry.period_info.number}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming assignments */}
        <div className="card">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <BookOpen size={16} className="text-orange-500" />
            Upcoming Assignments
          </h2>
          {upcomingAssignments.length === 0 ? (
            <p className="text-gray-500 text-sm">All caught up!</p>
          ) : (
            <div className="space-y-2">
              {upcomingAssignments.map((a) => (
                <div key={a.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-gray-500">{a.subject_name}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                        a.assignment_type === "exam"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {a.assignment_type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Due {format(new Date(a.due_date), "MMM d, HH:mm")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
