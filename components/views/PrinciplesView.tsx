
import React from 'react';
import { PRINCIPLES } from '../../constants';
import { ShieldCheckIcon } from '../Icons';

export const PrinciplesView: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-100 mb-4">Non-negotiables (the spine)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PRINCIPLES.map((principle, index) => (
          <div key={index} className="bg-slate-800/40 p-5 rounded-lg border border-slate-700/50">
            <h3 className="font-semibold text-cyan-400 flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5"/>
              {principle.title}
            </h3>
            <p className="text-slate-400 mt-2">{principle.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
