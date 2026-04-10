import React, { useState } from 'react';
import ProctoringGuard from '../components/live-call/ProctoringGuard';
import ViolationHistory from '../components/live-call/ViolationHistory';
import { ShieldCheck, Info, Play, RefreshCw } from 'lucide-react';

export default function ProctoringDemo() {
  const [violations, setViolations] = useState([]);
  const [isStarted, setIsStarted] = useState(false);

  const handleViolation = (v) => {
    setViolations(prev => [v, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-dm selection:bg-emerald-500/30">
      {/* ProctoringGuard is the main component we are testing */}
      <ProctoringGuard isEnabled={isStarted} onViolation={handleViolation} />

      <div className="max-w-5xl mx-auto px-6 py-20">
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
              Security Playground
            </div>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          <h1 className="text-5xl font-syne font-black tracking-tight mb-4">
            Proctoring <span className="text-emerald-500">Guard</span>
          </h1>
          <p className="text-zinc-500 max-w-2xl leading-relaxed">
            Test the advanced interview integrity system. Once activated, the guard will monitor for tab switching, 
            window focus loss, and developer tool access.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Controls & Instructions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-8 rounded-[32px] border border-white/5 bg-zinc-900/20 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Play size={20} className="text-emerald-500" />
                Control Panel
              </h3>
              
              {!isStarted ? (
                <div className="space-y-6">
                  <p className="text-zinc-400 text-sm">
                    Click the button below to start the security session. You will be prompted to go 
                    <span className="text-white font-bold"> Fullscreen</span>.
                  </p>
                  <button 
                    onClick={() => setIsStarted(true)}
                    className="group relative w-full py-5 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-widest overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative z-10 group-hover:text-black">Initiate Secure Session</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <ShieldCheck className="text-emerald-500" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Security Active</p>
                      <p className="text-[11px] text-emerald-500/70">Monitoring all browser events</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase mb-2">How to trigger violations</p>
                      <ul className="text-xs text-zinc-400 space-y-2 list-disc pl-4">
                        <li>Switch to another tab</li>
                        <li>Click outside the browser</li>
                        <li>Exit Fullscreen (Press Esc)</li>
                        <li>Open DevTools (F12)</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col justify-center items-center">
                      <button 
                        onClick={() => setIsStarted(false)}
                        className="text-xs text-zinc-500 hover:text-white transition-colors"
                      >
                        Stop Session
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 rounded-[32px] border border-white/5 bg-zinc-900/20">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Info size={20} className="text-blue-500" />
                Technical Features
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: 'Tab Visibility', desc: 'Detects visibilitychange events' },
                  { title: 'Window Focus', desc: 'Monitors blur/focus state' },
                  { title: 'Fullscreen Lock', desc: 'Enforces persistent fullscreen' },
                  { title: 'Audio Alerts', desc: 'Synthesized voice warnings' },
                  { title: 'DevTools Hook', desc: 'Blocks F12 and Ctrl+Shift+I' },
                  { title: 'Mouse Trap', desc: 'Uses Pointer Lock API' },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-sm font-bold text-white">{item.title}</p>
                    <p className="text-[11px] text-zinc-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: History Log */}
          <div className="lg:col-span-1">
            <div className="h-full min-h-[400px] p-6 rounded-[32px] border border-white/5 bg-[#0a0a0a] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Integrity Log</h3>
                <button 
                  onClick={() => setViolations([])}
                  className="p-2 rounded-lg hover:bg-white/5 text-zinc-600 hover:text-white transition-colors"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
              
              <div className="flex-1">
                <ViolationHistory violations={violations} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
