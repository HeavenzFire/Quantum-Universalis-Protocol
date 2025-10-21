import React from 'react';
import { 
    ShieldCheckIcon, BookOpenIcon, CalendarIcon, BeakerIcon, RocketIcon, CodeIcon, 
    SparklesIcon, MicIcon, WandSparklesIcon, FilmIcon, SearchIcon, GuardianIcon, 
    HeartCircuitIcon, VideoSearchIcon, Volume2Icon, ImageIcon, MessageCircleIcon, EyeIcon, AudioLinesIcon 
} from './Icons';
import { View } from '../types';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon: Icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-cyan-500/10 text-cyan-400'
        : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
    }`}
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    <span>{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { view: 'Principles' as View, label: 'Principles', icon: ShieldCheckIcon },
    { view: 'Protocols' as View, label: 'Protocols', icon: BookOpenIcon },
    { view: 'Cadence' as View, label: 'Cadence', icon: CalendarIcon },
    { view: 'Tooling' as View, label: 'Tooling', icon: BeakerIcon },
    { view: 'Implementation' as View, label: 'Implementation', icon: RocketIcon },
    { view: 'Generator' as View, label: 'Card Generator', icon: CodeIcon },
    { view: 'Ritual' as View, label: 'Clarity Ritual', icon: SparklesIcon },
  ];
  
  const aiFeatureGroups = [
    { 
      title: 'Reasoning & Synthesis',
      items: [
        { view: 'Chat' as View, label: 'Chat', icon: MessageCircleIcon },
        { view: 'Search' as View, label: 'Nexus Search', icon: SearchIcon },
        { view: 'Safeguard' as View, label: 'Angelus Safeguard', icon: GuardianIcon },
        { view: 'Resonance' as View, label: 'Resonance Chamber', icon: HeartCircuitIcon },
      ]
    },
    {
      title: 'Conversation & Audio',
      items: [
        { view: 'Live' as View, label: 'Live Conversation', icon: MicIcon },
        { view: 'Transcription' as View, label: 'Audio Transcription', icon: AudioLinesIcon },
        { view: 'Aural' as View, label: 'Aural Interface', icon: Volume2Icon },
      ]
    },
    {
      title: 'Image',
      items: [
        { view: 'Image' as View, label: 'Image Alchemist (Edit)', icon: WandSparklesIcon },
        { view: 'ImageGenerator' as View, label: 'Image Generator', icon: ImageIcon },
        { view: 'ImageAnalysis' as View, label: 'Image Analysis', icon: EyeIcon },
      ]
    },
    {
      title: 'Video',
      items: [
        { view: 'Video' as View, label: 'Video Alchemist (Gen)', icon: FilmIcon },
        { view: 'VideoAnalysis' as View, label: 'Video Analysis', icon: VideoSearchIcon },
      ]
    }
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-950/30 border-r border-slate-700/50 p-4 space-y-8 overflow-y-auto">
      <div>
        <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Core</h3>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.view}
              {...item}
              isActive={activeView === item.view}
              onClick={() => setActiveView(item.view)}
            />
          ))}
        </nav>
      </div>
      <div>
        <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">AI Features</h3>
        <div className="space-y-4">
          {aiFeatureGroups.map((group) => (
            <div key={group.title}>
              <h4 className="px-3 text-xs font-medium text-slate-400 mb-2">{group.title}</h4>
              <nav className="space-y-1">
                {group.items.map((item) => (
                  <NavItem
                    key={item.view}
                    {...item}
                    isActive={activeView === item.view}
                    onClick={() => setActiveView(item.view)}
                  />
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};