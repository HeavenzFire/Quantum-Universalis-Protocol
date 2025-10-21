
import React from 'react';
import { IMPLEMENTATION_PLAN } from '../../constants';

export const ImplementationPlanView: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-100 mb-6">30–60–90 Day Implementation</h2>
      <div className="space-y-6">
        {IMPLEMENTATION_PLAN.map((phase, index) => (
          <div key={index} className="p-5 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <h3 className="font-semibold text-cyan-400 mb-3">{phase.title}</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              {phase.items.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
