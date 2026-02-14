import React, { useState } from "react";

export default function ReportsList({
  invoices,
  clients,
  services = [],
  isDark,
}) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState(null);

  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

  const openInvoice = async (inv) => {
    setSelectedInvoice(inv);
    const token = localStorage.getItem("token");
    const res = await fetch(`${base}/api/reports/invoice/${inv.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setInvoiceDetails(data);
  };

  return (
    <div className="space-y-6 ">
      {/* ============================
          🧾 Recent Invoices Section
      ============================ */}
      <div
        className={`rounded-2xl shadow-lg border ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div
          className={`p-6 border-b rounded-2xl ${
            isDark
              ? "border-gray-700 bg-gray-700"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <h3
            className={`text-xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Recent Invoices
          </h3>
          <p
            className={`text-sm mt-1 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Click any invoice for details
          </p>
        </div>

        <div className="p-6">
          {invoices.length === 0 ? (
            <div
              className={`text-center py-8 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No invoices found.
            </div>
          ) : (
            invoices.slice(0, 10).map((inv) => (
              <div
                key={inv.id}
                onClick={() => openInvoice(inv)}
                className={`py-4 flex justify-between cursor-pointer px-4 rounded-lg transition-colors duration-200 border-b border-gray-100 last:border-b-0 ${
                  isDark ? "hover:bg-gray-700" : "hover:bg-blue-50"
                }`}
              >
                <div>
                  <div
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Invoice #{inv.id}
                  </div>
                  <div
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {inv.client?.fullName || `Client #${inv.clientId}`}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    ₹{Number(inv.grandTotal || 0).toFixed(2)}
                  </div>
                  <div
                    className={`text-sm mt-1 ${
                      inv.status === "Paid"
                        ? "text-blue-400"
                        : inv.status === "Pending"
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  >
                    {inv.status}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ============================
          🧰 Recent Services Section
      ============================ */}
      <div
        className={`rounded-2xl shadow-lg border ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div
          className={`p-6 border-b rounded-2xl ${
            isDark
              ? "border-gray-700 bg-gray-700"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <h3
            className={`text-xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Recent Services
          </h3>
          <p
            className={`text-sm mt-1 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Latest completed and pending services
          </p>
        </div>

        <div className="p-6">
          {services.length === 0 ? (
            <div
              className={`text-center py-8 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No services found.
            </div>
          ) : (
            services.slice(0, 10).map((srv) => (
              <div
                key={srv.id}
                className={`py-4 px-4 flex justify-between rounded-lg transition-colors duration-200 border-b border-gray-100 last:border-b-0 ${
                  isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex flex-col">
                  <div
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {srv.type}
                  </div>
                  <div
                    className={`text-sm ${
                      isDark ? "text-gray-300" : "text-gray-800"
                    }`}
                  >
                    {srv.client?.fullName || "Unassigned Client"}
                  </div>
                  <div
                    className={`text-sm ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {srv.date
                      ? new Date(srv.date).toLocaleDateString()
                      : "No date"}
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    ₹{Number(srv.cost || 0).toFixed(2)}
                  </div>
                  <div
                    className={`text-sm mt-1 ${
                      srv.status === "Completed"
                        ? "text-green-400"
                        : srv.status === "Pending"
                          ? "text-yellow-400"
                          : "text-gray-500"
                    }`}
                  >
                    {srv.status}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ============================
          🪪 Invoice Details Modal
      ============================ */}
      {invoiceDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className={`max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl border ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            {/* Modal Header */}
            <div
              className={`p-6 border-b ${
                isDark
                  ? "border-gray-700 bg-gray-700"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`text-xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Invoice #{invoiceDetails.id}
                </h3>
                <button
                  onClick={() => setInvoiceDetails(null)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    isDark
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
              {/* Invoice Header */}
              <div
                className={`border-b pb-4 ${
                  isDark ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Issued:{" "}
                  {invoiceDetails.issuedAt
                    ? new Date(invoiceDetails.issuedAt).toLocaleDateString()
                    : "N/A"}{" "}
                  | Due:{" "}
                  {invoiceDetails.dueDate
                    ? new Date(invoiceDetails.dueDate).toLocaleDateString()
                    : "N/A"}
                </p>
                <p
                  className={`font-semibold mt-1 ${
                    invoiceDetails.status === "Paid"
                      ? "text-green-400"
                      : invoiceDetails.status === "Pending"
                        ? "text-yellow-400"
                        : "text-red-400"
                  }`}
                >
                  Status: {invoiceDetails.status}
                </p>
              </div>

              {/* Client Info */}
              {invoiceDetails.client && (
                <div>
                  <h3
                    className={`font-semibold text-lg mb-3 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Client Information
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div>
                      <b className={isDark ? "text-gray-300" : "text-gray-700"}>
                        Name:
                      </b>{" "}
                      {invoiceDetails.client.fullName}
                    </div>
                    <div>
                      <b className={isDark ? "text-gray-300" : "text-gray-700"}>
                        Phone:
                      </b>{" "}
                      {invoiceDetails.client.phone}
                    </div>
                    <div>
                      <b className={isDark ? "text-gray-300" : "text-gray-700"}>
                        Email:
                      </b>{" "}
                      {invoiceDetails.client.email}
                    </div>
                    <div>
                      <b className={isDark ? "text-gray-300" : "text-gray-700"}>
                        Address:
                      </b>{" "}
                      {invoiceDetails.client.address}
                    </div>
                  </div>
                </div>
              )}

              {/* Vehicle Info */}
              <div>
                <h3
                  className={`font-semibold text-lg mb-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <b className={isDark ? "text-gray-300" : "text-gray-700"}>
                      Make:
                    </b>{" "}
                    {invoiceDetails.client?.vehicleMake}
                  </div>
                  <div>
                    <b className={isDark ? "text-gray-300" : "text-gray-700"}>
                      Model:
                    </b>{" "}
                    {invoiceDetails.client?.vehicleModel}
                  </div>
                  <div>
                    <b className={isDark ? "text-gray-300" : "text-gray-700"}>
                      Year:
                    </b>{" "}
                    {invoiceDetails.client?.vehicleYear}
                  </div>
                  <div>
                    <b className={isDark ? "text-gray-300" : "text-gray-700"}>
                      Reg No:
                    </b>{" "}
                    {invoiceDetails.client?.regNumber}
                  </div>
                  <div>
                    <b className={isDark ? "text-gray-300" : "text-gray-700"}>
                      VIN:
                    </b>{" "}
                    {invoiceDetails.client?.vin}
                  </div>
                </div>
              </div>

              {/* Linked Services */}
              <div>
                <h3
                  className={`font-semibold text-lg mb-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Service Details
                </h3>
                {invoiceDetails.services?.length === 0 ? (
                  <p
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    No services linked to this invoice.
                  </p>
                ) : (
                  invoiceDetails.services.map((srv) => (
                    <div
                      key={srv.id}
                      className={`p-4 rounded-lg border mb-3 ${
                        isDark
                          ? "bg-gray-700 border-gray-600"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div
                          className={`font-semibold ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {srv.type}
                        </div>
                        <div
                          className={`font-bold ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          ₹{Number(srv.cost || 0).toFixed(2)}
                        </div>
                      </div>
                      <p
                        className={`text-sm mt-1 ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {srv.description || "No description"}
                      </p>
                      <p
                        className={`text-xs mt-2 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Date:{" "}
                        {srv.date
                          ? new Date(srv.date).toLocaleDateString()
                          : "N/A"}{" "}
                        | Status:{" "}
                        <span
                          className={
                            srv.status === "Completed"
                              ? "text-green-400"
                              : srv.status === "Pending"
                                ? "text-yellow-400"
                                : "text-gray-500"
                          }
                        >
                          {srv.status}
                        </span>
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Totals */}
              <div
                className={`border-t pt-4 text-right ${
                  isDark ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <div
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Subtotal: ₹
                  {Number(invoiceDetails.totalAmount || 0).toFixed(2)} <br />
                  Tax: ₹{Number(invoiceDetails.tax || 0).toFixed(2)} | Discount:
                  ₹{Number(invoiceDetails.discount || 0).toFixed(2)}
                </div>
                <h3
                  className={`text-xl font-bold mt-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Grand Total: ₹
                  {Number(invoiceDetails.grandTotal || 0).toFixed(2)}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
