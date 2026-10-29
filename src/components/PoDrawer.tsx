import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  FileText,
  Building2,
  Layers,
  FileCheck,
  Scale
} from 'lucide-react';
import { InventoryRow, PurchaseOrderSummary } from '../types/inventory';
import { MarkdownMemo } from './MarkdownMemo';
import { PoAgreementDocument } from './PoAgreementDocument';

interface PoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRows: InventoryRow[];
  delayDays: number;
  isStreaming: boolean;
  streamingThoughts: string[];
  streamingMemo: string;
  poSummary: PurchaseOrderSummary | null;
  onDownloadPoCsv: () => void;
}

export const PoDrawer: React.FC<PoDrawerProps> = ({
  isOpen,
  onClose,
  selectedRows,
  delayDays,
  isStreaming,
  streamingThoughts,
  streamingMemo,
  poSummary,
  onDownloadPoCsv
}) => {
  const [activeTab, setActiveTab] = useState<'memo' | 'agreement' | 'lines'>('agreement');

  if (!isOpen) return null;

  const totalCost = selectedRows.reduce((acc, r) => {
    const qty = r.isPromoSpike && r.recommendedBaselineOrder ? r.recommendedBaselineOrder : r.reorderQuantity;
    return acc + (qty * r.unitCost);
  }, 0);

  const totalUnits = selectedRows.reduce((acc, r) => {
    const qty = r.isPromoSpike && r.recommendedBaselineOrder ? r.recommendedBaselineOrder : r.reorderQuantity;
    return acc + qty;
  }, 0);

  const suppliers = [...new Set(selectedRows.map(r => r.supplier))];
  const poRef = poSummary?.poNumber || 'PO-2026-784192';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-2xs animate-in fade-in duration-150 select-none print:static print:bg-transparent print:p-0 print:m-0 print:block print:inset-auto">
      <div 
        className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-300 overflow-hidden font-sans print:shadow-none print:w-full print:max-w-none print:h-auto print:border-none print:m-0 print:p-0 print:static print:overflow-visible print:block"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Document Header (Hidden in Print) */}
        <div className="po-drawer-header bg-slate-900 border-b border-slate-800 p-4 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm font-mono tracking-wide text-white uppercase">
                  Commercial Purchase Order & Procurement Agreement
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                  {poRef}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Release: Friday 15:00 PT · Terms: Net 30 Days EOM · DDP Destination Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-95"
              title="Print official Commercial Agreement"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Agreement</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip (Hidden in Print) */}
        <div className="po-drawer-tabs bg-slate-100 border-b border-slate-300 px-4 pt-2 flex items-center gap-2 text-xs font-mono font-semibold shrink-0 print:hidden">
          <button
            onClick={() => setActiveTab('agreement')}
            className={`pb-2 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'agreement'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>1. Commercial Purchase Agreement</span>
            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] rounded font-bold uppercase">
              Binding Contract
            </span>
          </button>
          <button
            onClick={() => setActiveTab('memo')}
            className={`pb-2 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'memo'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>2. Executive Authorization Memo</span>
          </button>
          <button
            onClick={() => setActiveTab('lines')}
            className={`pb-2 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'lines'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. Itemized Schedule ({selectedRows.length})</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs print:p-0 print:overflow-visible">
          {/* Financial Summary Strip (Hidden in Print) */}
          <div className="po-summary-strip grid grid-cols-3 gap-2.5 bg-slate-50 border border-slate-300 rounded-lg p-3 font-mono print:hidden">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Authorized Lines</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">{selectedRows.length} SKUs</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Total Order Volume</span>
              <div className="text-base font-bold text-blue-700 mt-0.5">{totalUnits.toLocaleString()} units</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Procurement Commitment</span>
              <div className="text-base font-bold text-emerald-700 mt-0.5">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
          </div>

          {/* Real-time Agent Reasoning Stream (Hidden in Print) */}
          <div className="po-reasoning-stream bg-slate-950 text-slate-200 rounded-lg p-3.5 border border-slate-800 font-mono text-[11px] space-y-2 print:hidden">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1.5 font-bold">
              <span className="flex items-center gap-1.5 text-blue-400">
                {isStreaming ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                    InfiniSynapse SSE Reasoning Stream...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Contract Terms Validated · Vendor Fulfillment Schedules Synchronized
                  </>
                )}
              </span>
              <span className="text-[10px] text-slate-500">TASK_ENGINE_ACT</span>
            </div>

            <div className="space-y-1 pt-1 max-h-28 overflow-y-auto">
              {streamingThoughts.map((step, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                  <span className="text-blue-500 select-none">›</span>
                  <span className="leading-snug">{step}</span>
                </div>
              ))}
              {isStreaming && (
                <div className="flex items-center gap-1.5 text-slate-500 italic">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  Validating commercial terms and liquidated demurrage clauses...
                </div>
              )}
            </div>
          </div>

          {/* TAB 1: FORMAL COMMERCIAL PURCHASE AGREEMENT */}
          {activeTab === 'agreement' && (
            <div className="space-y-3">
              <div className="bg-slate-900 text-slate-200 rounded-lg px-4 py-2.5 flex items-center justify-between font-mono text-xs print:hidden">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <span>Commercial Master Procurement Contract · Ready for Legal Transmission</span>
                </div>
                <button
                  onClick={handlePrint}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
              </div>

              <PoAgreementDocument
                poNumber={poRef}
                selectedRows={selectedRows}
                delayDays={delayDays}
                poSummary={poSummary}
                memoContent={streamingMemo}
              />
            </div>
          )}

          {/* TAB 2: EXECUTIVE AUTHORIZATION MEMO */}
          {activeTab === 'memo' && (
            <div className="po-memo-screen space-y-4 print:hidden">
              {streamingMemo ? (
                <div className="bg-white border border-slate-300 rounded-lg p-5 font-sans leading-relaxed text-slate-800 shadow-sm">
                  <MarkdownMemo content={streamingMemo} />
                </div>
              ) : isStreaming ? (
                <div className="py-12 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                  Generating executive replenishment memo...
                </div>
              ) : null}

              {/* Corporate Sign-off Block */}
              <div className="border border-slate-300 rounded-lg p-3.5 bg-slate-50 font-mono text-xs">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-1.5 mb-2.5">
                  Procurement Authorization Sign-Off
                </div>
                <div className="grid grid-cols-2 gap-4 text-slate-600 text-[11px]">
                  <div>
                    <span>Authorized Operator:</span>
                    <strong className="block text-slate-900 mt-0.5">Independent Retail Buyer (E. Vance)</strong>
                  </div>
                  <div>
                    <span>Execution Deadline:</span>
                    <strong className="block text-amber-900 mt-0.5">Friday, Oct 30, 2026 · 15:00 PT</strong>
                  </div>
                  <div>
                    <span>Status:</span>
                    <strong className="block text-emerald-800 mt-0.5">APPROVED — READY FOR TRANSMISSION</strong>
                  </div>
                  <div>
                    <span>Vendor Count:</span>
                    <strong className="block text-slate-900 mt-0.5">{suppliers.length} Consolidated Vendors</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ITEMIZED PROCUREMENT SCHEDULE */}
          {activeTab === 'lines' && (
            <div className="po-lines-screen border border-slate-300 rounded-lg overflow-hidden print:hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-mono text-[10px] uppercase font-bold">
                    <th className="p-2 border-r border-slate-300 w-8 text-center">#</th>
                    <th className="p-2 border-r border-slate-300">SKU & Item Description</th>
                    <th className="p-2 border-r border-slate-300">Vendor</th>
                    <th className="p-2 border-r border-slate-300 text-right">Unit Cost</th>
                    <th className="p-2 border-r border-slate-300 text-right">Order Qty</th>
                    <th className="p-2 text-right">Extended Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {selectedRows.map((r, idx) => {
                    const qty = r.isPromoSpike && r.recommendedBaselineOrder ? r.recommendedBaselineOrder : r.reorderQuantity;
                    const cost = qty * r.unitCost;

                    return (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="p-2 border-r border-slate-200 text-center text-slate-400">{idx + 1}</td>
                        <td className="p-2 border-r border-slate-200 font-sans">
                          <div className="font-mono font-bold text-slate-900">{r.id}</div>
                          <div className="text-slate-700 text-[11px] truncate max-w-xs">{r.name}</div>
                          {r.isPromoSpike && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                              Baseline Restock
                            </span>
                          )}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-slate-600 font-sans">{r.supplier}</td>
                        <td className="p-2 border-r border-slate-200 text-right text-slate-700">${r.unitCost.toFixed(2)}</td>
                        <td className="p-2 border-r border-slate-200 text-right font-bold text-slate-900">{qty}</td>
                        <td className="p-2 text-right font-bold text-emerald-800">${cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ALWAYS MOUNTED IN PRINT MODE: Ensures Print works regardless of active tab */}
          {activeTab !== 'agreement' && (
            <div className="hidden print:block">
              <PoAgreementDocument
                poNumber={poRef}
                selectedRows={selectedRows}
                delayDays={delayDays}
                poSummary={poSummary}
                memoContent={streamingMemo}
              />
            </div>
          )}
        </div>

        {/* Drawer Action Footer (Hidden in Print) */}
        <div className="po-drawer-footer p-3.5 border-t border-slate-300 bg-slate-100 flex items-center justify-between font-mono text-xs shrink-0 print:hidden">
          <div className="text-slate-600 text-[11px]">
            Contract Doc Ref: <strong>{poRef}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded bg-slate-900 hover:bg-black text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm text-xs active:scale-98"
              title="Print legally-binding Commercial Master Agreement"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Print Agreement</span>
            </button>

            <button
              onClick={onDownloadPoCsv}
              className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-98 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
