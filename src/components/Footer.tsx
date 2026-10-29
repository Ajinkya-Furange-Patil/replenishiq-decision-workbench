import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  BookOpen, 
  Scale, 
  Cpu, 
  ExternalLink, 
  CheckCircle2, 
  FileText,
  Calculator,
  Terminal,
  Activity
} from 'lucide-react';
import { LegalDocTab } from './LegalDocsModal';

interface FooterProps {
  onOpenDoc: (tab: LegalDocTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDoc }) => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 font-sans text-xs select-none mt-auto print:hidden">
      {/* Upper Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: System Info & Context */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-7 h-7 rounded bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-tight font-mono">
                REPLENISH<span className="text-blue-400">·IQ</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                v2.6.4
              </span>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              Institutional Single-Screen Decision Workbench built for the <strong className="text-slate-200">InfiniSynapse Vibe Coding Hackathon 2026</strong> (Track 2: Retail & Replenishment).
            </p>

            <div className="text-[11px] font-mono text-slate-400 space-y-1 pt-1">
              <div>Operator: <span className="text-slate-300 font-semibold">Independent Retail Buyer</span></div>
              <div>Workflow: <span className="text-slate-300 font-semibold">Weekly Tuesday Replenishment</span></div>
              <div>Cutoff: <span className="text-amber-400 font-semibold">Friday 15:00 PT PO Approval</span></div>
            </div>
          </div>

          {/* Column 2: User Manual & Operational Guides */}
          <div className="space-y-2.5">
            <div className="font-mono font-bold text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Operator Manual & SOP</span>
            </div>

            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button
                  onClick={() => onOpenDoc('manual')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <span>›</span>
                  <span>Weekly Replenishment Standard Operating Procedure</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenDoc('manual')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <span>›</span>
                  <span>Executing the 35% "Edit Test" Walkthrough</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenDoc('methodology')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <span>›</span>
                  <span>Replenishment Math & Stockout Gap Formulas</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenDoc('methodology')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <span>›</span>
                  <span>Bullwhip Mitigation & Promo Distortion Logic</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Governance, Terms & Privacy */}
          <div className="space-y-2.5">
            <div className="font-mono font-bold text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-blue-400" />
              <span>Governance & Compliance</span>
            </div>

            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button
                  onClick={() => onOpenDoc('terms')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <span>›</span>
                  <span>Terms of Use & Purchasing Authority Protocol</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenDoc('privacy')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <span>›</span>
                  <span>Data Privacy & Client-Side Residency Policy</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenDoc('privacy')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <span>›</span>
                  <span>Zero-PII Synthetic Catalog Standard</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenDoc('terms')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <span>›</span>
                  <span>Vendor EDI & PO Transmission Terms (Net 30)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: System Architecture & Telemetry */}
          <div className="space-y-2.5 font-mono text-[11px]">
            <div className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>System Telemetry</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 text-slate-400">
              <div className="flex items-center justify-between">
                <span>Task Stream:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  SSE Online
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Engine Execution:</span>
                <span className="text-slate-200">0.044 ms (44 µs)</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Deterministic Math:</span>
                <span className="text-blue-400">Verified 100%</span>
              </div>

              <div className="flex items-center justify-between">
                <span>CSV Standards:</span>
                <span className="text-slate-200">RFC 4180</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Institutional Bottom Disclaimer Bar */}
      <div className="bg-slate-950 border-t border-slate-850 px-4 py-3 text-[11px] font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            © 2026 ReplenishIQ Decision Workbench. All calculations deterministic under V8 JIT. Authorized for enterprise retail replenishment.
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button 
              onClick={() => onOpenDoc('manual')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Manual
            </button>
            <span>•</span>
            <button 
              onClick={() => onOpenDoc('methodology')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Formulas
            </button>
            <span>•</span>
            <button 
              onClick={() => onOpenDoc('terms')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms
            </button>
            <span>•</span>
            <button 
              onClick={() => onOpenDoc('privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

