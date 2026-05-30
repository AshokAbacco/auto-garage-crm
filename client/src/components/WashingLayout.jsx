import React, { useState, useEffect } from "react";
import {
    Truck,
    Users,
    Wrench,
    Receipt,
    BarChart2,
    LogOut,
    LayoutDashboard,
    Menu,
    X,
    Sun,
    Moon,
    IndianRupee,
    Network,
    Crown,
    MessageSquare,
    Layers,
    ChevronDown,
    ChevronRight,
    CogIcon,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigate, Outlet } from "react-router-dom";
import { UsersRound } from "lucide-react";


export default function WashingLayoutPage() {
    const { isDark, toggleTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const [activeRoute, setActiveRoute] = useState("/washing-dashboard");

    const routerNavigate = useNavigate();

    // Menu items with dropdowns
    const menu = [
        {
            to: "/wash-dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            roles: ["user", "team"],
        },
        {
            to: "/washing-clients",
            label: "Clients",
            icon: Users,
            roles: ["user", "team"],
        },
        {
            to: "/washing-services",
            label: "Services",
            icon: Wrench,
            roles: ["user", "team"],
        },
        {
            to: "/washing-alerts",
            label: "Alerts",
            icon: MessageSquare,
            roles: ["user", "team"],
        },
        {
            to: "/washing-Billing",
            label: "Billing",
            icon: Receipt,
            roles: ["user", "team"],
        },
        {
            to: "/washing-reports",
            label: "Reports",
            icon: BarChart2,
            roles: ["user", "team"],
        },

        // 🔒 OWNER / ADMIN ONLY
        {
            to: "/washing-plan",
            label: "Your Plan",
            icon: IndianRupee,
            roles: ["user"],
        },
        {
            to: "/washing-reference",
            label: "Reference",
            icon: Network,
            roles: ["user"],
        },
        {
            to: "/washing-salary-management",
            label: "Salary Management",
            icon: Network,
            roles: ["user"],
        },
        {
            to: "/teams",
            label: "Team",
            icon: UsersRound,
            roles: ["user"], // 🔁 renamed from Team Member → Team
        },
        {
            to: "/washing-upgrade",
            label: "Upgrade",
            icon: Crown,
            roles: ["user"],
        },
        {
            label: "Marketplace",
            icon: Layers,
            roles: ["user", "team"],
            children: [
                {
                    to: "/washing-marketplace/bookings",
                    label: "Bookings",
                    roles: ["user", "team"],
                },
                {
                    to: "/washing-marketplace/pricing",
                    label: "Pricing",
                    roles: ["user", "team"],
                },
                {
                    to: "/washing-marketplace/packages",
                    label: "Packages",
                    roles: ["user", "team"],
                },
            ],
        },
    ];


    const [openProfileMenu, setOpenProfileMenu] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [user, setUser] = useState({
        username: "Demo Washer",
        email: "demo@washgarage.com",
        companyName: "Wash Garage Pro",
    });

    // Track which dropdowns are open
    const [openDropdowns, setOpenDropdowns] = useState({});

    const toggleDropdown = (label) => {
        setOpenDropdowns((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    useEffect(() => {
        // Example: load user from localStorage or API here
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                const userData = JSON.parse(stored);
                setUser(userData);
            } catch (e) {
                console.error("Failed to parse user data");
            }
        }
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("crmType");
        routerNavigate("/login", { replace: true });
    };


    return (
        <div
            className={`min-h-screen flex ${isDark
                ? "dark bg-gray-900"
                : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"
                }`}
        >
            {/* Mobile overlay */}
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
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isDark ? "bg-gray-800" : "bg-white"}
          shadow-xl
        `}
                onMouseEnter={() => setSidebarExpanded(true)}
                onMouseLeave={() => setSidebarExpanded(false)}
            >
                <div className="flex flex-col h-screen">
                    {/* Logo / Header */}
                    <div
                        className={`flex items-center justify-between h-16 px-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg shadow-lg bg-gradient-to-br from-sky-500 to-blue-600">
                                <Truck className="w-6 h-6 text-white" />
                            </div>
                            {sidebarExpanded && (
                                <div
                                    className={`font-poppins font-bold ${isDark ? "text-white" : "text-gray-800"
                                        } text-xl transition-opacity duration-300`}
                                >
                                    {user?.companyName || "Wash Garage"}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-1 transition-colors rounded-lg lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <X
                                className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-500"
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto">
                        {menu
                            // ✅ FILTER MENU BY ROLE
                            .filter(item => {
                                // single menu
                                if (!item.children) {
                                    return item.roles?.includes(user?.role);
                                }

                                // dropdown → at least one child allowed
                                return item.children.some(child =>
                                    child.roles?.includes(user?.role)
                                );
                            })
                            .map((item) => {
                                const hasChildren = !!item.children && item.children.length > 0;

                                const allowedChildren = hasChildren
                                    ? item.children.filter(child =>
                                        child.roles?.includes(user?.role)
                                    )
                                    : [];

                                const isParentActive =
                                    hasChildren &&
                                    allowedChildren.some(child => child.to === activeRoute);

                                const isSingleActive =
                                    !hasChildren && activeRoute === item.to;

                                const isActive = isParentActive || isSingleActive;
                                const Icon = item.icon;

                                /* ===============================
                                   SIMPLE MENU ITEM
                                =============================== */
                                if (!hasChildren) {
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
              ${isActive
                                                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg"
                                                    : isDark
                                                        ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                                                        : "text-gray-700 hover:bg-sky-50 hover:text-sky-600"
                                                }
            `}
                                        >
                                            {Icon && (
                                                <Icon
                                                    className={`w-5 h-5 flex-shrink-0 ${isActive
                                                        ? "text-white"
                                                        : isDark
                                                            ? "text-gray-400"
                                                            : "text-gray-500"
                                                        }`}
                                                />
                                            )}

                                            {sidebarExpanded && (
                                                <span className="transition-opacity duration-300">
                                                    {item.label}
                                                </span>
                                            )}
                                        </button>
                                    );
                                }

                                /* ===============================
                                   DROPDOWN MENU
                                =============================== */
                                const isOpen = openDropdowns[item.label];

                                return (
                                    <div key={item.label} className="space-y-1">
                                        {/* Parent Button */}
                                        <button
                                            onClick={() => toggleDropdown(item.label)}
                                            className={`
              w-full flex items-center justify-between px-3 py-3 rounded-xl font-medium transition-all duration-200
              ${isActive
                                                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg"
                                                    : isDark
                                                        ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                                                        : "text-gray-700 hover:bg-sky-50 hover:text-sky-600"
                                                }
            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                {Icon && (
                                                    <Icon
                                                        className={`w-5 h-5 flex-shrink-0 ${isActive
                                                            ? "text-white"
                                                            : isDark
                                                                ? "text-gray-400"
                                                                : "text-gray-500"
                                                            }`}
                                                    />
                                                )}

                                                {sidebarExpanded && (
                                                    <span className="transition-opacity duration-300">
                                                        {item.label}
                                                    </span>
                                                )}
                                            </div>

                                            {sidebarExpanded && (
                                                <span>
                                                    {isOpen ? (
                                                        <ChevronDown className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4" />
                                                    )}
                                                </span>
                                            )}
                                        </button>

                                        {/* Children */}
                                        {sidebarExpanded && isOpen && (
                                            <div className="pl-8 space-y-1">
                                                {allowedChildren.map((child) => {
                                                    const childActive = activeRoute === child.to;

                                                    return (
                                                        <button
                                                            key={child.to}
                                                            onClick={() => {
                                                                setActiveRoute(child.to);
                                                                setSidebarOpen(false);
                                                                routerNavigate(child.to);
                                                            }}
                                                            className={`
                      w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${childActive
                                                                    ? "bg-sky-500/90 text-white shadow-md"
                                                                    : isDark
                                                                        ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                                                                        : "text-gray-700 hover:bg-sky-50 hover:text-sky-600"
                                                                }
                    `}
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                            <span>{child.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </nav>


                    {/* Logout */}
                    <div className="p-2">
                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className={`w-full flex items-center justify-center ${sidebarExpanded ? "gap-2 px-4" : "px-3"
                                } py-3 mb-2 rounded-xl font-medium transition-all duration-200 ${isDark
                                    ? "text-red-400 bg-red-900/20 hover:bg-red-900/30 border border-red-800/30"
                                    : "text-red-600 bg-red-50 hover:bg-red-100 border border-red-200"
                                }`}
                        >
                            <LogOut
                                className={`w-5 h-5 flex-shrink-0 ${sidebarExpanded ? "mr-1" : ""
                                    }`}
                            />
                            {sidebarExpanded && <span>Logout</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main area */}
            <div
                className={`flex flex-col min-h-screen w-full ${sidebarExpanded ? "lg:ml-64" : "lg:ml-16"
                    } transition-all duration-300`}
            >
                {/* Header */}
                <header
                    className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                        } shadow-sm border-b`}
                >
                    <div className="flex items-center justify-between h-16 px-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 transition-colors rounded-lg lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Menu
                                    className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-600"
                                        }`}
                                />
                            </button>
                            <div className="flex items-center gap-3 lg:hidden">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600">
                                    <Truck className="w-5 h-5 text-white" />
                                </div>
                                <div
                                    className={`font-bold ${isDark ? "text-white" : "text-gray-800"
                                        }`}
                                >
                                    {user?.companyName || "Wash Garage"}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Theme toggle */}
                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-lg transition-colors ${isDark
                                    ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                                    : "bg-sky-100 text-sky-700 hover:bg-sky-200"
                                    }`}
                            >
                                {isDark ? (
                                    <Sun className="w-5 h-5" />
                                ) : (
                                    <Moon className="w-5 h-5" />
                                )}
                            </button>

                            {/* Profile */}
                            <div className="relative">
                                <button
                                    onClick={() => setOpenProfileMenu(!openProfileMenu)}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 overflow-hidden border border-gray-300 rounded-full dark:border-gray-600">
                                        {user?.profileImage ? (
                                            <img
                                                src={user.profileImage}
                                                alt="Profile"
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <div
                                                className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500`}
                                            >
                                                <span className="font-medium text-white">
                                                    {user.username
                                                        ? user.username.charAt(0).toUpperCase()
                                                        : "D"}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div
                                        className={`${isDark ? "text-white" : "text-gray-800"
                                            }`}
                                    >
                                        <div className="font-medium">
                                            {user.username || "Demo Washer"}
                                        </div>
                                        <div
                                            className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"
                                                }`}
                                        >
                                            {user.email || "demo@washgarage.com"}
                                        </div>
                                    </div>
                                </button>

                                {openProfileMenu && (
                                    <div
                                        className={`absolute right-0 mt-3 w-48 rounded-xl shadow-lg border p-3 z-50 ${isDark
                                            ? "bg-gray-800 border-gray-700"
                                            : "bg-white border-gray-200"
                                            }`}
                                    >
                                        <button
                                            onClick={() => {
                                                routerNavigate("/washProfile");
                                                setOpenProfileMenu(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors duration-300 ${isDark
                                                ? "text-gray-200 hover:bg-gray-700"
                                                : "text-gray-800 hover:bg-sky-50"
                                                }`}
                                        >
                                            Profile
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main
                    className={`flex-1 ${isDark
                        ? "bg-gray-900"
                        : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"
                        }`}
                >
                    <Outlet />
                </main>

                {/* Logout modal */}
                {showLogoutModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div
                            className={`w-full max-w-sm rounded-2xl p-6 shadow-xl ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-800"
                                }`}
                        >
                            <h2 className="mb-2 text-xl font-bold">Confirm Logout</h2>
                            <p
                                className={`${isDark ? "text-gray-300" : "text-gray-600"
                                    }`}
                            >
                                Are you sure you want to logout?
                            </p>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className={`px-4 py-2 rounded-lg font-medium ${isDark
                                        ? "bg-gray-700 hover:bg-gray-600"
                                        : "bg-gray-200 hover:bg-gray-300"
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowLogoutModal(false);
                                        logout();
                                    }}
                                    className="px-4 py-2 font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
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