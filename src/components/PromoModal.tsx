import React from 'react';
import { 
  ShieldAlert, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  DollarSign
} from 'lucide-react';
import { InventoryRow } from '../types/inventory';

interface PromoModalProps {
  row: InventoryRow | null;
  onClose: () => void;
  onSelectStrategy: (skuId: string, useBaseline: boolean) => void;
}

export const PromoModal: React.FC<PromoModalProps> = ({
  row,
  onClose,
  onSelectStrategy
}) => {
  if (!row) return null;

  const peakQty = row.reorderQuantity;
  const baselineQty = row.recommendedBaselineOrder || 0;
  const unitCost = row.unitCost;
  const excessCost = Math.round((peakQty - baselineQty) * unitCost);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-2xs animate-in fade-in duration-150 select-none">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-lg w-full overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Institutional Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-amber-500/20 text-amber-400 border border-amber-400/30">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-wide font-mono text-white">
                  DEMAND VARIANCE AUDIT
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  GUARDRAIL ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Bullwhip effect mitigation on line item: <strong className="text-slate-200">{row.id}</strong>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Item Master Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[11px] font-bold text-slate-600">{row.id} · {row.category}</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{row.name}</div>
              </div>
              <span className="font-mono text-xs font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                Unit Cost: ${row.unitCost.toFixed(2)}
              </span>
            </div>
            <div className="text-slate-500 text-[11px] mt-1.5 flex items-center gap-3">
              <span>Vendor: <strong>{row.supplier}</strong></span>
              <span>•</span>
              <span>Hub: <strong>{row.hub}</strong></span>
              <span>•</span>
              <span>Lead Time: <strong>{row.effectiveLeadTime} days</strong></span>
            </div>
          </div>

          {/* Root cause notice */}
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-amber-900 text-xs">
              <strong className="font-bold">Variance Trigger:</strong> {row.promoDetails || 'One-off promotional clearance accelerated velocity above organic consumption rate.'}
            </div>
          </div>

          {/* Velocity Comparative Ledger */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-mono text-[11px]">
                  <th className="p-2 border-r border-slate-200 font-bold">Metric</th>
                  <th className="p-2 border-r border-slate-200 text-right font-bold text-rose-700">Promo Distorted</th>
                  <th className="p-2 text-right font-bold text-emerald-800">Organic Baseline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                <tr>
                  <td className="p-2 border-r border-slate-200 text-slate-600 font-sans font-medium">Daily Velocity</td>
                  <td className="p-2 border-r border-slate-200 text-right text-rose-700 font-bold">{row.dailySalesVelocity} units/day</td>
                  <td className="p-2 text-right text-emerald-700 font-bold">{row.baselineVelocity} units/day</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-200 text-slate-600 font-sans font-medium">Days of Cover</td>
                  <td className="p-2 border-r border-slate-200 text-right text-rose-700">{row.daysOfCover} days</td>
                  <td className="p-2 text-right text-emerald-700">{Math.round((row.onHandUnits / Math.max(0.1, row.baselineVelocity)) * 10) / 10} days</td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td className="p-2 border-r border-slate-200 text-slate-800 font-sans">Recommended Order</td>
                  <td className="p-2 border-r border-slate-200 text-right text-rose-700">{peakQty} units (${(peakQty * unitCost).toLocaleString()})</td>
                  <td className="p-2 text-right text-emerald-700">{baselineQty} units (${(baselineQty * unitCost).toLocaleString()})</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Capital Savings Callout */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span className="font-semibold text-emerald-950">Dead Inventory Capital Avoided:</span>
            </div>
            <span className="font-mono font-bold text-emerald-800 text-sm">
              +${excessCost.toLocaleString()} USD
            </span>
          </div>
        </div>

        {/* Action Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-4 py-3 flex items-center justify-end gap-2.5">
          <button
            onClick={() => {
              onSelectStrategy(row.id, false);
              onClose();
            }}
            className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
          >
            Reorder Peak Demand ({peakQty} units)
          </button>

          <button
            onClick={() => {
              onSelectStrategy(row.id, true);
              onClose();
            }}
            className="px-3.5 py-1.5 rounded text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Apply Baseline Restock ({baselineQty} units)
          </button>
        </div>
      </div>
    </div>
  );
};
