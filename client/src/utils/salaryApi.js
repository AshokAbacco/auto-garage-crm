const BASE_URL = "/api/carstaff-salary";

export const getSalaries = async (month, year) => {
  const res = await fetch(`${BASE_URL}?month=${month}&year=${year}`);
  if (!res.ok) throw new Error("Failed to fetch salaries");
  return res.json();
};

export const generateSalary = async (month, year) => {
  const res = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ month, year }),
  });
  if (!res.ok) throw new Error("Failed to generate salary");
  return res.json();
};

export const markSalaryPaid = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}/pay`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to mark paid");
  return res.json();
};
