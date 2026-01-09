import React, { useState } from "react";
import { Users, IndianRupee } from "lucide-react";
import WashingStaffManagement from "./staff/WashStaffManagement";
import WashingSalaryManagement from "./salary/WashSalaryPage";


const WashStaffSalaryContainer = () => {
  const [activeTab, setActiveTab] = useState("staff");

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Tabs */}
      <div className="flex gap-6 border-b mb-6">
        <button
          onClick={() => setActiveTab("staff")}
          className={`pb-3 flex items-center gap-2 font-semibold ${
            activeTab === "staff"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          <Users size={18} />
          Wash Staff
        </button>

        <button
          onClick={() => setActiveTab("salary")}
          className={`pb-3 flex items-center gap-2 font-semibold ${
            activeTab === "salary"
              ? "border-b-2 border-green-600 text-green-600"
              : "text-gray-500"
          }`}
        >
          <IndianRupee size={18} />
          Salary
        </button>
      </div>

      {/* Content */}
      {activeTab === "staff" && <WashingStaffManagement />}
      {activeTab === "salary" && <WashingSalaryManagement />}
    </div>
  );
};

export default WashStaffSalaryContainer;
