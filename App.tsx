
import React, { useState, useEffect, useRef } from 'react';
import { CalculationMode, CalculationResult } from './types';

const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
);

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);

const App: React.FC = () => {
  const [darkMode] = useState(true);
  const [mode, setMode] = useState<CalculationMode>(CalculationMode.SP1);
  const [point, setPoint] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const [history, setHistory] = useState<CalculationResult[]>([]);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load history from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('trading_calc_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed.map((item: any) => ({ ...item, timestamp: new Date(item.timestamp) })));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
    // Auto focus input
    inputRef.current?.focus();
  }, []);

  // Save history to LocalStorage
  useEffect(() => {
    localStorage.setItem('trading_calc_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const calculate = () => {
    const p = parseFloat(point);
    if (isNaN(p) || p === 0) return;

    let calculatedValue: number;
    if (mode === CalculationMode.SP1) {
      calculatedValue = 500 / (p * 102);
    } else {
      calculatedValue = 500 / (p * 79.52);
    }

    setResult(calculatedValue);
    
    const newResult: CalculationResult = {
      mode,
      point: p,
      result: calculatedValue,
      timestamp: new Date()
    };
    setHistory(prev => [newResult, ...prev].slice(0, 10));
    setCopied(false);
  };

  const handleCopy = () => {
    if (result === null) return;
    navigator.clipboard.writeText(result.toFixed(1));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      calculate();
    }
  };

  const clearHistory = () => {
    if (window.confirm("Clear all recent activity?")) {
      setHistory([]);
      localStorage.removeItem('trading_calc_history');
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 md:p-8 space-y-8 bg-slate-100 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between sticky top-0 z-50 py-6 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center group">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase select-none">
            Trading
          </h1>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="w-full max-w-md grid grid-cols-1 gap-6">
        {/* Calculator UI */}
        <section className="bg-white dark:bg-slate-900/50 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-white/5 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
              <button
                onClick={() => { setMode(CalculationMode.SP1); setResult(null); }}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                  mode === CalculationMode.SP1
                    ? 'bg-white dark:bg-slate-800 shadow-lg text-indigo-600 dark:text-indigo-400 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                SP1!
              </button>
              <button
                onClick={() => { setMode(CalculationMode.NQ1); setResult(null); }}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                  mode === CalculationMode.NQ1
                    ? 'bg-white dark:bg-slate-800 shadow-lg text-indigo-600 dark:text-indigo-400 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                NQ1!
              </button>
            </div>

            <div className="space-y-3">
              <label htmlFor="points" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1">
                Point Input
              </label>
              <div className="relative group">
                <input
                  ref={inputRef}
                  id="points"
                  type="number"
                  inputMode="decimal"
                  value={point}
                  onChange={(e) => setPoint(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="0.00"
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-transparent rounded-2xl py-5 px-6 text-3xl font-black text-slate-900 dark:text-white focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none tabular-nums"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                  PTS
                </div>
              </div>
            </div>

            <button
              onClick={calculate}
              disabled={!point}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all active:scale-95"
            >
              Calculate Result
            </button>
          </div>
        </section>

        {/* Result Area */}
        {result !== null && (
          <section className="animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="bg-white dark:bg-slate-900/50 border border-indigo-600/20 dark:border-indigo-500/30 rounded-3xl p-10 shadow-2xl flex flex-col items-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-indigo-600/5 blur-3xl rounded-full scale-110 pointer-events-none group-hover:bg-indigo-600/10 transition-colors"></div>
              
              <div className="flex items-center space-x-2 relative z-10 mb-2">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Calculated Value</span>
              </div>

              <div className="text-8xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums relative z-10 mb-6">
                {result.toFixed(1)}
              </div>

              <button 
                onClick={handleCopy}
                className={`relative z-10 flex items-center space-x-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  copied 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600'
                }`}
              >
                <CopyIcon />
                <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>
            </div>
          </section>
        )}

        {/* History */}
        {history.length > 0 && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between ml-1">
              <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                <HistoryIcon />
                <h3 className="text-[10px] font-black uppercase tracking-widest">Recent Activity</h3>
              </div>
              <button 
                onClick={clearHistory}
                className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-3">
              {history.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900/50 p-5 rounded-2xl flex justify-between items-center text-sm border border-slate-200 dark:border-white/5 border-l-4 border-l-indigo-600 shadow-md transition-all hover:translate-x-1 hover:shadow-lg">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2 mb-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${item.mode === CalculationMode.SP1 ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
                        {item.mode}
                      </span>
                      <span className="text-[8px] text-slate-400 font-medium">
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-tighter">Pt: <span className="text-slate-900 dark:text-slate-100">{item.point}</span></span>
                  </div>
                  <div className="font-black text-indigo-600 dark:text-indigo-400 text-2xl tabular-nums">
                    {item.result.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="w-full max-w-md py-12 mt-auto text-center select-none">
        <div className="inline-flex items-center space-x-4 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="h-px w-8 bg-slate-400 dark:bg-slate-600"></div>
          <span className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-500 dark:text-slate-500">Trading System V2.1.0</span>
          <div className="h-px w-8 bg-slate-400 dark:bg-slate-600"></div>
        </div>
      </footer>
    </div>
  );
};

export default App;
