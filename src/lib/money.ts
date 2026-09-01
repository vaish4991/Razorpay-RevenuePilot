export function formatPaise(amountInPaise: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amountInPaise / 100);
}
