import React, { useState, useEffect } from "react";
import { 
  Bike, 
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
  Package, 
  Calendar, 
  Settings,
  IndianRupee,
  Network,
  Crown,
  ListTree,
ChevronDown,
ChevronRight,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigate, Outlet  } from "react-router-dom";

export default function BikeLayoutPage() {
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeRoute, setActiveRoute] = useState("/bike-dashboard");

  const routerNavigate = useNavigate();

const menu = [
  {
    to: "/bike-dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["owner", "bike_team"],
  },
  {
    to: "/bike-clients",
    label: "Clients",
    icon: Users,
    roles: ["owner", "bike_team"],
  },
  {
    to: "/bike-services",
    label: "Services",
    icon: Wrench,
    roles: ["owner", "bike_team"],
  },
  {
    to: "/bike-billing",
    label: "Billing",
    icon: Receipt,
    roles: ["owner", "bike_team"],
  },
  {
    to: "/bike-reminders",
    label: "Reminders",
    icon: Bell,
    roles: ["owner", "bike_team"],
  },
  {
    to: "/bike-reports",
    label: "Reports",
    icon: BarChart2,
    roles: ["owner", "bike_team"],
  },
  {
    to: "/bike-ocr-scanner",
    label: "OCR Scanner",
    icon: FileText,
    roles: ["owner", "bike_team"],
  },

  // 🔒 OWNER ONLY
  {
    to: "/bike-plan",
    label: "Your Plan",
    icon: IndianRupee,
    roles: ["owner"],
  },
  {
    to: "/bike-reference",
    label: "Reference",
    icon: Network,
    roles: ["owner"],
  },
  {
    to: "/salary-manage",
    label: "Staff Management",
    icon: Package,
    roles: ["owner"],
  },
  {
    to: "/team-register",
    label: "Team Accounts",
    icon: Users,
    roles: ["owner"],
  },
  {
    to: "/bike-plans",
    label: "Upgrade",
    icon: Crown,
    roles: ["owner"],
  },
  {
  label: "Marketplace",
  icon: ListTree,
  roles: ["owner", "bike_team"],
  children: [
    {
      to: "/bike-marketplace/bookings",
      label: "Bookings",
    },
    {
      to: "/bike-marketplace/pricing",
      label: "Pricing",
    },
    {
      to: "/bike-marketplace/packages",
      label: "Packages",
    },
  ],
},
];


  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      routerNavigate("/login", { replace: true });
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [routerNavigate]);


const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("auth");
  routerNavigate("/login", { replace: true });
};


  return (
    <div
      className={`min-h-screen flex ${
        isDark ? "dark bg-gray-900" : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"
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
          ${sidebarExpanded ? "w-64" : "w-18"}
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
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <Bike className="w-6 h-6 text-white" />
              </div>
              {sidebarExpanded && (
                <div
                  className={`font-poppins font-bold ${
                    isDark ? "text-white" : "text-gray-800"
                  } text-xl transition-opacity duration-300`}
                >
                  {user?.companyName || "Bike Garage"}
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
            {menu
              // ✅ FILTER BASED ON ROLE
              .filter(item => item.roles.includes(user?.type))
          .map((item) => {
            const Icon = item.icon;

            // ===============================
            // DROPDOWN MENU
            // ===============================
            if (item.children) {
              const isOpen = openDropdowns[item.label];

              return (
                <div key={item.label}>
                  <button
                    onClick={() =>
                      setOpenDropdowns((prev) => ({
                        ...prev,
                        [item.label]: !prev[item.label],
                      }))
                    }
                    className={`
                      w-full flex items-center justify-between px-3 py-3 rounded-xl font-medium transition-all duration-200
                      ${
                        isDark
                          ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                          : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 flex-shrink-0" />

                      {sidebarExpanded && (
                        <span className="transition-opacity duration-300">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {sidebarExpanded &&
                      (isOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      ))}
                  </button>

                  {sidebarExpanded && isOpen && (
                    <div className="pl-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <button
                          key={child.to}
                          onClick={() => {
                            setActiveRoute(child.to);
                            setSidebarOpen(false);
                            routerNavigate(child.to);
                          }}
                          className={`
                            w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200
                            ${
                              activeRoute === child.to
                                ? "bg-blue-500 text-white"
                                : isDark
                                ? "text-gray-300 hover:bg-gray-700"
                                : "text-gray-700 hover:bg-blue-50"
                            }
                          `}
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // ===============================
            // NORMAL MENU
            // ===============================
            const isActive = activeRoute === item.to;

            return (
              <button
                key={item.to}
                onClick={() => {
                  setActiveRoute(item.to);
                  setSidebarOpen(false);
                  routerNavigate(item.to);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                      : isDark
                      ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  }
                `}
              >
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
              </button>
            );
          })}
          </nav>


          {/* Logout Button */}
          <div className="p-2">
            <button
              onClick={() => setShowLogoutModal(true)}
              className={`
                w-full flex items-center justify-center
                ${sidebarExpanded ? "gap-2 px-4" : "px-3"}
                py-3 mb-2
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
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex flex-col min-h-screen w-full ${sidebarExpanded ? 'lg:ml-64' : 'lg:ml-16'} transition-all duration-300`}>
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
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Bike className="w-5 h-5 text-white" />
                </div>
                <div
                  className={`font-bold ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  {user?.companyName || "Bike Garage"}
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
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
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
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // <div
                      //   className={`w-full h-full flex items-center justify-center 
                      //     ${
                      //       isDark
                      //         ? "bg-gradient-to-br from-blue-500 to-blue-600"
                      //         : "bg-gradient-to-br from-blue-500 to-blue-600"
                      //     }`}
                      // >
                      //   <span className="text-white font-medium">
                      //     {user?.username
                      //       ? user.username.charAt(0).toUpperCase()
                      //       : "U"}
                      //   </span>
                      // </div>
                       <img
                          src="/Logos/logo3.png"
                          alt="Default Logo"
                          className="w-full h-full object-contain bg-white"
                        />
                    )}
                  </div>

                  {/* Username & Email */}
                  <div
                    className={`hidden sm:block ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    <div className="font-medium">
                      {user?.displayName || user?.username || "User"}
                    </div>

                    <div className="text-xs text-gray-500">
                      {user?.email || (user?.type === "bike_team" ? "Team Member" : "")}
                    </div>

                  </div>
                </button>

                {/* Dropdown Menu */}
                {openProfileMenu && user?.type === "owner" && (
                  <div
                    className={`absolute right-0 mt-3 w-48 rounded-xl shadow-lg border p-3 z-50
                      ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}
                    `}
                  >
                    <button
                      onClick={() => {
                        routerNavigate("/bike-profile");
                        setOpenProfileMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg font-medium
                        ${isDark ? "text-gray-200 hover:bg-gray-700" : "text-gray-800 hover:bg-blue-50"}
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
          className={`flex-1 ${
            isDark ? "bg-gray-900" : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"
          }`}
        >
          {/* Page Content - Dynamic */}
          <Outlet />
        </main>

        {/* Logout Modal */}
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
    </div>
  );
}