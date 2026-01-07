import React, { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { Users, DollarSign } from "lucide-react";
import StaffManagement from "./EmpManagement";
import SalaryManagement from "./SalaryPage";

const StaffSalaryContainer = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("staff");

  const tabs = [
    { id: "staff", label: "Staff", icon: Users },
    { id: "salary", label: "Salary Management", icon: DollarSign },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Top Navigation Tabs */}
      <div
        className={`sticky top-0 z-40 backdrop-blur-md transition-colors duration-300 ${
          isDark ? "bg-gray-900/95 border-gray-800" : "bg-white/95 border-gray-200"
        } border-b`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex gap-4 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`group relative flex items-center gap-2 px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap ${
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
                  size={18}
                  className={`transition-all duration-300 ${
                    activeTab === id ? "scale-110 rotate-3" : "group-hover:scale-105"
                  }`}
                />
                <span>{label}</span>
                {activeTab === id && (
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-500 animate-slideIn`}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="animate-fadeIn">
        {activeTab === "staff" && <StaffManagement />}
        {activeTab === "salary" && <SalaryManagement />}
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideIn {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default StaffSalaryContainer;