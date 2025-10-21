
import React from 'react';
import { PROTOCOLS } from '../../constants';
import { ProtocolCard } from '../ProtocolCard';

export const ProtocolsView: React.FC = () => {
  return (
    <div className="space-y-4">
      {PROTOCOLS.map((protocol) => (
        <ProtocolCard key={protocol.id} protocol={protocol} />
      ))}
    </div>
  );
};
