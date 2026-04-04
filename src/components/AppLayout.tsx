import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, CalendarCheck, MessageCircle, Menu, X, FileText, Users, BarChart3, LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { apiPost, clearAuthSession } from "@/lib/api-client";
import { DASHBOARD_BASE } from "@/lib/routes";
import { toast } from "sonner";

const base = DASHBOARD_BASE;

const navItems = [
  { label: "Dashboard", path: base, icon: LayoutDashboard },
  { label: "Bookings", path: `${base}/bookings`, icon: CalendarCheck },
  { label: "Customers", path: `${base}/customers`, icon: Users },
  { label: "Analytics", path: `${base}/analytics`, icon: BarChart3 },
  { label: "Chat", path: `${base}/chat`, icon: MessageCircle },
  { label: "Templates", path: `${base}/templates`, icon: FileText },
];

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === base) {
      return location.pathname === base || location.pathname === `${base}/`;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await apiPost<{ data: { message: string } }>("/auth/logout", {});
    } catch {
      // Token may already be invalid; still clear local session.
    }
    clearAuthSession();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background-subtle w-full max-w-[100vw] overflow-x-hidden">
      {/* Top header */}
      <header className="sticky top-0 z-50 bg-primary border-b border-primary">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-primary-foreground/10 transition-colors text-primary-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(base)}>
              <img src="/logo.svg" alt="Logo" className="w-6 h-6 object-contain" />
              <h1 className="text-lg font-semibold text-primary-foreground">
                Gilitour
              </h1>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold tracking-[0.1px] transition-colors",
                  isActive(item.path)
                    ? "bg-primary-foreground/25 text-primary-foreground font-bold"
                    : "text-primary-foreground/85 hover:text-primary-foreground hover:bg-primary-foreground/12"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold tracking-[0.1px] text-primary-foreground/85 hover:text-primary-foreground hover:bg-primary-foreground/12"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-14 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <nav className="bg-primary p-2 space-y-1" onClick={(e) => e.stopPropagation()}>
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-[0.1px] transition-colors",
                  isActive(item.path)
                    ? "bg-primary-foreground/25 text-primary-foreground font-bold"
                    : "text-primary-foreground/85 hover:text-primary-foreground hover:bg-primary-foreground/12"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setMobileOpen(false); void handleLogout(); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-[0.1px] text-primary-foreground/85 hover:text-primary-foreground hover:bg-primary-foreground/12"
            >
              <LogOut className="h-5 w-5" />
              Log out
            </button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-[1200px] mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
