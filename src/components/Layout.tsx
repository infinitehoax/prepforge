import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  History,
  Trophy,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Start Exam", icon: BookOpen, path: "/select" },
  { label: "History", icon: History, path: "/history" },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className="w-56 flex-shrink-0 flex flex-col border-r"
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{ background: "var(--accent-blue)" }}
          >
            <Zap size={16} fill="white" color="white" />
          </div>
          <div>
            <div
              className="text-sm font-bold tracking-wide"
              style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-primary)" }}
            >
              PrepForge
            </div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              JAMB & WAEC
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`nav-item w-full ${active ? "active" : ""}`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom badge */}
        <div className="px-4 py-4">
          <div
            className="rounded-xl p-3 text-center"
            style={{
              background: "rgba(14,165,233,0.08)",
              border: "1px solid rgba(14,165,233,0.2)",
            }}
          >
            <Trophy size={18} className="mx-auto mb-1" style={{ color: "var(--accent-amber)" }} />
            <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              2026 JAMB ready
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ background: "var(--bg-primary)" }}
      >
        <Outlet />
      </main>
    </div>
  );
}
