export interface SalesChannel {
  label: string;
  commissionPct: number;
}

export const SALES_CHANNELS: SalesChannel[] = [
  { label: "Cardápio próprio", commissionPct: 0 },
  { label: "iFood", commissionPct: 23 },
  { label: "99Food", commissionPct: 10.9 },
];
