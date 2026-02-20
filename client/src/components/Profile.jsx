import React, { useState, useEffect } from "react";
import {
  Camera,
  Save,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function Profile() {
  const [user, setUser] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    newPassword: "",
    phone: "",
    companyName: "",
  });

  const [kycData, setKycData] = useState({
    upiId: "",
    panNumber: "",
    bankAccount: "",
    accountName: "",
    bankName: "",
    branch: "",
    ifscCode: "",
    kycStatus: "NOT_SUBMITTED",
  });

  // Fetch User & KYC Data
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(storedUser);
    setFormData({
      username: storedUser?.username || "",
      email: storedUser?.email || "",
      password: "",
      newPassword: "",
      phone: storedUser?.phone || "",
      companyName: storedUser?.companyName || "",
    });

    if (storedUser?.profileImage) {
      setImagePreview(
        storedUser.profileImage.startsWith("data:image")
          ? storedUser.profileImage
          : `data:image/png;base64,${storedUser.profileImage}`,
      );
    }

    const fetchKyc = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_URL}/api/profile/kyc`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setKycData(await res.json());
      } catch (err) {
        console.error("KYC fetch error:", err);
      }
    };
    fetchKyc();
  }, []);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    name in formData
      ? setFormData((p) => ({ ...p, [name]: value }))
      : setKycData((p) => ({ ...p, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setImagePreview(base64);
      uploadImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (base64Image) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/user/upload-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ image: base64Image }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");
    try {
      // Update basic info
      const res = await fetch(`${API_URL}/api/user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Update failed");

      // Update password if provided
      if (formData.password && formData.newPassword) {
        const passRes = await fetch(`${API_URL}/api/user/change-password`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: formData.password,
            newPassword: formData.newPassword,
          }),
        });
        if (!passRes.ok) return alert("Password update failed");
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      alert("Profile Updated!");
      navigate("/car-dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveKyc = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/profile/kyc`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(kycData),
      });
      if (res.ok) {
        alert("KYC Updated");
        setKycData((p) => ({ ...p, kycStatus: "PENDING" }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDocumentUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const formDataObj = new FormData();
    formDataObj.append(field, file);
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_URL}/api/profile/kyc/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataObj,
      });
      alert("Document Uploaded");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/auth/delete`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        localStorage.clear();
        navigate("/");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reusable Input Class
  const inputClass = `w-full px-4 py-3 rounded-lg border transition-all ${
    isDark
      ? "bg-gray-800 border-gray-700 text-white focus:border-indigo-500"
      : "bg-white border-gray-300 text-gray-900 focus:border-indigo-600"
  }`;

  return (
    <div
      className={`min-h-screen py-10 px-4 sm:px-10 ${
        isDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="w-full max-w-5xl mx-auto space-y-8">
        {/* Header & Image */}
        <div
          className={`p-8 rounded-2xl shadow-sm border ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            <div className="relative">
              <img
                src={
                  imagePreview ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-4 shadow-sm"
              />
              <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full cursor-pointer hover:bg-indigo-700 transition">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  className="hidden"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </label>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Profile Settings</h1>
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                Manage your account details and preferences
              </p>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <input
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <input
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>
            <div className="space-y-2 relative">
              <label className="text-sm font-medium">Current Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter current password"
                value={formData.password}
                onChange={handleInputChange}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            className="mt-8 w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <Save size={18} /> Save Changes
          </button>
        </div>

        {/* KYC Section */}
        <div
          className={`p-8 rounded-2xl shadow-sm border ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Payout KYC Information</h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                kycData.kycStatus === "VERIFIED"
                  ? "bg-green-100 text-green-700"
                  : kycData.kycStatus === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              {kycData.kycStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Account Holder Name</label>
              <input
                name="accountName"
                value={kycData.accountName || ""}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bank Account Number</label>
              <input
                name="bankAccount"
                value={kycData.bankAccount || ""}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="1234567890"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bank Name</label>
              <input
                name="bankName"
                value={kycData.bankName || ""}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="HDFC Bank"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Branch</label>
              <input
                name="branch"
                value={kycData.branch || ""}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Indiranagar"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">IFSC Code</label>
              <input
                name="ifscCode"
                value={kycData.ifscCode || ""}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="HDFC0001234"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">UPI ID</label>
              <input
                name="upiId"
                value={kycData.upiId || ""}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="example@upi"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">PAN Number</label>
              <input
                name="panNumber"
                value={kycData.panNumber || ""}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="ABCDE1234F"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload PAN Document</label>
              <input
                type="file"
                onChange={(e) => handleDocumentUpload(e, "panDocument")}
                className={`${inputClass} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Bank Proof</label>
              <input
                type="file"
                onChange={(e) => handleDocumentUpload(e, "bankProofDocument")}
                className={`${inputClass} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100`}
              />
            </div>
          </div>

          <button
            onClick={handleSaveKyc}
            className="mt-6 w-full sm:w-auto px-8 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition dark:bg-indigo-600 dark:hover:bg-indigo-700"
          >
            Save KYC Details
          </button>
        </div>

        {/* Danger Zone */}
        <div
          className={`p-8 rounded-2xl shadow-sm border border-red-200 ${
            isDark ? "bg-red-900/10 border-red-800" : "bg-red-50"
          }`}
        >
          <h2 className="text-lg font-bold text-red-600">Delete Account</h2>
          <p className="text-sm text-red-500 mb-4">
            Once deleted, your account and all data will be permanently removed.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            <Trash2 size={18} /> Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}
