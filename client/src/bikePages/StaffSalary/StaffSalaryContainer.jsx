import React, { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { Users, IndianRupee } from "lucide-react";
import StaffManagement from "./EmpManagement";
import SalaryManagement from "./SalaryPage";

const StaffSalaryContainer = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("staff");

  const tabs = [
    { id: "staff", label: "Staff", icon: Users },
    { id: "salary", label: "Salary Management", icon: IndianRupee },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDark ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" : "bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50"
      }`}
    >
      {/* Top Navigation Tabs */}
      <div
        className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-300 ${
          isDark ? "bg-gray-900/80 border-gray-700/50" : "bg-white/80 border-gray-200/50"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`group relative flex items-center gap-2.5 px-6 py-4 font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === id
                    ? isDark
                      ? "text-blue-400"
                      : "text-blue-600"
                    : isDark
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon
                  size={20}
                  className={`transition-all duration-300 ${
                    activeTab === id ? "scale-110 rotate-6" : "group-hover:scale-105 group-hover:rotate-3"
                  }`}
                />
                <span className="tracking-wide">{label}</span>
                {activeTab === id && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-t-full shadow-lg shadow-blue-500/50"
                    style={{
                      animation: "slideIn 0.3s ease-out"
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ animation: "fadeIn 0.4s ease-in-out" }}>
        {activeTab === "staff" && <StaffManagement />}
        {activeTab === "salary" && <SalaryManagement />}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: scaleX(0); opacity: 0; }
          to { transform: scaleX(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default StaffSalaryContainer;