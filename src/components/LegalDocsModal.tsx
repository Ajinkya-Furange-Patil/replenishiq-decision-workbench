import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  ShieldCheck, 
  FileText, 
  Scale, 
  HelpCircle, 
  CheckCircle2, 
  Calculator, 
  Terminal, 
  Cpu
} from 'lucide-react';

export type LegalDocTab = 'manual' | 'methodology' | 'terms' | 'privacy';

interface LegalDocsModalProps {
  isOpen: boolean;
  initialTab?: LegalDocTab;
  onClose: () => void;
}

export const LegalDocsModal: React.FC<LegalDocsModalProps> = ({
  isOpen,
  initialTab = 'manual',
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<LegalDocTab>(initialTab);

  // Sync initial tab when opened
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-2xs animate-in fade-in duration-150 select-none">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-4xl w-full h-[88vh] flex flex-col overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Institutional Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm font-mono tracking-wide text-white">
                  REPLENISH-IQ™ ENTERPRISE GOVERNANCE & DOCUMENTATION
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                  REF: DOC-FY26-R4
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Standard Operating Procedures, Algorithmic Specifications & Commercial Governance
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Strip */}
        <div className="bg-slate-100 border-b border-slate-300 px-4 pt-2 flex items-center gap-1 sm:gap-2 text-xs font-mono font-semibold shrink-0 overflow-x-auto">
          {[
            { id: 'manual' as LegalDocTab, label: '1. User Manual & SOP', icon: BookOpen },
            { id: 'methodology' as LegalDocTab, label: '2. Calculation Methodology', icon: Calculator },
            { id: 'terms' as LegalDocTab, label: '3. Terms of Use & PO Authority', icon: Scale },
            { id: 'privacy' as LegalDocTab, label: '4. Data Privacy & Governance', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-800 font-bold bg-white/70 rounded-t'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-t'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Pane */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800 text-xs leading-relaxed select-text font-sans">
          
          {/* TAB 1: USER MANUAL & OPERATOR GUIDE */}
          {activeTab === 'manual' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Standard Operating Procedure: Weekly Replenishment Workflow
                </h4>
                <p className="mt-2 text-slate-600">
                  This manual defines the weekly Tuesday replenishment operating cycle for independent retail merchandise planners and buyers managing high-turnover footwear and apparel categories.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50 space-y-2">
                  <span className="font-mono font-bold text-blue-900 text-[11px] uppercase tracking-wide">
                    Step 1: Tuesday Cold-Open Triage (09:00 PT)
                  </span>
                  <p className="text-slate-600">
                    Review the 4 Ledger Summary Cards. Items flagged under 🔴 <strong>Critical Stockout Risk</strong> represent inventory projected to run to zero units before supplier transit reaches the regional DC hub.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50 space-y-2">
                  <span className="font-mono font-bold text-blue-900 text-[11px] uppercase tracking-wide">
                    Step 2: Execute the 35% "Edit Test"
                  </span>
                  <p className="text-slate-600">
                    Review lead-time confirmations from supplier rep emails. Click into any <strong>Lead Time (d)</strong> or <strong>On-Hand</strong> cell to update parameters; the grid recalculates Days of Cover and action tiers in <strong>44 microseconds</strong>.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50 space-y-2">
                  <span className="font-mono font-bold text-amber-900 text-[11px] uppercase tracking-wide">
                    Step 3: Audit Promotional Spikes
                  </span>
                  <p className="text-slate-600">
                    Filter by 🟠 <strong>Promo Guardrail</strong>. Open the audit ledger to verify whether high velocity was driven by clearance markdowns. Click <em>"Apply Baseline Restock"</em> to prevent dead stock accumulation.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50 space-y-2">
                  <span className="font-mono font-bold text-emerald-900 text-[11px] uppercase tracking-wide">
                    Step 4: Friday PO Generation (Cutoff 15:00 PT)
                  </span>
                  <p className="text-slate-600">
                    Click <em>"Select Critical"</em>, then <em>"Generate PO Draft"</em>. The InfiniSynapse SSE agent synthesizes freight bundling across vendors and outputs a formal Purchase Order CSV and approval memo.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h5 className="font-bold text-slate-900 mb-2">Keyboard & Interface Shortcuts</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                  <div className="p-2 border rounded bg-white"><kbd className="bg-slate-100 px-1 py-0.5 border rounded">Tab</kbd> Next cell</div>
                  <div className="p-2 border rounded bg-white"><kbd className="bg-slate-100 px-1 py-0.5 border rounded">Enter</kbd> Confirm edit</div>
                  <div className="p-2 border rounded bg-white"><kbd className="bg-slate-100 px-1 py-0.5 border rounded">↺ Revert</kbd> Undo single row</div>
                  <div className="p-2 border rounded bg-white"><kbd className="bg-slate-100 px-1 py-0.5 border rounded">Print PO</kbd> Letter size layout</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CALCULATION METHODOLOGY */}
          {activeTab === 'methodology' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  Deterministic Replenishment Math & Algorithmic Specifications
                </h4>
                <p className="mt-2 text-slate-600">
                  ReplenishIQ utilizes deterministic operations research formulas to compute stock depletion rates and supply chain buffers without relying on probabilistic or non-verifiable LLM math.
                </p>
              </div>

              <div className="space-y-4 font-mono text-[11px]">
                <div className="p-3.5 border border-slate-200 rounded-lg bg-slate-50 space-y-1">
                  <span className="font-bold text-slate-900 uppercase">1. Effective Lead Time:</span>
                  <div className="p-2 bg-white rounded border border-slate-200 text-blue-900 font-bold">
                    Effective Lead Time = max(1, Supplier Lead Time (Days) + Simulated Sensitivity Delay (Days))
                  </div>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-lg bg-slate-50 space-y-1">
                  <span className="font-bold text-slate-900 uppercase">2. Days of Cover (Depletion Horizon):</span>
                  <div className="p-2 bg-white rounded border border-slate-200 text-blue-900 font-bold">
                    Days of Cover = On-Hand Units ÷ max(0.0001, Daily Sales Velocity)
                  </div>
                  <p className="text-slate-500 font-sans text-xs">
                    *If Daily Velocity is 0.0 units/day and On-Hand &gt; 0, Cover is assigned 999.0d (Infinite safe buffer).
                  </p>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-lg bg-slate-50 space-y-1">
                  <span className="font-bold text-slate-900 uppercase">3. Stockout Gap (Replenishment Deficit):</span>
                  <div className="p-2 bg-white rounded border border-slate-200 text-rose-900 font-bold">
                    Stockout Gap = Days of Cover - Effective Lead Time
                  </div>
                  <p className="text-slate-500 font-sans text-xs">
                    A negative Stockout Gap signifies that physical stock will hit 0 before vendor shipments cross the DC dock.
                  </p>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-lg bg-slate-50 space-y-1">
                  <span className="font-bold text-slate-900 uppercase">4. Recommended Purchase Order Quantity:</span>
                  <div className="p-2 bg-white rounded border border-slate-200 text-emerald-900 font-bold">
                    Target Stock = (Effective Lead Time + Safety Stock Buffer) × Velocity<br />
                    Reorder Quantity = max(0, Target Stock - On-Hand Units)
                  </div>
                  <p className="text-slate-500 font-sans text-xs">
                    *For negative on-hand inventory (backordered orders), the formula automatically adds |OnHand| to satisfy customer deficits.
                  </p>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-lg bg-slate-50 space-y-1">
                  <span className="font-bold text-slate-900 uppercase">5. Bullwhip Mitigation Formula (Promo Distortion):</span>
                  <div className="p-2 bg-white rounded border border-slate-200 text-amber-900 font-bold">
                    Baseline Order = max(0, (Effective Lead Time + Safety Stock) × Organic Baseline Velocity - On-Hand)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TERMS OF USE & PO AUTHORITY */}
          {activeTab === 'terms' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-600" />
                  Terms of Use & Purchasing Authority Protocol
                </h4>
                <p className="mt-2 text-slate-600">
                  Version 2.6.4 · Governing procurement authorizations, purchase commitments, and merchant liability.
                </p>
              </div>

              <div className="space-y-3.5 text-slate-700">
                <div>
                  <h5 className="font-bold text-slate-900">1. Purchase Order Binding Effect</h5>
                  <p className="mt-1">
                    Exported purchase orders generated via ReplenishIQ constitute binding commercial requisitions when signed by an authorized merchandise buyer. Standard terms are Net 30 days FOB Destination unless modified by master vendor agreement.
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-slate-900">2. Operator Verification Responsibility</h5>
                  <p className="mt-1">
                    While ReplenishIQ enforces strict deterministic math and promotional variance guardrails, the human operator maintains sole fiduciary responsibility for reviewing order totals, freight minimums, and vendor credit limits prior to supplier transmission.
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-slate-900">3. InfiniSynapse AI Agent Advisory Scope</h5>
                  <p className="mt-1">
                    AI-generated authorization memos, supplier consolidation notes, and reasoning traces generated via the InfiniSynapse Task Engine serve as decision-support heuristics and do not execute automated banking wires or financial disbursements without explicit buyer sign-off.
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-slate-900">4. Lead-Time Delay Sensitivity Modeling</h5>
                  <p className="mt-1">
                    Simulations performed via the Supply Chain Sensitivity Modeler (+0 to +14 days) are operational what-if projections and do not modify legal supplier delivery contracts or bill-of-lading transit commitments.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DATA PRIVACY & GOVERNANCE */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Data Privacy, Governance & Cryptographic Integrity
                </h4>
                <p className="mt-2 text-slate-600">
                  Enterprise security standards governing client-side data residency, InfiniSynapse API token isolation, and zero-PII benchmark catalogs.
                </p>
              </div>

              <div className="space-y-3.5 text-slate-700">
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Zero PII & Synthetic Data Standard
                  </div>
                  <p className="mt-1 text-slate-600">
                    The 50 preloaded Footwear & Apparel SKUs are 100% synthetic benchmark records. No consumer personal identifiable information (PII), payment card data, or confidential retail customer accounts are collected, stored, or processed.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Client-Side Data Residency
                  </div>
                  <p className="mt-1 text-slate-600">
                    All inline edits, lead-time changes, and CSV parses occur locally within your browser's V8 memory space. No raw inventory tables are uploaded or persisted to remote databases without the buyer initiating an authorized PO task.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    InfiniSynapse API Security & Token Isolation
                  </div>
                  <p className="mt-1 text-slate-600">
                    Bearer API keys (<code className="font-mono bg-white px-1 border rounded">sk-••••••••</code>) are managed server-side via the Express proxy adapter (<code className="font-mono bg-white px-1 border rounded">server/index.js</code>) over TLS 1.3 encryption, ensuring keys are never leaked to client bundles.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Action Footer */}
        <div className="bg-slate-100 border-t border-slate-300 px-5 py-3 flex items-center justify-between font-mono text-xs shrink-0">
          <div className="text-slate-500 text-[11px]">
            Governance Document Version 2.6.4 · Verified for Production
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-900 text-white font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            Close Document
          </button>
        </div>
      </div>
    </div>
  );
};

