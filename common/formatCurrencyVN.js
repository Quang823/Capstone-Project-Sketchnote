export const formatCurrencyVN = (value) => {
  if (value === null || value === undefined) return "0 ₫";

  const number = Number(value);
  if (isNaN(number)) return "0 ₫";

  return number.toLocaleString("vi-VN") + " ₫";
};
