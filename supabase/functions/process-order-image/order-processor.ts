export function extractOrderId(text: string | null): string | null {
  if (!text) {
    console.log('No text provided to extract order ID from');
    return null;
  }
  
  console.log('Attempting to extract order ID from text:', text);
  
  // Look specifically for Order Id followed by OD number
  const orderIdPattern = /Order\s*Id\s*\n*([OD0-9]+)/i;
  const match = text.match(orderIdPattern);
  
  if (match && match[1]) {
    const orderId = match[1].trim();
    console.log('Found order ID:', orderId);
    return orderId;
  }
  
  // Secondary pattern specifically for OD numbers
  const odPattern = /\b(OD[0-9]+)\b/;
  const odMatch = text.match(odPattern);
  
  if (odMatch && odMatch[1]) {
    const orderId = odMatch[1].trim();
    console.log('Found OD number:', orderId);
    return orderId;
  }

  console.log('No order ID pattern found in text');
  return null;
}