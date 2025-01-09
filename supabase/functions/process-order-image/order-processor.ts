export function extractOrderId(text: string): string | null {
  // Look for patterns like "ORDER-12345" or "OR-12345" or "O-12345"
  const patterns = [
    /ORDER[-\s]?(\d+)/i,
    /\b(OR|O)[-\s]?(\d+)\b/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // Return the full match (e.g., "ORDER-12345")
      return match[0];
    }
  }

  return null;
}