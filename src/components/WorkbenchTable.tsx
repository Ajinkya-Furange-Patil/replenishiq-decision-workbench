import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  AlertOctagon, 
  ShieldAlert, 
  CheckCircle2, 
  Package, 
  Edit3, 
  X, 
  RotateCcw, 
  Check,
  FileSpreadsheet
} from 'lucide-react';
import { InventoryRow, FilterCategory } from '../types/inventory';

interface WorkbenchTableProps {
  rows: InventoryRow[];
  initialRows: InventoryRow[];
  delayDays: number;
  activeFilter: FilterCategory;
  onFilterChange: (filter: FilterCategory) => void;
  onUpdateItem: (skuId: string, field: 'supplierLeadTimeDays' | 'onHandUnits' | 'dailySalesVelocity', value: number) => void;
  onRevertItem: (skuId: string) => void;
  onOpenPromoModal: (row: InventoryRow) => void;
  selectedSkuIds: Set<string>;
  onToggleSelect: (skuId: string) => void;
  onSelectAllCritical: () => void;
  onClearSelection: () => void;
  onGeneratePo: () => void;
}

type SortField = 'stockoutGapDays' | 'daysOfCover' | 'supplierLeadTimeDays' | 'onHandUnits' | 'dailySalesVelocity' | 'reorderQuantity';

export const WorkbenchTable: React.FC<WorkbenchTableProps> = ({
  rows,
  initialRows,
  delayDays,
  activeFilter,
  onFilterChange,
  onUpdateItem,
  onRevertItem,
  onOpenPromoModal,
  selectedSkuIds,
  onToggleSelect,
  onSelectAllCritical,
  onClearSelection,
  onGeneratePo
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('stockoutGapDays');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Initial row lookup to detect modified rows
  const initialMap = useMemo(() => {
    const map = new Map<string, { leadTime: number; onHand: number; velocity: number }>();
    initialRows.forEach(r => map.set(r.id, {
      leadTime: r.supplierLeadTimeDays,
      onHand: r.onHandUnits,
      velocity: r.dailySalesVelocity
    }));
    return map;
  }, [initialRows]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'stockoutGapDays' || field === 'daysOfCover' ? 'asc' : 'desc');
    }
  };

  // Filter & Search
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (activeFilter === 'CRITICAL' && r.status !== 'REORDER_NOW') return false;
      if (activeFilter === 'PROMO_DISTORTED' && r.status !== 'WATCH_PROMO') return false;
      if (activeFilter === 'SAFE' && r.status !== 'COVER_SAFE') return false;
      if (activeFilter === 'OVERSTOCKED' && r.status !== 'HOLD_OVERSTOCKED') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          r.id.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.supplier.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.hub.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [rows, activeFilter, searchQuery]);

  // Sorted rows
  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRows, sortField, sortOrder]);

  const criticalCount = rows.filter(r => r.status === 'REORDER_NOW').length;
  const promoCount = rows.filter(r => r.status === 'WATCH_PROMO').length;

  const totalFilteredUnits = sortedRows.reduce((a, b) => a + (b.isPromoSpike && b.recommendedBaselineOrder ? b.recommendedBaselineOrder : b.reorderQuantity), 0);
  const totalFilteredCost = sortedRows.reduce((a, b) => a + ((b.isPromoSpike && b.recommendedBaselineOrder ? b.recommendedBaselineOrder : b.reorderQuantity) * b.unitCost), 0);

  const handleKeyDownPositive = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
      e.preventDefault();
    }
  };

  // Always enable Generate PO button: if none selected, clicking it will automatically select all critical items!
  const effectiveSelectedCount = selectedSkuIds.size > 0 ? selectedSkuIds.size : (criticalCount + promoCount);

  return (
    <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden mb-6 font-sans">
      {/* Streamlined Control Toolbar (Single Row on Desktop) */}
      <div className="bg-slate-50 border-b border-slate-300 p-2.5 flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Search & Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative w-48 sm:w-56 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SKU, name, vendor..."
              className="w-full pl-7 pr-6 py-1 text-xs rounded bg-white border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-700 text-slate-900 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'ALL' as FilterCategory, label: 'All', count: rows.length },
              { id: 'CRITICAL' as FilterCategory, label: 'Critical', count: criticalCount, dot: 'bg-rose-600' },
              { id: 'PROMO_DISTORTED' as FilterCategory, label: 'Promo', count: promoCount, dot: 'bg-amber-600' },
              { id: 'SAFE' as FilterCategory, label: 'Safe', count: rows.filter(r => r.status === 'COVER_SAFE').length, dot: 'bg-emerald-600' },
              { id: 'OVERSTOCKED' as FilterCategory, label: 'Overstock', count: rows.filter(r => r.status === 'HOLD_OVERSTOCKED').length, dot: 'bg-slate-400' },
            ].map(tab => {
              const active = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onFilterChange(tab.id)}
                  className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                    active
                      ? 'bg-slate-800 text-white shadow-2xs'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {tab.dot && <span className={`w-1.5 h-1.5 rounded-full ${tab.dot}`} />}
                  <span>{tab.label}</span>
                  <span className={`px-1 py-0.2 rounded text-[10px] font-mono ${
                    active ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onSelectAllCritical}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Check className="w-3 h-3 text-slate-600" />
            <span>Select Critical ({criticalCount + promoCount})</span>
          </button>

          {selectedSkuIds.size > 0 && (
            <button
              onClick={onClearSelection}
              className="px-2 py-1 text-xs font-medium rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Clear ({selectedSkuIds.size})
            </button>
          )}

          {/* ALWAYS-ENABLED GENERATE PO BUTTON */}
          <button
            onClick={onGeneratePo}
            className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all shadow-2xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-[0.98]"
            title={selectedSkuIds.size > 0 ? `Generate PO for ${selectedSkuIds.size} selected lines` : `Click to auto-select and draft PO for all ${criticalCount + promoCount} critical lines`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-200" />
            <span>
              Generate PO Draft ({selectedSkuIds.size > 0 ? `${selectedSkuIds.size}` : `${criticalCount + promoCount}`})
            </span>
          </button>
        </div>
      </div>

      {/* FIXED-LAYOUT DATA GRID (Prevents all horizontal and vertical layout shifts) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border-b border-slate-200 table-fixed min-w-[1020px]">
          {/* Explicit Fixed Column Sizing */}
          <colgroup>
            <col style={{ width: '40px' }} />
            <col style={{ width: '44px' }} />
            <col style={{ width: '230px' }} />
            <col style={{ width: '130px' }} />
            <col style={{ width: '82px' }} />
            <col style={{ width: '82px' }} />
            <col style={{ width: '96px' }} />
            <col style={{ width: '105px' }} />
            <col style={{ width: '84px' }} />
            <col style={{ width: '170px' }} />
            <col style={{ width: '105px' }} />
          </colgroup>

          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-[11px] font-bold text-slate-700 uppercase tracking-wider select-none font-mono h-9">
              <th className="px-2 text-center border-r border-slate-300">
                <input
                  type="checkbox"
                  checked={selectedSkuIds.size === filteredRows.length && filteredRows.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      filteredRows.forEach(r => selectedSkuIds.add(r.id));
                    } else {
                      onClearSelection();
                    }
                  }}
                  className="rounded border-slate-400 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="px-2 border-r border-slate-300 text-center text-slate-500">
                LN
              </th>
              <th className="px-3 border-r border-slate-300">
                SKU & Description
              </th>
              <th className="px-3 border-r border-slate-300">
                Vendor / Hub
              </th>
              <th 
                onClick={() => handleSort('onHandUnits')}
                className="px-2.5 border-r border-slate-300 cursor-pointer hover:bg-slate-200 text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>On-Hand</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('dailySalesVelocity')}
                className="px-2.5 border-r border-slate-300 cursor-pointer hover:bg-slate-200 text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Rate</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('supplierLeadTimeDays')}
                className="px-2.5 border-r border-slate-300 cursor-pointer bg-blue-100/70 hover:bg-blue-100 text-blue-900 text-right"
                title="THE EDIT TEST: Click to modify lead time in days"
              >
                <div className="flex items-center justify-end gap-1 font-bold">
                  <span>Lead Time</span>
                  <Edit3 className="w-3 h-3 text-blue-700" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('daysOfCover')}
                className="px-2.5 border-r border-slate-300 cursor-pointer hover:bg-slate-200"
              >
                <div className="flex items-center gap-1">
                  <span>Cover</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('stockoutGapDays')}
                className="px-2 border-r border-slate-300 cursor-pointer hover:bg-slate-200 text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Gap (d)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="px-3 border-r border-slate-300">
                Procurement Decision
              </th>
              <th 
                onClick={() => handleSort('reorderQuantity')}
                className="px-3 cursor-pointer hover:bg-slate-200 text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Order Req</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 text-xs">
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400">
                  <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <div className="font-semibold text-slate-700">No SKUs matching active filter or search query</div>
                  <p className="text-xs text-slate-400 mt-0.5">Clear search filters to restore full 50-SKU catalog view</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      onFilterChange('ALL');
                    }}
                    className="mt-3 px-3 py-1 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
                  >
                    Reset Grid Filters
                  </button>
                </td>
              </tr>
            ) : (
              sortedRows.map((row, idx) => {
                const isSelected = selectedSkuIds.has(row.id);
                const isReorder = row.status === 'REORDER_NOW';
                const isPromo = row.status === 'WATCH_PROMO';
                const isSafe = row.status === 'COVER_SAFE';
                const isOverstocked = row.status === 'HOLD_OVERSTOCKED';

                const init = initialMap.get(row.id);
                const isModified = init && (
                  init.leadTime !== row.supplierLeadTimeDays ||
                  init.onHand !== row.onHandUnits ||
                  init.velocity !== row.dailySalesVelocity
                );

                return (
                  <tr 
                    key={row.id}
                    className={`transition-colors even:bg-slate-50/50 hover:bg-blue-50/40 h-[52px] ${
                      isSelected ? 'bg-blue-50/80 font-medium' : ''
                    } ${isReorder ? 'bg-rose-50/30' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="px-2 text-center border-r border-slate-200/80">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(row.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* Line # */}
                    <td className="px-2 text-center border-r border-slate-200/80 font-mono text-[11px] text-slate-400">
                      {idx + 1}
                    </td>

                    {/* SKU & Name (Truncated with stable height) */}
                    <td className="px-3 border-r border-slate-200/80">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-900 leading-tight">
                        <span>{row.id}</span>
                        {isModified && (
                          <button
                            onClick={() => onRevertItem(row.id)}
                            className="p-0.5 text-blue-600 hover:text-blue-800"
                            title="Revert modified row to baseline"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </button>
                        )}
                        <span className="px-1 py-0.2 rounded text-[9px] font-sans font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          {row.category}
                        </span>
                      </div>
                      <div className="text-slate-800 font-medium truncate mt-0.5 leading-tight" title={row.name}>
                        {row.name}
                      </div>
                    </td>

                    {/* Vendor & Hub */}
                    <td className="px-3 border-r border-slate-200/80 text-[11px] text-slate-600">
                      <div className="truncate font-medium text-slate-800 leading-tight">{row.supplier}</div>
                      <div className="text-slate-400 font-mono text-[10px] mt-0.5 leading-tight">{row.hub}</div>
                    </td>

                    {/* On-Hand (Inline Spreadsheet Cell) */}
                    <td className="px-2 text-right border-r border-slate-200/80">
                      <input
                        type="number"
                        min="0"
                        max="999999"
                        value={row.onHandUnits}
                        onKeyDown={handleKeyDownPositive}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                          onUpdateItem(row.id, 'onHandUnits', isNaN(val) ? 0 : Math.max(0, val));
                        }}
                        className="w-16 text-right font-mono font-bold text-slate-900 bg-white hover:bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded px-1.5 py-0.5 text-xs focus:outline-none transition-colors tabular-nums"
                        title="Click to edit on-hand units"
                      />
                    </td>

                    {/* Daily Sales Velocity (Inline Spreadsheet Cell) */}
                    <td className="px-2 text-right border-r border-slate-200/80">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="9999"
                        value={row.dailySalesVelocity}
                        onKeyDown={handleKeyDownPositive}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                          onUpdateItem(row.id, 'dailySalesVelocity', isNaN(val) ? 0 : Math.max(0, val));
                        }}
                        className="w-16 text-right font-mono font-bold text-slate-900 bg-white hover:bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded px-1.5 py-0.5 text-xs focus:outline-none transition-colors tabular-nums"
                        title="Click to edit daily sales rate"
                      />
                    </td>

                    {/* Supplier Lead Time (THE 35% EDIT TEST) */}
                    <td className="px-2 text-right border-r border-slate-200/80 bg-blue-50/40">
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={row.supplierLeadTimeDays}
                          onKeyDown={handleKeyDownPositive}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 1 : parseInt(e.target.value, 10);
                            onUpdateItem(row.id, 'supplierLeadTimeDays', isNaN(val) ? 1 : Math.min(365, Math.max(1, val)));
                          }}
                          className="w-13 text-right font-mono font-extrabold text-blue-900 bg-white hover:bg-blue-50 focus:bg-white border border-blue-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-600/30 rounded px-1.5 py-0.5 text-xs focus:outline-none transition-colors tabular-nums shadow-2xs"
                          title="THE EDIT TEST: Modify lead time to test live stockout recalculation"
                        />
                        {delayDays > 0 && (
                          <span className="text-[10px] font-mono text-indigo-700 font-bold shrink-0" title={`Effective: ${row.effectiveLeadTime}d (+${delayDays}d delay)`}>
                            +{delayDays}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Days of Cover */}
                    <td className="px-2.5 border-r border-slate-200/80">
                      <div className="flex items-baseline justify-between font-mono leading-tight">
                        <span className="font-bold text-slate-900 tabular-nums">
                          {row.daysOfCover >= 999 ? '∞ Safe' : `${row.daysOfCover.toFixed(1)}d`}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          /{row.effectiveLeadTime}d
                        </span>
                      </div>
                      <div className="w-full h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full ${
                            isReorder ? 'bg-rose-600' : isPromo ? 'bg-amber-500' : isOverstocked ? 'bg-slate-400' : 'bg-emerald-600'
                          }`}
                          style={{
                            width: `${Math.min(100, Math.max(5, (row.daysOfCover / Math.max(1, row.effectiveLeadTime * 2)) * 100))}%`
                          }}
                        />
                      </div>
                    </td>

                    {/* Stockout Gap */}
                    <td className="px-2 text-center border-r border-slate-200/80 font-mono tabular-nums">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
                        row.stockoutGapDays < 0
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : row.stockoutGapDays < 5
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {row.stockoutGapDays > 0 ? `+${row.stockoutGapDays.toFixed(1)}d` : `${row.stockoutGapDays.toFixed(1)}d`}
                      </span>
                    </td>

                    {/* Decision Badge */}
                    <td className="px-3 border-r border-slate-200/80">
                      {isReorder && (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-700 text-white font-mono uppercase tracking-wide">
                            <AlertOctagon className="w-3 h-3" />
                            REORDER NOW
                          </span>
                          <div className="text-[10px] text-slate-500 truncate" title={row.reasonCode}>
                            Gap: {row.stockoutGapDays.toFixed(1)}d before arrival
                          </div>
                        </div>
                      )}

                      {isPromo && (
                        <div className="space-y-0.5">
                          <button
                            onClick={() => onOpenPromoModal(row)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white font-mono uppercase tracking-wide transition-colors cursor-pointer"
                            title="Click to view promo distortion audit"
                          >
                            <ShieldAlert className="w-3 h-3" />
                            PROMO SPIKE
                          </button>
                          <div className="text-[10px] text-amber-800 font-medium truncate" title={row.reasonCode}>
                            Click for baseline restock
                          </div>
                        </div>
                      )}

                      {isSafe && (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono uppercase">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            COVER SAFE
                          </span>
                          <div className="text-[10px] text-slate-400 truncate">
                            Adequate buffer
                          </div>
                        </div>
                      )}

                      {isOverstocked && (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-300 font-mono uppercase">
                            OVERSTOCKED
                          </span>
                          <div className="text-[10px] text-slate-400 truncate">
                            {row.daysOfCover >= 999 ? 'Zero velocity' : `${row.daysOfCover.toFixed(0)}d cover (>45d cap)`}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Order Req */}
                    <td className="px-3 text-right">
                      {row.reorderQuantity > 0 ? (
                        <div className="font-mono tabular-nums leading-tight">
                          <div className="font-extrabold text-slate-900">
                            {row.isPromoSpike && row.recommendedBaselineOrder
                              ? `${row.recommendedBaselineOrder} units`
                              : `${row.reorderQuantity} units`}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            ${(
                              (row.isPromoSpike && row.recommendedBaselineOrder
                                ? row.recommendedBaselineOrder
                                : row.reorderQuantity) * row.unitCost
                            ).toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Grid Footer Statistics Strip */}
      <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-300 flex flex-wrap items-center justify-between text-xs text-slate-600 font-mono">
        <div className="flex items-center gap-4">
          <span>Showing <strong>{sortedRows.length}</strong> of {rows.length} Total SKUs</span>
          <span className="text-slate-300">|</span>
          <span>Selected: <strong className="text-blue-700">{selectedSkuIds.size} lines</strong></span>
        </div>

        <div className="flex items-center gap-4">
          <span>Total Units: <strong className="text-slate-900">{totalFilteredUnits.toLocaleString()} units</strong></span>
          <span className="text-slate-300">|</span>
          <span>Commitment: <strong className="text-emerald-700 font-bold">${totalFilteredCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
        </div>
      </div>
    </div>
  );
};
