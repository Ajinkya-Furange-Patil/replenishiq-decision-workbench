import React, { useRef } from 'react';
import { 
  Building2, 
  Clock, 
  Upload, 
  Download, 
  RotateCcw, 
  BookOpen,
  Database
} from 'lucide-react';
import { LegalDocTab } from './LegalDocsModal';

interface HeaderProps {
  onReset: () => void;
  onFileUpload: (file: File) => void;
  onExportCsv: () => void;
  onOpenDoc: (tab: LegalDocTab) => void;
  totalSkus: number;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  onFileUpload,
  onExportCsv,
  onOpenDoc,
  totalSkus
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      e.target.value = '';
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 select-none print:hidden">
      {/* Clean, Unified Single-Row Corporate Header */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand & Core Context */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-bold text-white tracking-tight font-sans">
              REPLENISH<span className="text-blue-400">·IQ</span>
            </h1>
            <span className="text-slate-600 text-xs hidden sm:inline">/</span>
            <span className="text-xs text-slate-300 font-medium hidden sm:inline">
              Retail Replenishment Workbench
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-amber-300 font-semibold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 ml-1">
              <Clock className="w-3 h-3 text-amber-400" />
              PO Cutoff: Fri 15:00 PT
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Catalog SKU Count */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
            <Database className="w-3 h-3 text-blue-400" />
            <span>{totalSkus} SKUs</span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            title="Import inventory CSV"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Import</span>
          </button>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => onOpenDoc('manual')}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            title="User Manual & SOP"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>Manual</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title="Reset to baseline"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
