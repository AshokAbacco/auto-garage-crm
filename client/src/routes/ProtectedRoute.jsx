import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

/**
 * ✅ Always have a fallback
 * Prevents frontend hitting itself (Vite HTML)
 */
const API_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  "https://naggingly-undeliberating-belia.ngrok-free.dev";


export default function ProtectedRoute({ children, requiredPlan }) {
  const location = useLocation();

  const [isValid, setIsValid] = useState(null);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setIsValid(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      // ❌ Token expired
      if (decoded.exp && decoded.exp < currentTime) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsValid(false);
        return;
      }

      // ✅ Token OK → verify with backend
      verifyToken();
    } catch (err) {
      console.error("JWT decode failed:", err);
      setIsValid(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyToken = async () => {
  try {
    console.log("VERIFY URL:", `${API_URL}/api/auth/verify`);

    const res = await fetch(`${API_URL}/api/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!res.ok) throw new Error("Verify failed");

    const data = await res.json();

    if (!data.valid || !data.user) {
      throw new Error("Invalid verify response");
    }

    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    setIsValid(true);
  } catch (err) {
    console.error("Verify token failed:", err);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsValid(false);
  }
};


  // ⏳ While verifying
  if (isValid === null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/90 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-gray-300 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            Verifying user…
          </p>
        </div>
      </div>
    );
  }

  // 🚫 Not authenticated
  if (!isValid) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ⭐ PLAN CHECK
  const normalizedPlan = (user?.plan || "BASIC").toUpperCase();

  if (
    requiredPlan &&
    !requiredPlan.map((p) => p.toUpperCase()).includes(normalizedPlan)
  ) {
    return <Navigate to="/upgrade" replace />;
  }

  // ✅ Access granted
  return children;
}
