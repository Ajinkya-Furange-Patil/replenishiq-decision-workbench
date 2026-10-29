import React, { useMemo } from 'react';
import { InventoryRow, FilterCategory } from '../types/inventory';
import { computeReplenishmentAggregates } from '../utils/replenishmentMath';

interface SummaryMetricsProps {
  rows: InventoryRow[];
  activeFilter: FilterCategory;
  onFilterChange: (filter: FilterCategory) => void;
}

export const SummaryMetrics: React.FC<SummaryMetricsProps> = ({
  rows,
  activeFilter,
  onFilterChange
}) => {
  // Raw Engineered O(N) Single-Pass Computation with O(1) Auxiliary Space
  const aggs = useMemo(() => computeReplenishmentAggregates(rows), [rows]);

  const cards = [
    {
      id: 'CRITICAL' as FilterCategory,
      title: 'Critical Stockout',
      count: aggs.criticalCount,
      metric: `\$${Math.round(aggs.totalReorderCapital).toLocaleString()} Reorder`,
      dotColor: 'bg-rose-500',
      activeBorder: 'border-rose-500'
    },
    {
      id: 'PROMO_DISTORTED' as FilterCategory,
      title: 'Promo Guardrail',
      count: aggs.promoCount,
      metric: `+\$${Math.round(aggs.promoCapitalSaved).toLocaleString()} Saved`,
      dotColor: 'bg-amber-500',
      activeBorder: 'border-amber-500'
    },
    {
      id: 'SAFE' as FilterCategory,
      title: 'Cover Safe',
      count: aggs.safeCount,
      metric: 'Buffer Secure',
      dotColor: 'bg-emerald-500',
      activeBorder: 'border-emerald-500'
    },
    {
      id: 'OVERSTOCKED' as FilterCategory,
      title: 'Overstocked',
      count: aggs.overstockedCount,
      metric: `\$${Math.round(aggs.overstockedCapital).toLocaleString()} Tied`,
      dotColor: 'bg-slate-400',
      activeBorder: 'border-slate-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-3 select-none">
      {cards.map((c) => {
        const isSelected = activeFilter === c.id;

        return (
          <div
            key={c.id}
            onClick={() => onFilterChange(isSelected ? 'ALL' : c.id)}
            className={`bg-white border rounded-lg p-2.5 transition-all cursor-pointer shadow-2xs ${
              isSelected 
                ? `ring-2 ring-slate-800 ${c.activeBorder} bg-slate-50` 
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1">
              <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wider">
                <span className={`w-2 h-2 rounded-full ${c.dotColor}`} />
                {c.title}
              </span>
              {isSelected && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-white font-mono">
                  FILTERED
                </span>
              )}
            </div>

            <div className="flex items-baseline justify-between font-mono">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900 tabular-nums">
                  {c.count}
                </span>
                <span className="text-xs text-slate-500 font-medium">SKUs</span>
              </div>
              <span className="text-xs font-semibold text-slate-700 tabular-nums">
                {c.metric}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
