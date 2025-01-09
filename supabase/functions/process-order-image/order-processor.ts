export function extractOrderId(text: string): string | null {
  // You can customize this function based on your order ID format
  const orderIdMatch = text.match(/Order[:\s]+([A-Z0-9]+)/i);
  return orderIdMatch ? orderIdMatch[1] : null;
}