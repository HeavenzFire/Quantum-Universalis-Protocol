
import React from 'react';
import { HARD_TRUTHS } from '../constants';

export const HardTruths: React.FC = () => {
  return (
    <footer className="p-4 sm:p-6 lg:p-8 mt-auto border-t border-slate-700/50 bg-slate-950/30">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Hard Truths</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
        {HARD_TRUTHS.map((truth, index) => (
          <p key={index} className="text-sm text-slate-500 italic">
            {truth}
          </p>
        ))}
      </div>
    </footer>
  );
};
