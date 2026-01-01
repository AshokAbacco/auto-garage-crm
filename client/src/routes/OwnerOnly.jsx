import { Navigate } from "react-router-dom";

export default function OwnerOnly({ children }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (user?.type === "staff") {
    return <Navigate to="/car-dashboard" replace />;
  }

  return children;
}
