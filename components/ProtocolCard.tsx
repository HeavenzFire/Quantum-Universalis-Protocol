
import React, { useState } from 'react';
import type { Protocol } from '../types';
import { ChevronDownIcon } from './Icons';

interface ProtocolCardProps {
  protocol: Protocol;
}

export const ProtocolCard: React.FC<ProtocolCardProps> = ({ protocol }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-700/50 rounded-lg bg-slate-800/20 overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-4">
          <protocol.icon className="w-8 h-8 text-cyan-400 flex-shrink-0" />
          <div>
            <p className="text-sm text-slate-400">{protocol.person}</p>
            <h3 className="font-semibold text-slate-100">{protocol.title}</h3>
          </div>
        </div>
        <ChevronDownIcon
          className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-4 border-t border-slate-700/50">
            <p className="italic text-slate-300 mb-4">“{protocol.method}”</p>
            
            <h4 className="font-semibold text-slate-200 mb-2">Implementation:</h4>
            <ul className="list-disc list-inside space-y-2 text-slate-400 mb-4">
              {protocol.implementation.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h4 className="font-semibold text-slate-200 mb-2">KPI:</h4>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              {protocol.kpi.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
