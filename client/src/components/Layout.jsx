// Layout.js (redesigned)
import React, { useState, useContext, useEffect } from "react";
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
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const menu = [
    { to: "/car-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/clients", label: "Clients", icon: Users },
    { to: "/services", label: "Services", icon: Wrench },
    { to: "/billing", label: "Billing", icon: Receipt },
    { to: "/reminders", label: "Reminders", icon: Bell },
    { to: "/reports", label: "Reports", icon: BarChart2 },
    { to: "/ocr-scanner", label: "OCR Scanner", icon: FileText },
    { to: "/plan", label: "Your Plan", icon: IndianRupee },
    { to: "/reference", label: "Reference", icon: Network },
  ];
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || {}
  );

useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  if (storedUser) setUser(storedUser);

  const handleUserUpdate = () => {
    const updatedUser = JSON.parse(localStorage.getItem("user"));
    setUser(updatedUser);
  };

  window.addEventListener("user-updated", handleUserUpdate);
  return () => window.removeEventListener("user-updated", handleUserUpdate);
}, []);

  const logout = () => {
    localStorage.removeItem("auth");
    navigate("/login", { replace: true });
  };

  return (
    <div
      className={`min-h-screen flex ${
        isDark ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full transition-all duration-300 ease-in-out
          ${sidebarExpanded ? "w-64" : "w-16"}
          lg:translate-x-0
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }
          ${isDark ? "bg-gray-800" : "bg-white"}
          shadow-xl
        `}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        <div className="flex flex-col h-screen">
          {/* Logo */}
          <div
            className={`flex items-center justify-between h-16 px-4 border-b ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
              {sidebarExpanded && (
                <div
                  className={`font-poppins font-bold ${
                    isDark ? "text-white" : "text-gray-800"
                  } text-xl transition-opacity duration-300`}
                >
                  {user?.companyName || "Motor Desk"}

                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X
                className={`w-5 h-5 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto">
            {menu.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `
                  flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : isDark
                      ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }
                  `
                }
              >
                {({ isActive }) => {
                  const Icon = item.icon;
                  return (
                    <>
                      <Icon
                        className={`w-5 h-5 flex-shrink-0 ${
                          isActive
                            ? "text-white"
                            : isDark
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      />
                      {sidebarExpanded && (
                        <span className="transition-opacity duration-300">
                          {item.label}
                        </span>
                      )}
                    </>
                  );
                }}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={() => setShowLogoutModal(true)}
            className={`
            w-full flex items-center justify-center
            ${sidebarExpanded ? "gap-2 px-4" : "px-3"}
            py-3
            rounded-xl font-medium
            transition-all duration-200
            ${
              isDark
                ? "text-red-400 bg-red-900/20 hover:bg-red-900/30 border border-red-800/30"
                : "text-red-600 bg-red-50 hover:bg-red-100 border border-red-200"
            }
          `}
          >
            <LogOut
              className={`w-5 h-5 flex-shrink-0 ${
                sidebarExpanded ? "mr-1" : ""
              }`}
            />
            {sidebarExpanded && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col min-h-screen w-full lg:ml-0">
        {/* Header */}
        <header
          className={`${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } shadow-sm border-b`}
        >
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Menu
                  className={`w-5 h-5 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                />
              </button>
              <div className="lg:hidden flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <div
                  className={`font-bold ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  {user?.companyName || "Motor Desk"}

                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* User Profile */}
              {/* User Profile */}
              <div className="relative">
                <button
                  onClick={() => setOpenProfileMenu(!openProfileMenu)}
                  className="flex items-center gap-3"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center 
                      ${
                        isDark
                          ? "bg-gradient-to-br from-blue-600 to-purple-600"
                          : "bg-gradient-to-br from-blue-500 to-purple-500"
                      }`}
                      >
                        <span className="text-white font-medium">
                          {user.username
                            ? user.username.charAt(0).toUpperCase()
                            : "U"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Username & Email */}
                  <div
                    className={`hidden sm:block ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    <div className="font-medium">{user.username || "User"}</div>
                    <div
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {user.email || "no-email@example.com"}
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {openProfileMenu && (
                  <div
                    className={`
                    absolute right-0 mt-3 w-48 rounded-xl shadow-lg border p-3 z-50
                    ${
                      isDark
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }
                  `}
                  >
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setOpenProfileMenu(false);
                      }}
                      className={`
                        w-full text-left px-3 py-2 rounded-lg font-medium transition-colors duration-300
                        ${
                          isDark
                            ? "text-gray-200 hover:bg-gray-700"
                            : "text-gray-800 hover:bg-gray-100"
                        }
                      `}
                    >
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
          className={`flex-1 p-6 pt-8 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
        >
          <Outlet />
        </main>
      </div>
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className={`w-full max-w-sm rounded-2xl p-6 shadow-xl 
        ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}
          >
            {/* Title */}
            <h2 className="text-xl font-bold mb-2">Confirm Logout</h2>
            <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Are you sure you want to logout?
            </p>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowLogoutModal(false)}
                className={`
              px-4 py-2 rounded-lg font-medium
              ${
                isDark
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              }
            `}
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
                className="
              px-4 py-2 rounded-lg font-medium text-white 
              bg-red-600 hover:bg-red-700
            "
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
