import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API_URL = import.meta.env.VITE_API_BASE_URL;

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
      const res = await fetch(`${API_URL}/api/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsValid(false);
        return;
      }

      const data = await res.json();

      /**
       * 🔥 THIS IS THE CRITICAL FIX
       * Save the verified user INCLUDING plan
       */
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      setIsValid(true);
    } catch (err) {
      console.error("Verify token failed:", err);
      setIsValid(false);
    }
  };

  // ⏳ While verifying
  if (isValid === null) {
    return <div className="text-center p-10">Verifying...</div>;
  }

  // 🚫 Not authenticated
  if (!isValid) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ⭐ PLAN CHECK (safe + normalized)
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
