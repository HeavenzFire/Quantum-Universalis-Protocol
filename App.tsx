import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HardTruths } from './components/HardTruths';
import { PrinciplesView } from './components/views/PrinciplesView';
import { ProtocolsView } from './components/views/ProtocolsView';
import { CadenceView } from './components/views/CadenceView';
import { ToolingView } from './components/views/ToolingView';
import { ImplementationPlanView } from './components/views/ImplementationPlanView';
import { ProtocolCardGeneratorView } from './components/views/ProtocolCardGeneratorView';
import { RitualView } from './components/views/RitualView';
import { LiveView } from './components/views/LiveView';
import { ImageEditorView } from './components/views/ImageEditorView';
import { VideoGeneratorView } from './components/views/VideoGeneratorView';
import { NexusSearchView } from './components/views/NexusSearchView';
import { AngelusSafeguardView } from './components/views/AngelusSafeguardView';
import { ResonanceChamberView } from './components/views/ResonanceChamberView';
import { VideoAnalysisView } from './components/views/VideoAnalysisView';
import { AuralInterfaceView } from './components/views/AuralInterfaceView';
import { ImageGeneratorView } from './components/views/ImageGeneratorView';
import { ChatView } from './components/views/ChatView';
import { ImageAnalysisView } from './components/views/ImageAnalysisView';
import { TranscriptionView } from './components/views/TranscriptionView';
import { View } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('Principles');

  const renderView = () => {
    switch (activeView) {
      case 'Principles': return <PrinciplesView />;
      case 'Protocols': return <ProtocolsView />;
      case 'Cadence': return <CadenceView />;
      case 'Tooling': return <ToolingView />;
      case 'Implementation': return <ImplementationPlanView />;
      case 'Generator': return <ProtocolCardGeneratorView />;
      case 'Ritual': return <RitualView />;
      
      // AI Features
      case 'Chat': return <ChatView />;
      case 'Search': return <NexusSearchView />;
      case 'Safeguard': return <AngelusSafeguardView />;
      case 'Resonance': return <ResonanceChamberView />;
      case 'Live': return <LiveView />;
      case 'Transcription': return <TranscriptionView />;
      case 'Aural': return <AuralInterfaceView />;
      case 'Image': return <ImageEditorView />;
      case 'ImageGenerator': return <ImageGeneratorView />;
      case 'ImageAnalysis': return <ImageAnalysisView />;
      case 'Video': return <VideoGeneratorView />;
      case 'VideoAnalysis': return <VideoAnalysisView />;

      default: return <PrinciplesView />;
    }
  };

  return (
    <div className="bg-slate-900 text-slate-200 min-h-screen flex flex-col font-sans">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {renderView()}
          </div>
          <HardTruths />
        </main>
      </div>
    </div>
  );
};

export default App;
