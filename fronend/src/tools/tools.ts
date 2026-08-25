export const formatDate = (date: string) => {
  if (!date) return "";
  const dateR = new Date(date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return dateR;
};