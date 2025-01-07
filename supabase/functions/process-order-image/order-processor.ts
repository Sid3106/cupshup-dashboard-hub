export function extractOrderId(text: string | null): string | null {
  if (!text) {
    console.log('No text provided to extract order ID from');
    return null;
  }
  
  console.log('Attempting to extract order ID from text:', text);
  
  // Look specifically for "Order ID" pattern first
  const orderIdPattern = /Order\s*ID\s*[:\s-]*([A-Z0-9-]+)/i;
  const match = text.match(orderIdPattern);
  
  if (match && match[1]) {
    console.log('Found order ID:', match[1]);
    return match[1].trim();
  }
  
  // Fallback patterns if the specific "Order ID" pattern isn't found
  const fallbackPatterns = [
    /\b[A-Z0-9]{2,}-[A-Z0-9]{2,}\b/i,  // Pattern like "XX-XX"
    /\b[A-Z0-9]{6,}\b/i,  // Any 6+ character alphanumeric sequence
  ];

  for (const pattern of fallbackPatterns) {
    const fallbackMatch = text.match(pattern);
    if (fallbackMatch) {
      const orderId = fallbackMatch[0];
      console.log('Found order ID using fallback pattern:', pattern, 'Order ID:', orderId);
      return orderId;
    }
  }

  console.log('No order ID pattern found in text');
  return null;
}