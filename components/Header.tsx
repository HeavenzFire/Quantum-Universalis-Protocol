
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="p-4 sm:p-6 lg:p-8 border-b border-slate-700/50">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
        Quantum Universalis Protocol <span className="text-sm font-mono text-cyan-400">v1.0</span>
      </h1>
      <p className="mt-1 text-slate-400">A practical operating system from history’s sharpest builders.</p>
    </header>
  );
};
