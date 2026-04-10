import React from 'react';
import { AlertCircle, Clock, Trash2 } from 'lucide-react';

/**
 * ViolationHistory.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * A widget to display the log of proctoring violations.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default function ViolationHistory({ violations = [], onClear }) {
  if (violations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 px-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
          <AlertCircle size={18} className="text-emerald-500" />
        </div>
        <p className="text-[11px] text-emerald-500 font-bold uppercase tracking-wider">No Violations</p>
        <p className="text-[10px] text-zinc-500 mt-1">Integrity maintained</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Incident Log</p>
        {onClear && (
          <button 
            onClick={onClear}
            className="text-[9px] text-zinc-600 hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <Trash2 size={10} />
            CLEAR
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
        {violations.map((v) => (
          <div 
            key={v.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10"
          >
            <div className="shrink-0 w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center mt-0.5">
              <AlertCircle size={12} className="text-red-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-[11px] font-bold text-red-500 leading-none mb-1">
                {v.type?.replace('_', ' ')}
              </p>
              <div className="flex items-center gap-1 text-[9px] text-zinc-500">
                <Clock size={8} />
                <span>{v.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
