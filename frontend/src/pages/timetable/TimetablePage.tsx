import { useQuery } from "@tanstack/react-query";
import { getMyTimetable, getPeriods } from "@/api/timetable";
import { clsx } from "clsx";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function TimetablePage() {
  const { data: entries, isLoading } = useQuery({
    queryKey: ["my-timetable"],
    queryFn: () => getMyTimetable(),
  });
  const { data: periods } = useQuery({
    queryKey: ["periods"],
    queryFn: () => getPeriods(),
  });

  if (isLoading) return <div className="text-gray-500">Loading timetable…</div>;

  const todayIndex = new Date().getDay();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Timetable</h1>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left p-3 text-gray-500 font-medium w-20">Period</th>
              {DAYS.map((d, i) => (
                <th
                  key={d}
                  className={clsx(
                    "text-left p-3 font-medium",
                    i + 1 === todayIndex ? "text-blue-600" : "text-gray-700"
                  )}
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(periods ?? []).map((period) => (
              <tr key={period.id} className="border-t border-gray-100">
                <td className="p-3 text-gray-500">
                  <div className="font-medium">{period.number}</div>
                  <div className="text-xs">{period.start_time}</div>
                </td>
                {DAYS.map((_, dayIdx) => {
                  const day = dayIdx + 1;
                  const entry = entries?.find((e) => e.day === day && e.period === period.id);
                  return (
                    <td key={day} className="p-2">
                      {entry && (
                        <div
                          className="rounded-lg p-2 text-white text-xs"
                          style={{ backgroundColor: entry.subject.color }}
                        >
                          <div className="font-semibold">{entry.subject.short_name}</div>
                          {entry.room_name && <div className="opacity-80">{entry.room_name}</div>}
                          {entry.teacher_name && (
                            <div className="opacity-80 truncate">{entry.teacher_name}</div>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
