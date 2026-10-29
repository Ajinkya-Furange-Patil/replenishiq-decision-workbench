import type { InventoryItem, InventoryRow } from '../types/inventory.ts';

/**
 * Resilient CSV Parser and Exporter.
 * Adheres to RFC 4180, handles commas inside quotes, flexible column names,
 * currency signs, commas in numbers, and protects against malformed files.
 */

// Splits a CSV line taking quoted commas and escaped quotes into account
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote: "" -> "
        current += '"';
        i++; // skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseInventoryCsv(text: string): { items: InventoryItem[]; error?: string; warnings: string[] } {
  if (!text || !text.trim()) {
    return { items: [], error: 'The uploaded file is empty.', warnings: [] };
  }

  const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (rawLines.length < 2) {
    return { items: [], error: 'CSV file must have a header row and at least one data row.', warnings: [] };
  }

  // Parse header
  const headerCols = parseCsvLine(rawLines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  
  // Find column indices with fuzzy matching
  const findCol = (candidates: string[]): number => {
    return headerCols.findIndex(h => candidates.some(c => h.includes(c)));
  };

  const idxSku = findCol(['sku', 'id', 'itemcode', 'code']);
  const idxName = findCol(['productname', 'product', 'name', 'title', 'desc', 'description']);
  const idxCat = findCol(['category', 'type', 'dept', 'department']);
  const idxHub = findCol(['hub', 'dc', 'warehouse', 'location']);
  const idxSupplier = findCol(['supplier', 'vendor', 'manufacturer', 'brand']);
  const idxCost = findCol(['unitcost', 'cost', 'cogs', 'pricecost']);
  const idxPrice = findCol(['sellingprice', 'price', 'retail', 'msrp']);
  const idxOnHand = findCol(['onhand', 'stock', 'inventory', 'units', 'qty', 'quantity']);
  const idxVelocity = findCol(['velocity', 'dailysales', 'dailyrate', 'salesrate', 'rundate']);
  const idxLeadTime = findCol(['leadtime', 'lead', 'deliverytime', 'transit', 'lt']);
  const idxSafety = findCol(['safetystock', 'safety', 'buffer']);
  const idxPromo = findCol(['promo', 'spike', 'flag', 'discount']);
  const idxBaseVel = findCol(['baseline', 'organic', 'basevelocity']);
  const idxPromoDetails = findCol(['promodetails', 'details', 'notes', 'reason']);

  const warnings: string[] = [];
  const items: InventoryItem[] = [];
  const seenSkus = new Set<string>();

  // Limit processing to max 500 rows to prevent UI lag
  const dataLines = rawLines.slice(1, 501);
  if (rawLines.length > 501) {
    warnings.push(`File contained ${rawLines.length - 1} rows. Truncated to first 500 rows for real-time responsiveness.`);
  }

  for (let i = 0; i < dataLines.length; i++) {
    const rowNum = i + 2;
    const cols = parseCsvLine(dataLines[i]);
    if (cols.length === 0 || cols.every(c => c === '')) continue;

    // Helper to get sanitized string
    const getStr = (idx: number, fallback: string): string => {
      if (idx >= 0 && idx < cols.length && cols[idx]) {
        return cols[idx].replace(/^"|"$/g, '').trim();
      }
      return fallback;
    };

    // Helper to get sanitized number
    const getNum = (idx: number, fallback: number, min?: number, max?: number): number => {
      if (idx >= 0 && idx < cols.length && cols[idx]) {
        const cleaned = cols[idx].replace(/[^0-9.-]/g, '');
        const val = parseFloat(cleaned);
        if (!isNaN(val) && isFinite(val)) {
          let clamped = val;
          if (min !== undefined && clamped < min) clamped = min;
          if (max !== undefined && clamped > max) clamped = max;
          return clamped;
        }
      }
      return fallback;
    };

    let sku = getStr(idxSku, `SKU-IMP-${String(i + 1).padStart(3, '0')}`);
    if (seenSkus.has(sku)) {
      sku = `${sku}-D${i + 1}`;
      warnings.push(`Row ${rowNum}: Duplicate SKU detected. Renamed to ${sku}.`);
    }
    seenSkus.add(sku);

    const name = getStr(idxName, `Imported Inventory Item ${i + 1}`);
    const category = getStr(idxCat, 'General Retail');
    const hub = getStr(idxHub, 'Primary Distribution Center');
    const supplier = getStr(idxSupplier, 'Standard Vendor');
    const unitCost = getNum(idxCost, 25.0, 0.01, 50000);
    const sellingPrice = getNum(idxPrice, unitCost * 2.5, 0.01, 100000);
    const onHandUnits = Math.round(getNum(idxOnHand, 50, -100000, 10000000));
    const dailySalesVelocity = Math.max(0, Math.round(getNum(idxVelocity, 5.0, 0, 10000) * 10) / 10);
    const supplierLeadTimeDays = Math.max(1, Math.round(getNum(idxLeadTime, 14, 1, 365)));
    const safetyStockDays = Math.max(0, Math.round(getNum(idxSafety, 4, 0, 60)));

    const promoRaw = getStr(idxPromo, '').toLowerCase();
    const isPromoSpike = promoRaw === 'true' || promoRaw === '1' || promoRaw === 'yes' || promoRaw === 'y';
    const baselineVelocity = Math.max(
      0.1, 
      Math.round(getNum(idxBaseVel, isPromoSpike ? Math.max(1, dailySalesVelocity * 0.3) : dailySalesVelocity, 0.1, 10000) * 10) / 10
    );
    const promoDetails = getStr(idxPromoDetails, isPromoSpike ? 'Promotional volume spike detected' : '');

    items.push({
      id: sku,
      name,
      category,
      hub,
      supplier,
      unitCost,
      sellingPrice,
      onHandUnits,
      dailySalesVelocity,
      supplierLeadTimeDays,
      safetyStockDays,
      isPromoSpike,
      baselineVelocity,
      promoDetails
    });
  }

  if (items.length === 0) {
    return { items: [], error: 'Could not extract any valid inventory items from the CSV.', warnings };
  }

  return { items, warnings };
}

// Escapes CSV cell value per RFC 4180
function escapeCsv(value: any): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export function exportInventoryToCsv(rows: InventoryRow[]): string {
  const headers = [
    'SKU', 'Product Name', 'Category', 'DC Hub', 'Supplier',
    'Unit Cost ($)', 'Selling Price ($)', 'On-Hand Units',
    'Daily Sales Velocity', 'Supplier Lead Time (Days)', 'Safety Stock (Days)',
    'Days of Cover', 'Stockout Gap', 'Status', 'Recommended Reorder Qty', 'Reason Code'
  ];

  const lines = [headers.join(',')];

  rows.forEach(r => {
    const line = [
      escapeCsv(r.id),
      escapeCsv(r.name),
      escapeCsv(r.category),
      escapeCsv(r.hub),
      escapeCsv(r.supplier),
      r.unitCost.toFixed(2),
      r.sellingPrice.toFixed(2),
      r.onHandUnits,
      r.dailySalesVelocity.toFixed(1),
      r.supplierLeadTimeDays,
      r.safetyStockDays,
      r.daysOfCover.toFixed(1),
      r.stockoutGapDays.toFixed(1),
      escapeCsv(r.statusLabel),
      r.isPromoSpike && r.recommendedBaselineOrder ? r.recommendedBaselineOrder : r.reorderQuantity,
      escapeCsv(r.reasonCode)
    ];
    lines.push(line.join(','));
  });

  return lines.join('\r\n');
}

export function exportPurchaseOrderToCsv(
  poNumber: string,
  rows: InventoryRow[]
): string {
  const headers = [
    'PO Number', 'Line', 'SKU', 'Product Name', 'Supplier',
    'Category', 'DC Hub', 'Unit Cost ($)', 'Order Quantity',
    'Line Total ($)', 'Supplier Lead Time (Days)', 'Stockout Gap (Days)', 'Restock Strategy', 'Reason Code'
  ];

  const lines = [headers.join(',')];

  rows.forEach((r, idx) => {
    const qty = r.isPromoSpike && r.recommendedBaselineOrder ? r.recommendedBaselineOrder : r.reorderQuantity;
    const lineTotal = (qty * r.unitCost).toFixed(2);
    const strategy = r.isPromoSpike ? 'Baseline Restock (Promo Distortion Safeguard)' : 'Full Velocity Coverage';

    const line = [
      escapeCsv(poNumber),
      idx + 1,
      escapeCsv(r.id),
      escapeCsv(r.name),
      escapeCsv(r.supplier),
      escapeCsv(r.category),
      escapeCsv(r.hub),
      r.unitCost.toFixed(2),
      qty,
      lineTotal,
      r.effectiveLeadTime,
      r.stockoutGapDays.toFixed(1),
      escapeCsv(strategy),
      escapeCsv(r.reasonCode)
    ];
    lines.push(line.join(','));
  });

  return lines.join('\r\n');
}
