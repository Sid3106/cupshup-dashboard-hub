export function extractOrderId(text: string | null): string | null {
  if (!text) {
    console.log('No text provided to extract order ID from');
    return null;
  }
  
  console.log('Attempting to extract order ID from text:', text);
  
  // Look for patterns that could be order IDs
  const patterns = [
    /[A-Z0-9]{6,}/i,  // At least 6 alphanumeric characters
    /ORDER[:\s-]*([A-Z0-9]+)/i,  // "ORDER" followed by alphanumeric
    /ID[:\s-]*([A-Z0-9]+)/i,  // "ID" followed by alphanumeric
    /\b[A-Z0-9]{2,}-[A-Z0-9]{2,}\b/i, // Pattern like "XX-XX"
    /\b[A-Z0-9]{4,}\b/i, // Any 4+ character alphanumeric sequence
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const orderId = match[1] || match[0];
      console.log('Found order ID using pattern:', pattern, 'Order ID:', orderId);
      return orderId;
    }
  }

  console.log('No order ID pattern found in text');
  return null;
}