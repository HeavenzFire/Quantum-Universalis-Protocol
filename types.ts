import React from 'react';

export interface Protocol {
  id: number;
  person: string;
  title: string;
  method: string;
  implementation: string[];
  kpi: string[];
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface CadenceItem {
  title: string;
  items: string[];
}

export interface ToolingCategory {
  title: string;
  items: string[];
}

export interface PlanPhase {
  title: string;
  items: string[];
}

export type View = 'Principles' | 'Protocols' | 'Cadence' | 'Tooling' | 'Implementation' | 'Generator' | 'Ritual' | 'Live' | 'Image' | 'Video' | 'Search' | 'Safeguard' | 'Resonance' | 'VideoAnalysis' | 'Aural' | 'ImageGenerator' | 'Chat' | 'ImageAnalysis' | 'Transcription';
