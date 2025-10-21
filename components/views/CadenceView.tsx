
import React from 'react';
import { CADENCE } from '../../constants';

export const CadenceView: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-100 mb-6">Operating Cadence</h2>
      <div className="space-y-6">
        {CADENCE.map((cadenceItem, index) => (
          <div key={index} className="p-5 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <h3 className="font-semibold text-cyan-400 mb-3">{cadenceItem.title}</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              {cadenceItem.items.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
