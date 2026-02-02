export const detectColumnType = (value) => {
  if (typeof value === "number") return "NUMBER";
  if (typeof value === "boolean") return "BOOLEAN";
  if (!isNaN(Date.parse(value))) return "DATE";
  return "TEXT";
};
