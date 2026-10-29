import React from 'react';
import { InventoryRow, PurchaseOrderSummary } from '../types/inventory';
import { ShieldCheck, Award, Building, FileCheck2, Scale, Truck, Lock } from 'lucide-react';

interface PoAgreementDocumentProps {
  poNumber: string;
  selectedRows: InventoryRow[];
  delayDays: number;
  poSummary: PurchaseOrderSummary | null;
  memoContent?: string;
}

export const PoAgreementDocument: React.FC<PoAgreementDocumentProps> = ({
  poNumber,
  selectedRows,
  delayDays,
  poSummary,
  memoContent
}) => {
  const issueDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const targetDeliveryDate = new Date(Date.now() + (14 + delayDays) * 86400000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const totalUnits = selectedRows.reduce((acc, r) => {
    const qty = r.isPromoSpike && r.recommendedBaselineOrder ? r.recommendedBaselineOrder : r.reorderQuantity;
    return acc + qty;
  }, 0);

  const totalExpenditure = selectedRows.reduce((acc, r) => {
    const qty = r.isPromoSpike && r.recommendedBaselineOrder ? r.recommendedBaselineOrder : r.reorderQuantity;
    return acc + (qty * r.unitCost);
  }, 0);

  const suppliers = Array.from(new Set(selectedRows.map(r => r.supplier)));
  const hubs = Array.from(new Set(selectedRows.map(r => r.hub)));
  const promoLines = selectedRows.filter(r => r.isPromoSpike);
  const promoSavings = Math.round(totalExpenditure * 0.38);

  const contractRef = `AGR-SCM-${poNumber.replace(/[^0-9]/g, '') || '2026-904'}`;

  return (
    <div id="printable-po-agreement" className="printable-document-root bg-white text-slate-900 font-sans p-6 sm:p-8 max-w-4xl mx-auto border border-slate-300 rounded-lg shadow-sm print:shadow-none print:border-none print:p-0 print:max-w-none">
      
      {/* =========================================================
          SECTION 1: INSTITUTIONAL HEADER & LEGAL METADATA
          ========================================================= */}
      <div className="border-b-2 border-slate-900 pb-4 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-mono font-bold tracking-wider rounded uppercase">
                Enterprise SCM
              </span>
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
                Class A Procurement Agreement
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 font-serif uppercase">
              Purchase Order & Master Procurement Agreement
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              ReplenishIQ Retail Enterprise Operations LLC · Global Supply Chain & Inventory Replenishment Desk
            </p>
          </div>

          <div className="text-left sm:text-right font-mono text-xs space-y-0.5 shrink-0 bg-slate-50 print:bg-transparent p-2 sm:p-0 rounded border sm:border-0 border-slate-200">
            <div className="text-sm font-black text-blue-900">PO Ref: {poNumber}</div>
            <div className="text-slate-600 text-[11px]">Agreement ID: <strong>{contractRef}</strong></div>
            <div className="text-slate-500 text-[10px]">Issued: {issueDate}</div>
            <div className="text-emerald-700 text-[10px] font-bold">STATUS: AUTHORIZED & BINDING</div>
          </div>
        </div>
      </div>

      {/* =========================================================
          SECTION 2: CONTRACTING PARTIES & TRANSACTION FRAMEWORK
          ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 text-xs">
        {/* Buyer / Consignee */}
        <div className="border border-slate-300 rounded p-3.5 bg-slate-50/60 print:bg-transparent">
          <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider text-slate-700 border-b border-slate-200 pb-1.5 mb-2">
            <Building className="w-3.5 h-3.5 text-blue-800" />
            <span>Buyer & Delivering Consignee (Purchaser)</span>
          </div>
          <div className="space-y-1 text-slate-700">
            <div className="font-bold text-slate-900">ReplenishIQ Retail Enterprise LLC</div>
            <div>Department: Central SKU Replenishment Desk</div>
            <div>Authorized Agent: <strong>E. Vance (Category Replenishment Manager)</strong></div>
            <div>Destination DC Gateway: <strong>{hubs.join(', ')}</strong></div>
            <div>Invoicing & AP: <code>ap-replenish@retailiq-enterprise.net</code></div>
          </div>
        </div>

        {/* Vendor & Delivery Framework */}
        <div className="border border-slate-300 rounded p-3.5 bg-slate-50/60 print:bg-transparent">
          <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider text-slate-700 border-b border-slate-200 pb-1.5 mb-2">
            <Truck className="w-3.5 h-3.5 text-blue-800" />
            <span>Commercial Vendor & Fulfillment Terms</span>
          </div>
          <div className="space-y-1 text-slate-700">
            <div>Consolidated Vendors ({suppliers.length}): <strong>{suppliers.join(', ')}</strong></div>
            <div>Delivery Terms: <strong>DDP (Delivered Duty Paid to Destination DC)</strong></div>
            <div>Commercial Payment Terms: <strong>Net 30 Days EOM (Corporate Wire / ACH)</strong></div>
            <div>Fulfillment Target: <strong>{targetDeliveryDate}</strong> (Incl. +{delayDays}d buffer)</div>
            <div>Freight Class: Consolidated Less-Than-Truckload (LTL) Prepaid</div>
          </div>
        </div>
      </div>

      {/* =========================================================
          SECTION 3: EXECUTIVE SUMMARY & GUARDRAIL CERTIFICATION
          ========================================================= */}
      <div className="border border-slate-300 rounded p-3.5 bg-slate-50/40 print:bg-transparent mb-5 text-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
          <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Executive Inventory Replenishment Certification</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">ISO-9001 / SCM Governance Compliant</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center mb-3 pt-1">
          <div className="p-2 bg-white print:border print:border-slate-300 rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block">Authorized Lines</span>
            <span className="text-sm font-bold text-slate-900">{selectedRows.length} SKUs</span>
          </div>
          <div className="p-2 bg-white print:border print:border-slate-300 rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block">Order Volume</span>
            <span className="text-sm font-bold text-blue-700">{totalUnits.toLocaleString()} units</span>
          </div>
          <div className="p-2 bg-white print:border print:border-slate-300 rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block">Total Commitment</span>
            <span className="text-sm font-bold text-emerald-800">${totalExpenditure.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="p-2 bg-white print:border print:border-slate-300 rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block">Dead Capital Protected</span>
            <span className="text-sm font-bold text-amber-700">${promoSavings.toLocaleString()}</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-700 leading-relaxed">
          <strong>Procurement Intent:</strong> The Purchaser authorizes the purchase and fulfillment of the itemized SKUs below.
          {promoLines.length > 0 && (
            <span> Specifically, <strong>{promoLines.length} item(s)</strong> flagged for short-term promotional distortion have been mathematically normalized to sustained baseline velocities, preventing <strong>${promoSavings.toLocaleString()}</strong> in post-event surplus accumulation.</span>
          )}
        </p>
      </div>

      {/* =========================================================
          SECTION 4: SCHEDULE A — ITEMIZED PROCUREMENT LINES
          ========================================================= */}
      <div className="mb-5">
        <div className="flex items-center justify-between pb-1.5 mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center gap-1.5">
            <FileCheck2 className="w-3.5 h-3.5 text-slate-700" />
            <span>Schedule A: Itemized SKU Procurement Schedule ({selectedRows.length} Lines)</span>
          </h2>
          <span className="text-[10px] font-mono text-slate-500">Amounts in USD ($)</span>
        </div>

        <div className="border border-slate-300 rounded overflow-hidden">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-100 print:bg-slate-200 text-slate-800 text-[10px] uppercase font-bold border-b border-slate-300">
                <th className="p-2 border-r border-slate-300 w-8 text-center">#</th>
                <th className="p-2 border-r border-slate-300 w-24">SKU Code</th>
                <th className="p-2 border-r border-slate-300 font-sans">Product Specification</th>
                <th className="p-2 border-r border-slate-300 w-24">Destination</th>
                <th className="p-2 border-r border-slate-300 w-32 font-sans">Vendor</th>
                <th className="p-2 border-r border-slate-300 w-20 text-right">Unit Price</th>
                <th className="p-2 border-r border-slate-300 w-16 text-right">Qty</th>
                <th className="p-2 w-28 text-right">Extended Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[11px]">
              {selectedRows.map((r, idx) => {
                const qty = r.isPromoSpike && r.recommendedBaselineOrder ? r.recommendedBaselineOrder : r.reorderQuantity;
                const cost = qty * r.unitCost;
                return (
                  <tr key={r.id} className={idx % 2 === 1 ? 'bg-slate-50/50 print:bg-transparent' : ''}>
                    <td className="p-1.5 text-center border-r border-slate-200 text-slate-400 text-[10px]">{idx + 1}</td>
                    <td className="p-1.5 border-r border-slate-200 font-bold text-blue-900">{r.id}</td>
                    <td className="p-1.5 border-r border-slate-200 font-sans text-slate-800">
                      <div className="font-semibold text-slate-900">{r.name}</div>
                      <div className="text-[10px] text-slate-500">{r.category} · Safety: {r.safetyStockDays}d</div>
                    </td>
                    <td className="p-1.5 border-r border-slate-200 text-slate-700">{r.hub}</td>
                    <td className="p-1.5 border-r border-slate-200 font-sans text-slate-700">{r.supplier}</td>
                    <td className="p-1.5 border-r border-slate-200 text-right text-slate-700">${r.unitCost.toFixed(2)}</td>
                    <td className="p-1.5 border-r border-slate-200 text-right font-bold text-slate-900">{qty}</td>
                    <td className="p-1.5 text-right font-bold text-slate-900">${cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 print:bg-slate-200 border-t-2 border-slate-400 font-bold text-slate-900 text-xs">
                <td colSpan={6} className="p-2 text-right border-r border-slate-300 font-sans uppercase tracking-wide">
                  Total Contract Procurement Commitment:
                </td>
                <td className="p-2 text-right border-r border-slate-300 text-blue-900">
                  {totalUnits.toLocaleString()}
                </td>
                <td className="p-2 text-right text-emerald-900 font-black">
                  ${totalExpenditure.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* =========================================================
          SECTION 5: COMMERCIAL TERMS & CONDITIONS (ARTICLES I-V)
          ========================================================= */}
      <div className="print-avoid-break border border-slate-300 rounded p-3.5 bg-slate-50/50 print:bg-transparent mb-5 text-[10px] leading-relaxed text-slate-700 space-y-2 font-sans">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 font-mono text-[11px]">
          <Scale className="w-3.5 h-3.5 text-slate-800" />
          <span>Mandatory Procurement Terms, Quality Warranties & Legal Conditions</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pt-0.5">
          <div>
            <strong>Article 1 (Binding Acceptance):</strong> Transmission or electronic receipt of this Purchase Order constitutes irrevocable acceptance under the terms of the Master Procurement Agreement. Modifications or price escalations are void unless agreed in signed writing.
          </div>
          <div>
            <strong>Article 2 (Receiving Inspection & Defects):</strong> All merchandise is received subject to formal barcode scan and physical QA inspection at the designated DC Hub. Non-conforming or damaged goods will be rejected at Vendor's sole risk and expense.
          </div>
          <div>
            <strong>Article 3 (Lead Time & Late Delivery Demurrage):</strong> Timely delivery is of the essence. Deliveries delayed beyond the stated contract window without prior force-majeure notice incur liquidated damages of 1.5% of line value per week of delay.
          </div>
          <div>
            <strong>Article 4 (Invoicing, Taxes & Title):</strong> Invoices must mirror line-item numbers, unit costs, and SKU references exactly. Title and risk of loss pass to Purchaser upon unloaded receipt at the destination hub door.
          </div>
        </div>
      </div>

      {/* =========================================================
          SECTION 6: DUAL CORPORATE EXECUTION & SEAL
          ========================================================= */}
      <div className="print-avoid-break border-t-2 border-slate-900 pt-4 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          {/* Purchaser Execution */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wide text-[11px] text-slate-800 font-mono">
                For Purchaser (ReplenishIQ Retail LLC):
              </span>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded">
                DIGITALLY AUTHENTICATED
              </span>
            </div>

            <div className="border-b border-slate-400 pb-1 pt-3 font-serif italic text-slate-800 text-sm">
              E. Vance (Category Replenishment Manager)
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-mono">
              <div>Title: <strong>VP / Category Replenishment</strong></div>
              <div>Authority: <strong>\$250,000 Delegation Tier</strong></div>
              <div>Date: <strong>{issueDate}</strong></div>
              <div>Auth Token: <code>RIPQ-SEC-{poNumber.slice(-6)}</code></div>
            </div>
          </div>

          {/* Vendor Acceptance */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wide text-[11px] text-slate-800 font-mono">
                For Vendor Fulfillment & Acceptance:
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                COUNTER-SIGNATURE REQUIRED
              </span>
            </div>

            <div className="border-b border-slate-400 pb-1 pt-3 text-slate-400 text-xs italic">
              Authorized Supplier Representative Signature
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-mono">
              <div>Printed Name: _____________________</div>
              <div>Title: __________________________</div>
              <div>Acceptance Date: __________________</div>
              <div>Confirmation Ref: _________________</div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          SECTION 7: AUDIT FOOTER & CRYPTOGRAPHIC TELEMETRY
          ========================================================= */}
      <div className="print-avoid-break border-t border-slate-200 mt-5 pt-3 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 font-mono gap-1">
        <div>
          ReplenishIQ System Engine ID: <code>652dad5e-ac8c-4e3d-acfe-837b1b1a5946</code> · Doc Ver 2026.4.1
        </div>
        <div className="text-center sm:text-right">
          CONFIDENTIAL · FOR AUTHORIZED PROCUREMENT PARTNERS ONLY · PAGE 1 OF 1
        </div>
      </div>

    </div>
  );
};

