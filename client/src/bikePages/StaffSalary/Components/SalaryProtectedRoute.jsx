import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isSalaryLoggedIn } from "./auth";

const SalaryProtectedRoute = () => {
  return isSalaryLoggedIn() ? <Outlet /> : <Navigate to="/salary-login" />;
};

export default SalaryProtectedRoute;
