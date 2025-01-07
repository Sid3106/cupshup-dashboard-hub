export function extractOrderId(text: string | null): string | null {
  if (!text) return null;
  
  // Look for patterns that could be order IDs
  // Adjust these patterns based on your actual order ID format
  const patterns = [
    /[A-Z0-9]{6,}/i,  // At least 6 alphanumeric characters
    /ORDER[:\s-]*([A-Z0-9]+)/i,  // "ORDER" followed by alphanumeric
    /ID[:\s-]*([A-Z0-9]+)/i,  // "ID" followed by alphanumeric
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const orderId = match[1] || match[0];
      console.log('Found order ID:', orderId);
      return orderId;
    }
  }

  console.log('No order ID pattern found in text');
  return null;
}