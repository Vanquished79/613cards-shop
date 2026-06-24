export function getNumberedColor(serialNumber: string | null) {
  const defaultColor = { bg: 'rgba(234, 179, 8, 0.2)', text: '#facc15', border: 'rgba(234, 179, 8, 0.3)' }; // Yellow fallback
  if (!serialNumber) return defaultColor;
  
  // Parse denominator: "5/199", "1 of 1", etc.
  const match = serialNumber.match(/(?:\/|of)\s*(\d+)/i);
  let denom = null;
  
  if (match) {
    denom = parseInt(match[1], 10);
  } else {
    // If just a raw number like "199", assume denominator
    const num = parseInt(serialNumber.replace(/\D/g, ''), 10);
    if (!isNaN(num)) denom = num;
  }

  if (denom !== null) {
    if (denom <= 1) return { bg: '#1a1a1a', text: '#fbbf24', border: '#fbbf24' }; // 1/1: Black & Gold
    if (denom <= 10) return { bg: 'rgba(251, 191, 36, 0.2)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.4)' }; // <= 10: Gold
    if (denom <= 25) return { bg: 'rgba(249, 115, 22, 0.2)', text: '#f97316', border: 'rgba(249, 115, 22, 0.3)' }; // <= 25: Orange
    if (denom <= 50) return { bg: 'rgba(6, 182, 212, 0.2)', text: '#06b6d4', border: 'rgba(6, 182, 212, 0.3)' }; // <= 50: Teal
    if (denom <= 99) return { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' }; // <= 99: Red
    if (denom <= 199) return { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' }; // <= 199: Green
    if (denom <= 299) return { bg: 'rgba(168, 85, 247, 0.2)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' }; // <= 299: Purple
    if (denom <= 499) return { bg: 'rgba(59, 130, 246, 0.2)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' }; // <= 499: Blue
    return { bg: 'rgba(156, 163, 175, 0.2)', text: '#9ca3af', border: 'rgba(156, 163, 175, 0.3)' }; // > 499: Silver
  }
  
  return defaultColor;
}
