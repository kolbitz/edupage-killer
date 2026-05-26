import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { LogOut, Bell } from "lucide-react";
import { logout as apiLogout } from "@/api/auth";

export default function Header() {
  const { logout, refreshToken } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (refreshToken) await apiLogout(refreshToken);
    } catch {
      // ignore
    }
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <Bell size={18} />
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </header>
  );
}
