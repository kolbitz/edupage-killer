import { NavLink } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  FileText,
  MessageSquare,
  BookOpen,
  StickyNote,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/timetable", icon: Calendar, label: "Timetable" },
  { to: "/attendance", icon: UserCheck, label: "Attendance" },
  { to: "/materials", icon: FileText, label: "Materials" },
  { to: "/chat", icon: MessageSquare, label: "Chat" },
  { to: "/assignments", icon: BookOpen, label: "Assignments" },
  { to: "/notes", icon: StickyNote, label: "Notes" },
];

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">EduKiller</h1>
        <p className="text-xs text-gray-500 mt-0.5">School Management</p>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
            {user?.full_name?.charAt(0) ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
