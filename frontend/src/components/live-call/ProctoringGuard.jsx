import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ShieldAlert, Maximize, AlertTriangle, Fingerprint, Lock, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ProctoringGuard.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * A modular component that monitors for cheating behavior:
 * - Tab switching (visibilitychange)
 * - Window focus loss (blur)
 * - DevTools usage (keyboard hooks)
 * - Fullscreen status
 * - Context menu and copy/paste restrictions
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default function ProctoringGuard({ isEnabled = false, onViolation }) {
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [lastViolationTime, setLastViolationTime] = useState(null);
  
  const violationRef = useRef(0);

  // ── Audio Alert System ───────────────────────────────────────────────────
  const speakViolation = useCallback((msg) => {
    if (!isEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // clear queue
    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.rate = 0.9;
    utterance.pitch = 0.8;
    window.speechSynthesis.speak(utterance);
  }, [isEnabled]);

  // ── Handle Violations ──────────────────────────────────────────────────────
  const reportViolation = useCallback((type) => {
    if (!isEnabled) return;

    setViolationCount(prev => {
      const next = prev + 1;
      violationRef.current = next;
      return next;
    });
    setLastViolationTime(Date.now());
    
    // Audible warning for strict deterrence
    if (type === 'FOCUS_LOST' || type === 'TAB_SWITCHED' || type === 'MOUSE_EXIT') {
      speakViolation("Security Violation Detected. Return to the interview immediately.");
    }
    
    if (onViolation) {
      onViolation({
        type,
        timestamp: new Date().toLocaleTimeString(),
        id: Math.random().toString(36).substr(2, 9)
      });
    }
  }, [isEnabled, onViolation, speakViolation]);

  // ── Event Handlers ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isEnabled) return;

    // 1. Tab Visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsTabVisible(false);
        reportViolation('TAB_SWITCHED');
      } else {
        setIsTabVisible(true);
      }
    };

    // 2. Window Focus/Blur (detects switching to other apps)
    const handleBlur = () => {
      setIsWindowFocused(false);
      reportViolation('FOCUS_LOST');
    };
    const handleFocus = () => {
      setIsWindowFocused(true);
    };

    // 3. Fullscreen Status
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement) {
        reportViolation('FULLSCREEN_EXIT');
      }
    };

    // 4. Keyboard Hook (Prevent DevTools, etc.)
    const handleKeyDown = (e) => {
      // F12
      if (e.keyCode === 123) {
        e.preventDefault();
        reportViolation('DEVTOOLS_ATTEMPT');
        return false;
      }
      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S
      if (e.ctrlKey && (e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83))) {
        e.preventDefault();
        reportViolation('RESTRICTED_SHORTCUT');
        return false;
      }
    };

    // 5. Context Menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      reportViolation('RIGHT_CLICK');
      return false;
    };

    // 6. Copy/Paste
    const handleCopy = (e) => {
      e.preventDefault();
      reportViolation('COPY_ATTEMPT');
      return false;
    };
    const handlePaste = (e) => {
      e.preventDefault();
      reportViolation('PASTE_ATTEMPT');
      return false;
    };

    // 7. Cursor boundary detection (Essential for multi-monitor)
    const handleMouseLeave = () => {
      if (isFullscreen) {
        reportViolation('MOUSE_EXIT');
      }
    };

    // 8. Pointer Lock (Mouse Trap)
    const handlePointerLockChange = () => {
      if (isFullscreen && !document.pointerLockElement) {
        // Lost pointer lock while in fullscreen = violation
        reportViolation('POINTER_LOCK_LOST');
      }
    };

    // 9. Heartbeat Focus Integrity Check
    const heartbeat = setInterval(() => {
      if (!document.hasFocus() && isEnabled) {
        setIsWindowFocused(false);
        // Don't report violation here to avoid spam, just ensure state is correct
      }
    }, 500);

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [isEnabled, reportViolation, isFullscreen]);

  // ── Render Overlay ─────────────────────────────────────────────────────────
  if (!isEnabled) return null;

  const showFocusWarning = !isTabVisible || !isWindowFocused;
  const showFullscreenWarning = !isFullscreen;

  return (
    <>
      <AnimatePresence>
        {(showFocusWarning || showFullscreenWarning) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black backdrop-blur-3xl"
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="max-w-md w-full p-10 rounded-[40px] border border-white/10 bg-[#080808] shadow-[0_0_100px_rgba(52,211,153,0.1)] flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
                <Lock className="text-emerald-500 relative z-10" size={36} />
              </div>
              
              <h2 className="font-syne text-3xl font-bold text-white mb-4 tracking-tight">
                {showFocusWarning ? 'Security Protocol Triggered' : 'Fullscreen Required'}
              </h2>
              
              <p className="text-slate-400 text-sm leading-relaxed mb-10 px-4">
                {showFocusWarning 
                  ? "Interview integrity protocols detected a focus loss. All actions are currently suspended. Please return to this window to resume."
                  : "To prevent cheating and maintain interview standards, this session must be conducted in Fullscreen mode."}
              </p>
              
              <div className="w-full flex flex-col gap-3">
                <button 
                  onClick={() => {
                    if (!isFullscreen) {
                      document.documentElement.requestFullscreen()
                        .then(() => {
                           // Once in fullscreen, trap the mouse
                           if (document.documentElement.requestPointerLock) {
                             document.documentElement.requestPointerLock();
                           }
                        })
                        .catch(err => {
                          console.error('Fullscreen/Lock request failed:', err);
                        });
                    } else if (document.documentElement.requestPointerLock) {
                      document.documentElement.requestPointerLock();
                    }
                    window.focus();
                  }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_8px_20px_-4px_rgba(16,185,129,0.4)]"
                >
                  {isFullscreen ? 'Re-engage Security Lock' : 'Activate Secure Interview Mode'}
                </button>
                
                <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-zinc-600 font-bold uppercase tracking-tight">
                  <ShieldAlert size={10} className="text-emerald-500/50" />
                  <span>Verified Security Session Active</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Violation Badge */}
      <div className="fixed bottom-6 left-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md shadow-2xl pointer-events-none">
        <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
          <Fingerprint size={16} className="text-orange-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider leading-none mb-1">Security Status</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-dm font-bold text-white">Active Proctoring</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
        {violationCount > 0 && (
          <div className="ml-4 pl-4 border-l border-white/5 flex flex-col">
             <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider leading-none mb-1">Violations</span>
             <span className="text-xs font-dm font-black text-red-500">{violationCount.toString().padStart(2, '0')}</span>
          </div>
        )}
      </div>
    </>
  );
}
