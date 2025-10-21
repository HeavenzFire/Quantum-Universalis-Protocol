
import React from 'react';
import { TOOLING } from '../../constants';

export const ToolingView: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-100 mb-6">Minimal Tooling Stack</h2>
      <div className="space-y-6">
        {TOOLING.map((category, index) => (
          <div key={index}>
            <h3 className="font-semibold text-cyan-400 mb-3">{category.title}</h3>
            <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-700/50">
              {category.items.map((item, itemIndex) => (
                <pre key={itemIndex} className="text-slate-400 text-sm whitespace-pre-wrap"><code>{item}</code></pre>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
