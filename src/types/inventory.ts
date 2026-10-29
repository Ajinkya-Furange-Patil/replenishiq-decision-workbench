export interface InventoryItem {
  id: string;
  name: string;
  category: 'Footwear' | 'Apparel' | 'Accessories' | string;
  hub: string;
  supplier: string;
  unitCost: number;
  sellingPrice: number;
  onHandUnits: number;
  dailySalesVelocity: number;
  supplierLeadTimeDays: number;
  safetyStockDays: number;
  isPromoSpike: boolean;
  baselineVelocity: number;
  promoDetails: string;
}

export type ReplenishmentStatus = 
  | 'REORDER_NOW' 
  | 'WATCH_PROMO' 
  | 'COVER_SAFE' 
  | 'HOLD_OVERSTOCKED';

export interface CalculatedMetrics {
  effectiveLeadTime: number;
  daysOfCover: number;
  stockoutGapDays: number;
  status: ReplenishmentStatus;
  statusLabel: string;
  reorderQuantity: number;
  reorderCost: number;
  reasonCode: string;
  caveatWarning?: string;
  recommendedBaselineOrder?: number;
}

export interface InventoryRow extends InventoryItem, CalculatedMetrics {}

export type FilterCategory = 'ALL' | 'CRITICAL' | 'PROMO_DISTORTED' | 'SAFE' | 'OVERSTOCKED';

export interface PurchaseOrderLine {
  sku: string;
  name: string;
  supplier: string;
  unitCost: number;
  recommendedQty: number;
  totalCost: number;
  reason: string;
  isPromoSpike: boolean;
  leadTime: number;
}

export interface PurchaseOrderSummary {
  poNumber: string;
  generatedAt: string;
  totalItems: number;
  totalUnits: number;
  totalExpenditure: number;
  lines: PurchaseOrderLine[];
  aiAnalysisMemo?: string;
}

