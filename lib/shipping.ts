export const SHIPPING_FLAT_RATE = 15.00;
export const FREE_SHIPPING_THRESHOLD = 150.00;

export function calculateShipping(subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }
  return SHIPPING_FLAT_RATE;
}
