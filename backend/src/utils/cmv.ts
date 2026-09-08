export function computeLineCost(unit: string, pricePerUnit: number, quantity: number): number {
  if (unit === "kg" || unit === "litro") {
    return (quantity / 1000) * pricePerUnit;
  }
  return quantity * pricePerUnit;
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
