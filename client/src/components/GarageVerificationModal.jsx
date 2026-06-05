// src/components/GarageVerificationModal.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  X,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  UploadCloud,
  Loader2,
  Info,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Lock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function GarageVerificationModal({
  isOpen,
  onClose,
  verification,
  onRefreshState,
}) {
  const [currentStep, setCurrentStep] = useState(1); // Steps: 1 = Info, 2 = Draft Uploads, 3 = Payment / Resubmit
  const [submittingData, setSubmittingData] = useState(false);
  const [modalMessage, setModalMessage] = useState({ type: "", text: "" });
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // 📝 Local Forms Text Input States
  const [docNumbers, setDocNumbers] = useState({
    pan: verification?.panNumber || "",
    aadhar: verification?.aadharNumber || "",
    garageReg: verification?.garageRegNumber || "",
    gst: verification?.gstNumber || "",
  });

  // 📂 Local Frontend Memory State for Document Drafts (Committed only on successful checkout)
  const [draftFiles, setDraftFiles] = useState({
    aadhar: null,
    pan: null,
    garageReg: null,
    gst: null,
  });

  // Inject Razorpay checkout script if absent from runtime
  useEffect(() => {
    if (!isOpen) return;
    if (document.getElementById("razorpay-js")) {
      setRazorpayLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
  }, [isOpen]);

  // Sync state cleanly if verification properties refresh via layout tracking
  useEffect(() => {
    if (verification) {
      setDocNumbers({
        pan: verification.panNumber || "",
        aadhar: verification.aadharNumber || "",
        garageReg: verification.garageRegNumber || "",
        gst: verification.gstNumber || "",
      });

      // If user has already paid or been rejected, fast-forward directly to the upload/revision area
      if (verification.status !== "NOT_ORDERED" && currentStep === 1) {
        setCurrentStep(2);
      }
    }
  }, [verification]);

  if (!isOpen) return null;

  // Stashes selection values inside localized memory state without firing early API hits
  const handleLocalFileSelection = (e, type) => {
    const targetFile = e.target.files[0];
    if (!targetFile) return;

    setDraftFiles((prev) => ({
      ...prev,
      [type]: targetFile,
    }));

    setModalMessage({
      type: "success",
      text: `${targetFile.name} added to staging layout successfully.`,
    });
  };

  // Dispatch single combined execution string containing all parameters and file objects together
  const commitDataToProductionBackend = async (paymentDetails = null) => {
    setSubmittingData(true);
    setModalMessage({
      type: "",
      text: "Synchronizing security parameters and streaming assets...",
    });

    const bundleFormData = new FormData();

    // Map verification signatures if finalizing initial checkout tracks
    if (paymentDetails) {
      bundleFormData.append(
        "razorpay_payment_id",
        paymentDetails.razorpay_payment_id,
      );
      bundleFormData.append(
        "razorpay_order_id",
        paymentDetails.razorpay_order_id,
      );
      bundleFormData.append(
        "razorpay_signature",
        paymentDetails.razorpay_signature,
      );
    }

    // Append identification strings keys
    bundleFormData.append("panNumber", docNumbers.pan);
    bundleFormData.append("aadharNumber", docNumbers.aadhar);
    bundleFormData.append("garageRegNumber", docNumbers.garageReg);
    bundleFormData.append("gstNumber", docNumbers.gst);

    // Append fresh binary drafts if updated by user
    if (draftFiles.pan) bundleFormData.append("panDocument", draftFiles.pan);
    if (draftFiles.aadhar)
      bundleFormData.append("aadharDocument", draftFiles.aadhar);
    if (draftFiles.garageReg)
      bundleFormData.append("garageRegDocument", draftFiles.garageReg);
    if (draftFiles.gst) bundleFormData.append("gstDocument", draftFiles.gst);

    try {
      const token = localStorage.getItem("token");

      // Determine strategy endpoint based on payment history status
      const isReuploadPath =
        verification?.status === "REJECTED" ||
        verification?.status === "UNDER_REVIEW" ||
        verification?.status === "PAID_PENDING_DOCS";
      const targetUrl = isReuploadPath
        ? `${API_URL}/api/garage-verification/resubmit-documents`
        : `${API_URL}/api/garage-verification/confirm-payment-and-upload`;

      const methodType = isReuploadPath ? "PUT" : "POST";

      await axios({
        method: methodType,
        url: targetUrl,
        data: bundleFormData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setModalMessage({
        type: "success",
        text: "Garage verification details submitted successfully! Status moved to Under Review.",
      });

      await onRefreshState();
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      setModalMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Server transmission synchronization failed.",
      });
    } finally {
      setSubmittingData(false);
    }
  };

  const executePaymentCheckout = async () => {
    if (!razorpayLoaded) {
      return alert(
        "System Syncing: Payment gateway framework is initializing.",
      );
    }

    setSubmittingData(true);
    setModalMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/payments/create-verification-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount: 199 }),
        },
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.message || "Failed to establish transaction context",
        );

      const rzp = new window.Razorpay({
        key: data.razorpayKey,
        amount: data.order.amount,
        currency: "INR",
        name: "MotorDesk",
        description: "Verified Garage Badge Activation",
        order_id: data.order.id,
        theme: { color: "#4f46e5" },
        handler: async (response) => {
          // Pass transaction parameters down to compile the multipart save payload directly
          await commitDataToProductionBackend(response);
        },
        modal: { escape: false, backdropclose: false },
      });

      rzp.open();
    } catch (error) {
      setModalMessage({
        type: "error",
        text: error.message || "Initialization error setup loop",
      });
    } finally {
      setSubmittingData(false);
    }
  };

  // Helper validation: locks Step 2 transition until all mandatory targets are populated with values/files
  const isDraftFormFilled =
    (verification?.hasAadharDocument || draftFiles.aadhar) &&
    docNumbers.aadhar.trim().length >= 12 &&
    (verification?.hasPanDocument || draftFiles.pan) &&
    docNumbers.pan.trim().length >= 10 &&
    (verification?.hasGarageRegDocument || draftFiles.garageReg) &&
    docNumbers.garageReg.trim().length > 0;

  const isPaidUser =
    verification?.status !== "NOT_ORDERED" &&
    verification?.status !== undefined;
  const isRejectedState = verification?.status === "REJECTED";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-sm bg-slate-950/40 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Section */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Garage Verification Suite
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Establish a verified partner configuration profile
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                setModalMessage({ type: "", text: "" });
              }}
              className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tracker Progress Line */}
          <div className="grid grid-cols-3 gap-2 relative pt-2">
            {[
              { step: 1, text: "Overview" },
              { step: 2, text: "Draft Files Setup" },
              {
                step: 3,
                text: isPaidUser ? "Submit Revisions" : "Payment & Finalize",
              },
            ].map((node) => (
              <div key={node.step} className="flex flex-col gap-1.5">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    currentStep >= node.step ? "bg-indigo-600" : "bg-slate-100"
                  }`}
                />
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider ${
                    currentStep === node.step
                      ? "text-indigo-600"
                      : "text-slate-400"
                  }`}
                >
                  0{node.step}. {node.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Center */}
        {modalMessage.text && (
          <div className="px-6 pt-4">
            <div
              className={`p-4 rounded-xl border flex items-start gap-2.5 text-xs font-semibold ${
                modalMessage.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              <AlertCircle
                className={`w-4 h-4 shrink-0 ${modalMessage.type === "success" ? "text-emerald-600" : "text-rose-600"}`}
              />
              <span>{modalMessage.text}</span>
            </div>
          </div>
        )}

        {/* Wizard Panel Switching Shell */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* STEP 1: INFORMATIONAL PARAMETERS OVERVIEW */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/30 border border-indigo-100 shadow-sm flex gap-4 items-start">
                <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-600/10 shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-slate-900 tracking-tight">
                    Unlock the Verified Garage Badge
                  </h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Instantly display a premium verification shield across
                    booking engines, customer portals, and corporate summaries
                    to step up garage visibility metric tracking by up to 85%.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider block">
                  Requirements Overview
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Aadhaar Card of Owner",
                    "PAN Card of Owner",
                    "Garage Registration Proof",
                    "GST Certificate (Optional)",
                  ].map((reqStr, index) => (
                    <div
                      key={index}
                      className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center gap-3 font-semibold text-xs text-slate-700"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      {reqStr}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl flex gap-3">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Activation entails a single **₹199 one-time deployment
                  charge**. No continuous subscription costs map onto
                  verification processing tracks.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: METADATA CHANNELS & MEMORY DRAFT DROPZONE FILE SLOTS */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {verification?.adminNotes && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 rounded-xl">
                  ⚠️ Administrative Revision Notice: {verification.adminNotes}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: "aadhar",
                    title: "Aadhaar Card of Owner",
                    placeholder: "12-digit Aadhaar Number",
                    dbFlag: verification?.hasAadharDocument,
                    currentDraft: draftFiles.aadhar,
                  },
                  {
                    id: "pan",
                    title: "PAN Card of Owner",
                    placeholder: "10-digit Alphanumeric PAN",
                    dbFlag: verification?.hasPanDocument,
                    currentDraft: draftFiles.pan,
                  },
                  {
                    id: "garageReg",
                    title: "Garage Registration Certificate",
                    placeholder: "Registration / License Code",
                    dbFlag: verification?.hasGarageRegDocument,
                    currentDraft: draftFiles.garageReg,
                  },
                  {
                    id: "gst",
                    title: "GST Copy (Optional)",
                    placeholder: "15-digit GSTIN Code",
                    dbFlag: verification?.hasGstDocument,
                    currentDraft: draftFiles.gst,
                  },
                ].map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 tracking-tight">
                          {doc.title}
                        </span>
                        {(doc.dbFlag || doc.currentDraft) && (
                          <span
                            className={`inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded border ${
                              doc.currentDraft
                                ? "bg-amber-50 border-amber-200 text-amber-700"
                                : "bg-emerald-50 border-emerald-200 text-emerald-700"
                            }`}
                          >
                            <FileCheck className="w-3 h-3" />{" "}
                            {doc.currentDraft
                              ? "Staged Draft"
                              : "Saved on Server"}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={docNumbers[doc.id]}
                        disabled={doc.dbFlag && !isRejectedState} // Allow text changes if admin rejects row parameters
                        onChange={(e) =>
                          setDocNumbers((prev) => ({
                            ...prev,
                            [doc.id]: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        placeholder={doc.placeholder}
                      />
                    </div>

                    <div className="relative">
                      <input
                        type="file"
                        id={`modal-file-${doc.id}`}
                        disabled={
                          submittingData || (doc.dbFlag && !isRejectedState)
                        } // Unlock files if explicitly rejected
                        onChange={(e) => handleLocalFileSelection(e, doc.id)}
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf"
                      />
                      <label
                        htmlFor={`modal-file-${doc.id}`}
                        className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed text-xs font-bold transition-all ${
                          doc.dbFlag && !isRejectedState
                            ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                            : "bg-indigo-50/20 border-indigo-200 text-indigo-600 hover:bg-indigo-50/50 cursor-pointer"
                        }`}
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>
                          {doc.dbFlag && !isRejectedState
                            ? "Asset Saved"
                            : doc.currentDraft
                              ? "Replace Staged Draft"
                              : "Stage Document File"}
                        </span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: FINANCIAL WRAP-UP OR REVISION SUBMISSION EXECUTION */}
          {currentStep === 3 && (
            <div className="space-y-6 text-center py-4 animate-in fade-in duration-200 max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
                <CreditCard className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-900 tracking-tight">
                  {isPaidUser
                    ? "Push Revision Changes"
                    : "Finalize Trust Upgrade"}
                </h4>
                <p className="text-xs font-medium text-slate-400">
                  {isPaidUser
                    ? "Your changes will immediately re-trigger administrative compliance analysis strings."
                    : "Secure serialization configuration endpoint mapping initialization"}
                </p>
              </div>

              {!isPaidUser && (
                <div className="p-5 border-2 border-slate-100 bg-slate-50/60 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>Allocation Node</span>
                    <span className="text-slate-800">Verification Badge</span>
                  </div>
                  <div className="h-px bg-slate-200/60" />
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-1">
                      Total Due
                    </span>
                    <span className="text-4xl font-black text-slate-900 tracking-tight">
                      ₹199
                    </span>
                  </div>
                </div>
              )}

              {isPaidUser ? (
                <button
                  onClick={() => commitDataToProductionBackend(null)} // Call directly without signature tracking params for revision modifications
                  disabled={submittingData || !isDraftFormFilled}
                  className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {submittingData ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Committing
                      Changes...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Resubmit Review
                      Profile
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={executePaymentCheckout}
                  disabled={submittingData}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/10 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {submittingData ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing
                      Transmission...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" /> Pay ₹199 & Upload Staged
                      Drafts
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Multi-Step Action Navigation Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => {
              setModalMessage({ type: "", text: "" });
              setCurrentStep((prev) => Math.max(1, prev - 1));
            }}
            disabled={currentStep === 1 || submittingData}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {currentStep === 1 && (
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow transition flex items-center gap-1.5"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {currentStep === 2 && (
            <button
              onClick={() => setCurrentStep(3)}
              disabled={!isDraftFormFilled}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPaidUser ? "Review Revisions" : "Proceed to Payment"}{" "}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
