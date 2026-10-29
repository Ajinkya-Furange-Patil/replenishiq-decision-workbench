import React from 'react';
import { SlidersHorizontal, AlertTriangle } from 'lucide-react';

interface SensitivitySliderProps {
  delayDays: number;
  onDelayChange: (days: number) => void;
  criticalCount: number;
  baselineCriticalCount: number;
}

export const SensitivitySlider: React.FC<SensitivitySliderProps> = ({
  delayDays,
  onDelayChange,
  criticalCount,
  baselineCriticalCount
}) => {
  const presets = [
    { value: 0, label: '0d Baseline' },
    { value: 3, label: '+3d Customs' },
    { value: 7, label: '+7d Port Delay' },
    { value: 14, label: '+14d Global Shock' },
  ];

  const flippedCount = Math.max(0, criticalCount - baselineCriticalCount);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 mb-3 text-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-mono select-none shadow-2xs">
      {/* Left: Label & Inline Slider */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-bold text-slate-200">
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
          <span>Lead-Time Stress:</span>
          <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold tabular-nums">
            +{delayDays}d Delay
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="14"
          step="1"
          value={delayDays}
          onChange={(e) => onDelayChange(parseInt(e.target.value, 10))}
          className="w-24 sm:w-32 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          title={`Simulate +${delayDays} days vendor lead-time delay`}
        />
      </div>

      {/* Center: Clean Preset Buttons */}
      <div className="flex items-center gap-1.5">
        {presets.map((p) => {
          const isActive = delayDays === p.value;
          return (
            <button
              key={p.value}
              onClick={() => onDelayChange(p.value)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750 border border-slate-700/60'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Right: Live Impact Counter */}
      <div className="flex items-center gap-1.5">
        <span className="text-slate-400 text-[11px]">Impact:</span>
        <span className="font-bold text-rose-400 bg-rose-950/70 border border-rose-800/80 px-2 py-0.5 rounded text-[11px] flex items-center gap-1 tabular-nums">
          <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
          {criticalCount} Critical SKUs
          {flippedCount > 0 && (
            <span className="text-rose-300 font-normal">
              (+{flippedCount} flipped)
            </span>
          )}
        </span>
      </div>
    </div>
  );
};
