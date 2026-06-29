const USD_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

export function formatCurrency(value: string | number): string {
  return USD_FORMATTER.format(Number(value));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatOrderStatus(status: string): string {
  const labels: Record<string, string> = {
    awaiting_confirmation: 'Awaiting Confirmation',
    ready_to_ship: 'Ready to Ship',
    shipping: 'Shipping',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return labels[status] ?? status;
}

export function formatPaymentMethod(method: string): string {
  const labels: Record<string, string> = {
    cod: 'Cash on Delivery',
    vnpay: 'VNPay',
    momo: 'MoMo',
  };
  return labels[method] ?? method;
}
