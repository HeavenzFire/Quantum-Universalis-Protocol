
import React from 'react';
import { PROTOCOL_CARD_TEMPLATE } from '../../constants';

export const ProtocolCardGeneratorView: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-100 mb-2">Protocol Card Generator</h2>
      <p className="text-slate-400 mb-6">Use this template to force rigor on every experiment.</p>
      <div className="p-6 rounded-lg bg-slate-800/40 border border-slate-700/50">
        <form className="space-y-5">
          {PROTOCOL_CARD_TEMPLATE.map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  rows={2}
                  className="w-full bg-slate-900/70 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                />
              ) : (
                <input
                  type="text"
                  className="w-full bg-slate-900/70 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                />
              )}
            </div>
          ))}
          <div className="pt-4 flex justify-end">
            <button
              type="button"
              className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition"
            >
              Generate Card (Mock)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
