// client/src/bikePages/StaffSalary/Components/auth.js
// client/src/bikePages/StaffSalary/auth.js

export const isSalaryLoggedIn = () => {
  return sessionStorage.getItem("salaryLoggedIn") === "true";
};

export const salaryLogin = () => {
  sessionStorage.setItem("salaryLoggedIn", "true");
};

export const salaryLogout = () => {
  sessionStorage.clear();
};
