import React, { useState } from "react";
import { FiX, FiFileText, FiTool, FiCalendar, FiUser, FiPhone, FiHash } from "react-icons/fi";

export default function BikeReportsList({
  invoices = [],
  services = [],
  isDark,
}) {
  const [invoiceDetails, setInvoiceDetails] = useState(null);

  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const openInvoice = async (inv) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${base}/api/bike-invoices/${inv.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setInvoiceDetails(data);
  };

  return (
    <div className="space-y-6">
      {/* Recent Bike Invoices */}
      <div className={`rounded-2xl border-2 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
      }`}>
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-green-500 to-teal-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FiFileText size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Recent Bike Invoices</h3>
              <p className="text-sm text-white/90">Click any invoice for details</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {invoices.length === 0 ? (
            <div className={`text-center py-12 ${
              isDark ? "text-gray-500" : "text-gray-400"
            }`}>
              <FiFileText size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No invoices found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {invoices.slice(0, 10).map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => openInvoice(inv)}
                  className={`group py-4 px-5 flex justify-between items-center cursor-pointer rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                    isDark
                      ? "hover:bg-gray-700 border-gray-700 hover:border-green-500/50"
                      : "hover:bg-gray-50 border-gray-100 hover:border-green-500/30"
                  }`}
                >
                  <div className="flex-1">
                    <div className={`font-bold text-lg mb-1 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}>
                      Invoice #{inv.invoiceNumber || inv.id}
                    </div>
                    <div className={`text-sm flex items-center gap-2 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}>
                      <FiUser size={14} />
                      <span>{inv.bike?.ownerName || "Unknown"}</span>
                      <span className="text-gray-500">•</span>
                      <FiHash size={14} />
                      <span>{inv.bike?.regNumber || "N/A"}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-xl text-green-500 mb-1">
                      ₹{Number(inv.grandTotal || 0).toFixed(2)}
                    </div>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      inv.status === "Paid"
                        ? "bg-green-100 text-green-700"
                        : inv.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {inv.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Bike Services */}
      <div className={`rounded-2xl border-2 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
      }`}>
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FiTool size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Recent Bike Services</h3>
              <p className="text-sm text-white/90">Latest completed and pending services</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {services.length === 0 ? (
            <div className={`text-center py-12 ${
              isDark ? "text-gray-500" : "text-gray-400"
            }`}>
              <FiTool size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No services found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {services.slice(0, 10).map((srv) => (
                <div
                  key={srv.id}
                  className={`group py-4 px-5 flex justify-between items-center rounded-xl border-2 transition-all duration-300 ${
                    isDark
                      ? "hover:bg-gray-700 border-gray-700 hover:border-blue-600/50"
                      : "hover:bg-gray-50 border-gray-100 hover:border-blue-600/30"
                  }`}
                >
                  <div className="flex-1">
                    <div className={`font-bold text-lg mb-2 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}>
                      {srv.subService?.name || srv.category?.name || "Service"}
                    </div>

                    <div className={`flex flex-wrap gap-3 text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}>
                      <span className="flex items-center gap-1">
                        <FiUser size={14} />
                        {srv.client?.ownerName || "Unassigned"}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="flex items-center gap-1">
                        <FiHash size={14} />
                        {srv.client?.regNumber || "N/A"}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="flex items-center gap-1">
                        <FiCalendar size={14} />
                        {srv.date ? new Date(srv.date).toLocaleDateString() : "No date"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-xl text-green-500 mb-1">
                      ₹{Number(srv.cost || 0).toFixed(2)}
                    </div>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      srv.status === "Paid"
                        ? "bg-green-100 text-green-700"
                        : srv.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {srv.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invoice Details Modal */}
      {invoiceDetails && (
      <div className="fixed inset-0 z-50 flex justify-center bg-black/50 backdrop-blur-sm pt-10 pb-6 animate-fade-in overflow-y-auto">
          <div className={`max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl border-2 animate-slide-up ${
            isDark
              ? "bg-gray-900 text-white border-gray-700"
              : "bg-white text-gray-900 border-gray-200"
          }`}>
            {/* Modal Header */}
            <div className={`p-6 flex items-center justify-between border-b-2 ${
              isDark ? "border-gray-800 bg-gray-800" : "border-gray-100 bg-gray-50"
            }`}>
              <div>
                <h3 className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  Invoice #{invoiceDetails.invoiceNumber || invoiceDetails.id}
                </h3>
                <p className={`text-sm mt-1 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}>
                  Issued: {invoiceDetails.issuedAt ? new Date(invoiceDetails.issuedAt).toLocaleDateString() : "N/A"} 
                  {" • "}
                  Due: {invoiceDetails.dueDate ? new Date(invoiceDetails.dueDate).toLocaleDateString() : "N/A"}
                </p>
              </div>

              <button
                onClick={() => setInvoiceDetails(null)}
                className={`p-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-6 overflow-y-auto max-h-[75vh]">

              {/* Status Badge */}
              <div className="flex items-center gap-4">
                <span className={`inline-block px-4 py-2 rounded-lg text-sm font-bold ${
                  invoiceDetails.status === "Paid"
                    ? "bg-green-100 text-green-700"
                    : invoiceDetails.status === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {invoiceDetails.status}
                </span>
              </div>

              {/* Bike Owner Info */}
              {invoiceDetails.bike && (
                <div className={`p-5 rounded-xl border-2 ${
                  isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                }`}>
                  <h4 className={`font-bold text-lg mb-4 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    Bike Owner Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FiUser className="text-blue-500" size={16} />
                      <span className={isDark ? "text-gray-400" : "text-gray-600"}>Name:</span>
                      <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {invoiceDetails.bike.ownerName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiPhone className="text-green-500" size={16} />
                      <span className={isDark ? "text-gray-400" : "text-gray-600"}>Phone:</span>
                      <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {invoiceDetails.bike.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiTool className="text-blue-600" size={16} />
                      <span className={isDark ? "text-gray-400" : "text-gray-600"}>Vehicle:</span>
                      <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {invoiceDetails.bike.bikeBrand} {invoiceDetails.bike.vehicleModel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiHash className="text-blue-600" size={16} />
                      <span className={isDark ? "text-gray-400" : "text-gray-600"}>Reg No:</span>
                      <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {invoiceDetails.bike.regNumber}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Linked Services */}
              <div>
                <h4 className={`font-bold text-lg mb-3 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  Service Details
                </h4>

                <div className={`rounded-xl border-2 overflow-hidden ${
                  isDark ? "border-gray-700" : "border-gray-200"
                }`}>

                  {/* ✅ Table Header */}
                  <div className={`grid grid-cols-3 px-4 py-3 text-sm font-bold ${
                    isDark ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-700"
                  }`}>
                    <div>Category</div>
                    <div>Sub Service</div>
                    <div>Status</div>
                  
                  </div>

                  {/* ✅ Table Row */}
                  <div className={`grid grid-cols-3 px-4 py-3 text-sm border-t ${
                    isDark
                      ? "border-gray-700 text-gray-300"
                      : "border-gray-200 text-gray-700"
                  }`}>
                    <div className="font-medium">
                      {invoiceDetails.serviceCategory || "N/A"}
                    </div>

                    <div>
                      {invoiceDetails.serviceSubCategory || "N/A"}
                    </div>

                    <div className={`font-semibold ${
                      invoiceDetails.status === "Paid"
                        ? "text-green-500"
                        : invoiceDetails.status === "Pending"
                        ? "text-yellow-500"
                        : "text-gray-500"
                    }`}>
                      {invoiceDetails.status}
                    </div>

                  
                  </div>

                </div>
              </div>


              {/* Grand Total */}
              <div className={`border-t-2 pt-4 ${
                isDark ? "border-gray-700" : "border-gray-200"
              }`}>
                <div className="flex justify-between items-center">
                  <h3 className={`text-xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    Grand Total
                  </h3>
                  <h3 className="text-3xl font-bold text-green-500">
                    ₹{Number(invoiceDetails.grandTotal || 0).toFixed(2)}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}