import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Car,
  Users,
  Wrench,
  Receipt,
  Bell,
  BarChart2,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  FileText,
  Sun,
  Moon,
  IndianRupee,
  Network,
  Crown,
  UserRoundPlus,
  Wallet,
  UserRoundCog,
  Database,
  LockKeyhole,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [user, setUser] = useState({});
  const [loadingUser, setLoadingUser] = useState(true);

  const isStaff = user?.type === "staff";
  const userPlan = user?.plan || "BASIC";

  const canAccessStaff = ["STANDARD", "PREMIUM"].includes(userPlan);
  const canAccessSalary = ["PREMIUM"].includes(userPlan);
  const isPlanExpired = user?.planExpiry && new Date(user.planExpiry) < new Date();

const ALLOWED_WHEN_EXPIRED = [
  "/car-dashboard",
  "/plan",
  "/reference",
  "/upgrade",
];

  /* ================================
      LOAD PROFILE (OWNER / STAFF)
   ================================= */
  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoadingUser(false);
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const isStaffToken = payload.type === "staff";

        const url = isStaffToken
          ? `${import.meta.env.VITE_API_BASE_URL}/api/staff-auth/profile`
          : `${import.meta.env.VITE_API_BASE_URL}/api/user/profile`;

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (!res.ok) throw new Error("Profile fetch failed");

        const profile = await res.json();

        const normalizedUser = {
          ...profile,
          type: isStaffToken ? "staff" : "owner",
        };

        localStorage.setItem("user", JSON.stringify(normalizedUser));
        setUser(normalizedUser);

        window.dispatchEvent(new Event("user-updated"));
      } catch (err) {
        console.error("Profile load error:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
      } finally {
        setLoadingUser(false);
      }
    };

    loadProfile();

    const handleUserUpdate = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    };

    window.addEventListener("user-updated", handleUserUpdate);
    return () => window.removeEventListener("user-updated", handleUserUpdate);
  }, [navigate]);

  /* ================================
      MENU CONFIG
   ================================= */
  const menu = [
    { to: "/car-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/clients", label: "Clients", icon: Users },
    { to: "/services", label: "Services", icon: Wrench },
    { to: "/billing", label: "Billing", icon: Receipt },
    { to: "/reminders", label: "Reminders", icon: Bell },
    { to: "/reports", label: "Reports", icon: BarChart2 },
    { to: "/ocr-scanner", label: "OCR Scanner", icon: FileText },
    { to: "/staff-management", label: "Staff Management", icon: UserRoundPlus },
    { to: "/salary-management", label: "Salary Management", icon: Wallet },
    { to: "/dynamic-data", label: "Data", icon: Database },
    { to: "/plan", label: "Your Plan", icon: IndianRupee },
    { to: "/reference", label: "Reference", icon: Network },
    { to: "/upgrade", label: "Upgrade", icon: Crown },
  ];

  const filteredMenu = menu.filter((item) => {
    // STAFF LOGIN RULES (unchanged)
    if (isStaff) {
      return [
        "/car-dashboard",
        "/clients",
        "/services",
        "/billing",
        "/reminders",
        "/reports",
        "/ocr-scanner",
      ].includes(item.to);
    }

    // OWNER PLAN RULES
    if (
      (item.to === "/staff-management" || item.to === "/data") &&
      !canAccessStaff
    )
      return false;

    if (item.to === "/salary-management" && !canAccessSalary) return false;

    return true;
  });

  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const logout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  /* ================================
      THEME COLORS
   ================================= */
  const colors = {
    layoutBg: isDark ? "#020617" : "#FFFFFF",
    mainBg: isDark ? "#020617" : "#F8FAFC",
    elementBg: isDark ? "#020D36" : "#FFFFFF",
    textPrimary: isDark ? "#E5E7EB" : "#0F172A",
    textSecondary: isDark ? "#94A3B8" : "#475569",
    brand: isDark ? "#1E3A8A" : "#0B1D51",
    primaryButton: isDark ? "#3B82F6" : "#0046FF",
    border: isDark ? "#1E293B" : "#E5E7EB",
    hoverBg: isDark ? "#1E293B" : "#F8FAFC",
  };

  if (loadingUser) return null;

  return (
    <div
      className="min-h-screen flex transition-colors duration-300"
      style={{ backgroundColor: colors.mainBg }}
    >
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full transition-all duration-300 ease-in-out
          border-r flex flex-col
          ${sidebarExpanded ? "w-64" : "w-20"} 
          lg:translate-x-0
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }
        `}
        style={{
          backgroundColor: colors.layoutBg,
          borderColor: colors.border,
        }}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo */}
          <div
            className="flex items-center justify-between h-16 px-4 border-b flex-shrink-0"
            style={{ borderColor: colors.border }}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-lg shadow-lg flex-shrink-0"
                style={{ backgroundColor: colors.primaryButton }}
              >
                <Car className="w-6 h-6 text-white" />
              </div>

              {/* ANIMATED LOGO TEXT */}
              <div
                className={`font-poppins font-bold text-xl whitespace-nowrap transition-all duration-300 ease-in-out ${
                  sidebarExpanded
                    ? "opacity-100 max-w-[200px]"
                    : "opacity-0 max-w-0"
                }`}
                style={{ color: isDark ? "#FFFFFF" : colors.brand }}
              >
                {user?.companyName || user?.company || "Motor Desk"}
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 transition-colors rounded-lg lg:hidden"
              style={{ color: colors.textSecondary }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
            {filteredMenu.map((item) => {
  const ALLOWED_WHEN_EXPIRED = [
    "/car-dashboard",
    "/plan",
    "/reference",
    "/upgrade",
  ];

  const isLocked =
    !isStaff &&
    isPlanExpired &&
    !ALLOWED_WHEN_EXPIRED.includes(item.to);

  return (
    <NavLink
      key={item.to}
      to={isLocked ? "/upgrade" : item.to}
      onClick={(e) => {
        if (isLocked) {
          e.preventDefault();
          navigate("/upgrade");
          return;
        }
        setSidebarOpen(false);
      }}
      className={({ isActive }) => `
        flex items-center px-3 py-3 rounded-xl font-medium transition-all duration-200 group
        ${isActive ? "shadow-lg" : ""}
      `}
      style={({ isActive }) => ({
        backgroundColor: isActive
          ? colors.primaryButton
          : "transparent",
        color: isLocked
          ? "#94A3B8"
          : isActive
          ? "#FFFFFF"
          : colors.textSecondary,
        opacity: isLocked ? 0.6 : 1,
        cursor: isLocked ? "not-allowed" : "pointer",
      })}
    >
      {({ isActive }) => {
        const Icon = item.icon;
        return (
          <>
            <Icon
              className="w-5 h-5 flex-shrink-0 transition-colors duration-200"
              style={{
                color: isLocked
                  ? "#94A3B8"
                  : isActive
                  ? "#FFFFFF"
                  : colors.textSecondary,
              }}
            />

            {/* ANIMATED MENU LABEL */}
            <span
              className={`whitespace-nowrap flex overflow-hidden transition-all duration-300 ease-in-out ${
                sidebarExpanded
                  ? "opacity-100 w-auto ml-3"
                  : "opacity-0 w-0 ml-0"
              }`}
            >
              {item.label}
      {isLocked && (
  <span className="ml-2 flex items-center flex-end leading-none">
    <LockKeyhole className="h-4 w-4 shrink-0" />
  </span>
)}


            </span>
          </>
        );
      }}
    </NavLink>
  );
})}

          </nav>

          {/* Logout Button */}
          <div className="p-3 flex-shrink-0">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center px-3 py-3 rounded-xl font-medium transition-all duration-200 border hover:bg-opacity-80 overflow-hidden"
              style={{
                backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "#FEF2F2",
                borderColor: isDark ? "rgba(239, 68, 68, 0.2)" : "#FECACA",
                color: "#DC2626",
              }}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />

              {/* ANIMATED LOGOUT TEXT */}
              <span
                className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                  sidebarExpanded
                    ? "opacity-100 w-auto ml-3"
                    : "opacity-0 w-0 ml-0"
                }`}
              >
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col w-full min-h-screen lg:pl-2 transition-all duration-300">
        {/* Header */}
        <header
          className="shadow-sm border-b transition-colors duration-300 sticky top-0 z-30"
          style={{
            backgroundColor: colors.layoutBg,
            borderColor: colors.border,
          }}
        >
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 transition-colors rounded-lg lg:hidden"
                style={{ color: colors.textSecondary }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = colors.hoverBg)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Mobile Logo View */}
              <div className="flex items-center gap-3 lg:hidden">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg"
                  style={{ backgroundColor: colors.primaryButton }}
                >
                  <Car className="w-5 h-5 text-white" />
                </div>
                <div className="font-bold" style={{ color: colors.brand }}>
                  {user?.companyName || user?.company || "Motor Desk"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg transition-colors"
                style={{
                  color: isDark ? "#FCD34D" : "#475569",
                  border: `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = colors.hoverBg)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                {isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* User Profile */}
              <div className="relative">
                <button
                  onClick={() => setOpenProfileMenu(!openProfileMenu)}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-10 h-10 overflow-hidden border rounded-full"
                    style={{ borderColor: colors.border }}
                  >
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: colors.primaryButton }}
                      >
                        <span className="font-medium text-white">
                          {user?.username?.charAt(0)?.toUpperCase() ||
                            user?.name?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="hidden sm:block text-left">
                    <div
                      className="font-medium"
                      style={{ color: colors.textPrimary }}
                    >
                      {user?.username || user?.name || "User"}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: colors.textSecondary }}
                    >
                      {user?.email || "no-email@example.com"}
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {openProfileMenu && (
                  <div
                    className="absolute right-0 mt-5 w-40 rounded-xl shadow-lg border p-1 z-50"
                    style={{
                      backgroundColor: colors.elementBg,
                      borderColor: colors.border,
                    }}
                  >
                    <button
                      onClick={() => {
                        if (isStaff) {
                          navigate("/car-dashboard");
                        } else {
                          navigate("/profile");
                        }
                        setOpenProfileMenu(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 text-left px-3 py-2 rounded-lg font-medium transition-colors duration-300"
                      style={{ color: colors.textPrimary }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = colors.hoverBg)
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "transparent")
                      }
                    >
                      <UserRoundCog height={25} />
                      Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          className="flex-1 p-6 pt-8 transition-colors duration-300"
          style={{ backgroundColor: colors.mainBg }}
        >
          <Outlet />
        </main>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 shadow-xl border"
            style={{
              backgroundColor: colors.elementBg,
              borderColor: colors.border,
            }}
          >
            <h2
              className="mb-2 text-xl font-bold"
              style={{ color: colors.textPrimary }}
            >
              Confirm Logout
            </h2>
            <p style={{ color: colors.textSecondary }}>
              Are you sure you want to logout?
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
                  color: colors.textPrimary,
                }}
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
                className="px-4 py-2 font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#DC2626" }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
