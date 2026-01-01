import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Invoice from "./Invoice";

export default function InvoicePreview() {
  const location = useLocation();
  const navigate = useNavigate();

  const invoiceDraft = location.state?.invoiceDraft;

  if (!invoiceDraft) {
    return <div className="p-8">No invoice data to preview</div>;
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Proforma Invoice (Preview)</h1>

        <div className="flex gap-3">
          {/* 🔁 EDIT — restore form */}
          <button
            onClick={() =>
              navigate("/billing/new", {
                state: {
                  restoreForm: true,
                  invoiceDraft,
                },
              })
            }
            className="px-4 py-2 border rounded-lg"
          >
            Edit
          </button>

          {/* ✅ CONFIRM & GENERATE */}
          <button
            onClick={() =>
              navigate("/billing/new", {
                state: {
                  restoreForm: true,
                  invoiceDraft,
                  autoSubmit: true,
                },
              })
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Confirm & Generate
          </button>
        </div>
      </div>

      {/* Invoice Layout */}
      <Invoice previewData={invoiceDraft} />
    </div>
  );
}
