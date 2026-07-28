import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
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
  ListTree,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import GarageVerificationModal from "../components/GarageVerificationModal"; // ⭐ Imported separate form block

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [user, setUser] = useState({});
  const [loadingUser, setLoadingUser] = useState(true);

  // 🏅 Real-Time Verification State Hub
  const [verification, setVerification] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const isStaff = user?.type === "staff";
  const userPlan = user?.plan || "BASIC";

  const canAccessStaff = ["STANDARD", "PREMIUM"].includes(userPlan);
  const canAccessSalary = ["PREMIUM"].includes(userPlan);
  const isPlanExpired =
    user?.planExpiry && new Date(user.planExpiry) < new Date();

  const ALLOWED_WHEN_EXPIRED = [
    "/car-dashboard",
    "/plan",
    "/reference",
    "/upgrade",
  ];

  /* ======================================================
      FETCH GARAGE VERIFICATION METRICS FROM API
  ====================================================== */
  const fetchVerificationState = async () => {
    if (isStaff) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(`${API_URL}/api/garage-verification/state`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVerification(res.data);
    } catch (err) {
      console.error("Verification tracker synchronization loop failure:", err);
    }
  };

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

  useEffect(() => {
    if (user?.type === "owner") {
      fetchVerificationState();
    }
  }, [user]);

  /* ================================
      MENU CONFIG
   ================================= */
  const menu = [
    { to: "/car-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/clients", label: "Clients", icon: Users },
    { to: "/services", label: "Services", icon: Wrench },
    { to: "/billing", label: "Billing", icon: Receipt },
    { to: "/reminders", label: "Reminders", icon: Bell },
    {to: "/inventory-management", label: "Inventory Management", icon: Wrench },
    { to: "/reports", label: "Reports", icon: BarChart2 },
    { to: "/ocr-scanner", label: "OCR Scanner", icon: FileText },
    { to: "/staff-management", label: "Staff Management", icon: UserRoundPlus },
    { to: "/salary-management", label: "Salary Management", icon: Wallet },
    { to: "/dynamic-data", label: "Data", icon: Database },
    {
      label: "Marketplace",
      icon: ListTree,
      children: [
        { to: "/marketplace/bookings", label: "Bookings" },
        { to: "/marketplace/pricing", label: "Pricing" },
        { to: "/marketplace/packages", label: "Packages" },
      ],
    },
    { to: "/plan", label: "Your Plan", icon: IndianRupee },
    { to: "/reference", label: "Reference", icon: Network },
    { to: "/upgrade", label: "Upgrade", icon: Crown },
  ];

  const filteredMenu = menu.filter((item) => {
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
  const [openMenu, setOpenMenu] = useState(null);

  const logout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

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

  // Define top row badge layouts mapping rules
  const topBadgeStyles = {
    NOT_ORDERED: {
      text: "Unverified Garage",
      style:
        "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/60",
      icon: ShieldAlert,
    },
    PAID_PENDING_DOCS: {
      text: "Upload Verification Docs",
      style:
        "bg-amber-50 text-amber-600 border-amber-200 animate-pulse hover:bg-amber-100/50",
      icon: ShieldAlert,
    },
    UNDER_REVIEW: {
      text: "Verification Pending Review",
      style: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100/50",
      icon: ShieldAlert,
    },
    VERIFIED: {
      text: "Verified Garage",
      style: "bg-emerald-50 text-emerald-600 border-emerald-200 cursor-default",
      icon: ShieldCheck,
    },
    REJECTED: {
      text: "Verification Rejected",
      style: "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100/50",
      icon: ShieldAlert,
    },
  };
  const activeTopBadge =
    topBadgeStyles[verification?.status] || topBadgeStyles["NOT_ORDERED"];

  if (loadingUser) return null;

  return (
    <div
      className="flex min-h-screen transition-colors duration-300"
      style={{ backgroundColor: colors.mainBg }}
    >
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSidebarOpen(false)}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full transition-all duration-300 ease-in-out border-r flex flex-col ${sidebarExpanded ? "w-64" : "w-20"} lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ backgroundColor: colors.layoutBg, borderColor: colors.border }}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div
            className="flex items-center justify-between flex-shrink-0 h-16 px-4 border-b"
            style={{ borderColor: colors.border }}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-lg shadow-lg"
                style={{ backgroundColor: colors.primaryButton }}
              >
                <Car className="w-6 h-6 text-white" />
              </div>
              <div
                className={`font-poppins font-bold text-xl whitespace-nowrap transition-all duration-300 ease-in-out ${sidebarExpanded ? "opacity-100 max-w-[200px]" : "opacity-0 max-w-0"}`}
                style={{ color: isDark ? "#FFFFFF" : colors.brand }}
              >
                {user?.companyName || user?.company || "Motor Desk"}
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg lg:hidden"
              style={{ color: colors.textSecondary }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-2 overflow-x-hidden overflow-y-auto custom-scrollbar">
            {filteredMenu.map((item, index) => {
              if (item.children) {
                const isOpen = openMenu === index;
                const Icon = item.icon;
                return (
                  <div key={index}>
                    <button
                      onClick={() => setOpenMenu(isOpen ? null : index)}
                      className="flex items-center w-full px-3 py-3 font-medium transition-all duration-200 rounded-xl"
                      style={{ color: colors.textSecondary }}
                    >
                      <Icon className="flex-shrink-0 w-5 h-5" />
                      <span
                        className={`whitespace-nowrap flex overflow-hidden transition-all duration-300 ease-in-out ${sidebarExpanded ? "opacity-100 w-auto ml-3" : "opacity-0 w-0 ml-0"}`}
                      >
                        {item.label}
                      </span>
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-40 mt-1" : "max-h-0"}`}
                    >
                      <div className="ml-6 space-y-1">
                        {item.children.map((child) => {
                          const isLocked =
                            !isStaff &&
                            isPlanExpired &&
                            !ALLOWED_WHEN_EXPIRED.includes(child.to);
                          return (
                            <NavLink
                              key={child.to}
                              to={isLocked ? "/upgrade" : child.to}
                              onClick={() => setSidebarOpen(false)}
                              className={({ isActive }) =>
                                `flex items-center px-3 py-2 rounded-lg font-medium transition-all duration-200 group text-sm ${isActive ? "shadow-lg" : ""}`
                              }
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
                              })}
                            >
                              {child.label}
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              const isLocked =
                !isStaff &&
                isPlanExpired &&
                !ALLOWED_WHEN_EXPIRED.includes(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={isLocked ? "/upgrade" : item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-3 rounded-xl font-medium transition-all duration-200 group ${isActive ? "shadow-lg" : ""}`
                  }
                  style={({ isActive }) => ({
                    backgroundColor: isActive
                      ? colors.primaryButton
                      : "transparent",
                    color: isLocked
                      ? "#94A3B8"
                      : isActive
                        ? "#FFFFFF"
                        : colors.textSecondary,
                  })}
                >
                  {({ isActive }) => {
                    const Icon = item.icon;
                    return (
                      <>
                        <Icon
                          className="flex-shrink-0 w-5 h-5"
                          style={{
                            color: isLocked
                              ? "#94A3B8"
                              : isActive
                                ? "#FFFFFF"
                                : colors.textSecondary,
                          }}
                        />
                        <span
                          className={`whitespace-nowrap flex overflow-hidden transition-all duration-300 ease-in-out ${sidebarExpanded ? "opacity-100 w-auto ml-3" : "opacity-0 w-0 ml-0"}`}
                        >
                          {item.label}
                          {isLocked && (
                            <span className="ml-2">
                              <LockKeyhole className="w-4 h-4" />
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

          <div className="flex-shrink-0 p-3">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center w-full px-3 py-3 overflow-hidden font-medium transition-all duration-200 border rounded-xl"
              style={{
                backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "#FEF2F2",
                borderColor: isDark ? "rgba(239, 68, 68, 0.2)" : "#FECACA",
                color: "#DC2626",
              }}
            >
              <LogOut className="flex-shrink-0 w-5 h-5" />
              <span
                className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${sidebarExpanded ? "opacity-100 w-auto ml-3" : "opacity-0 w-0 ml-0"}`}
              >
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col w-full min-h-screen transition-all duration-300 lg:pl-2">
        {/* Header */}
        <header
          className="sticky top-0 z-30 transition-colors duration-300 border-b shadow-sm"
          style={{
            backgroundColor: colors.layoutBg,
            borderColor: colors.border,
          }}
        >
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg lg:hidden"
                style={{ color: colors.textSecondary }}
              >
                <Menu className="w-5 h-5" />
              </button>
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
              {/* ⭐ NEW HIGH-VISIBILITY VERIFICATION STATUS TAG LINK BAR */}
              {!isStaff && (
                <button
                  disabled={verification?.status === "VERIFIED"}
                  onClick={() => setShowVerificationModal(true)}
                  className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider border rounded-xl transition-all duration-150 select-none ${activeTopBadge.style}`}
                >
                  <activeTopBadge.icon
                    className="w-4 h-4 shrink-0"
                    strokeWidth={2.5}
                  />
                  <span>{activeTopBadge.text}</span>
                </button>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 transition-colors rounded-lg"
                style={{
                  color: isDark ? "#FCD34D" : "#475569",
                  border: `1px solid ${colors.border}`,
                }}
              >
                {isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenProfileMenu(!openProfileMenu)}
                  className="flex items-center gap-3 p-1.5 rounded-xl border border-transparent hover:border-slate-200/80 hover:bg-slate-50/50"
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
                      />
                    ) : (
                      <div
                        className="flex items-center justify-center w-full h-full"
                        style={{ backgroundColor: colors.primaryButton }}
                      >
                        <span className="font-medium text-white">
                          {user?.username?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="hidden text-left sm:block">
                    <div
                      className="flex items-center gap-1 text-sm font-bold"
                      style={{ color: colors.textPrimary }}
                    >
                      {user?.username || user?.name || "User"}
                      {verification?.status === "VERIFIED" && (
                        <ShieldCheck
                          className="w-4 h-4 text-emerald-500 fill-emerald-50 shrink-0"
                          strokeWidth={2.5}
                        />
                      )}
                    </div>
                    <div
                      className="text-xs font-medium"
                      style={{ color: colors.textSecondary }}
                    >
                      {user?.email}
                    </div>
                  </div>
                </button>

                {openProfileMenu && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg border p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                    style={{
                      backgroundColor: colors.elementBg,
                      borderColor: colors.border,
                    }}
                  >
                    <button
                      onClick={() => {
                        navigate(isStaff ? "/car-dashboard" : "/profile");
                        setOpenProfileMenu(false);
                      }}
                      className="flex items-center w-full gap-2 px-3 py-2 text-sm font-bold text-left transition-colors rounded-lg text-slate-700 hover:bg-slate-50"
                      style={{ color: colors.textPrimary }}
                    >
                      <UserRoundCog className="w-4 h-4 text-slate-400" />{" "}
                      Profile Settings
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          className="flex-1 p-6 pt-8"
          style={{ backgroundColor: colors.mainBg }}
        >
          <Outlet />
        </main>
      </div>

      {/* ⭐ Decoupled Verification Document Processing Modal Overlay */}
      <GarageVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        verification={verification}
        onRefreshState={fetchVerificationState}
      />

      {/* Logout Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className="w-full max-w-sm p-6 border shadow-xl rounded-2xl"
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
                className="px-4 py-2 font-medium transition-colors rounded-lg"
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
                className="px-4 py-2 font-medium text-white rounded-lg"
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
