import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import TimetablePage from "@/pages/timetable/TimetablePage";
import AttendancePage from "@/pages/attendance/AttendancePage";
import MaterialsPage from "@/pages/materials/MaterialsPage";
import ChatPage from "@/pages/chat/ChatPage";
import AssignmentsPage from "@/pages/assignments/AssignmentsPage";
import NotesPage from "@/pages/notes/NotesPage";

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

// Strip trailing slash so React Router's basename works correctly
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated || DEMO_MODE ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        {DEMO_MODE ? (
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        ) : (
          <Route path="/login" element={<LoginPage />} />
        )}
        <Route
          path="/"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="timetable" element={<TimetablePage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="materials" element={<MaterialsPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:channelId" element={<ChatPage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route path="notes" element={<NotesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
