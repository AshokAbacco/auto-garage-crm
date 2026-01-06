// src/utils/salaryApi.js

const API = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = `${API}/api/carstaff-salary`;

/* ===============================
   GET SALARIES BY MONTH & YEAR
================================ */
export const getSalaries = async (month, year) => {
  const res = await fetch(`${BASE_URL}?month=${month}&year=${year}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch salaries");
  }

  return res.json();
};

/* ===============================
   GENERATE MONTHLY SALARY
   (Create if not exists)
================================ */
export const generateSalary = async (month, year, payrollInputs = {}) => {
  const res = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      month,
      year,
      payrollInputs,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to generate salary");
  }

  return res.json();
};

/* ===============================
   UPDATE SALARY (UNPAID / HOLD)
   PUT /api/carstaff-salary/:id
================================ */
export const updateSalary = async (id, data) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      leaves: data.leaves,
      bonus: data.bonus,
      extraDeductions: data.extraDeductions,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to update salary");
  }

  return res.json();
};

/* ===============================
   MARK SALARY AS PAID
================================ */
export const markSalaryPaid = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}/pay`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to mark salary as paid");
  }

  return res.json();
};
