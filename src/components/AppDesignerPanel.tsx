import React, { useState } from 'react';
import { AppState } from '../types';
import { Layout, Square, ToggleLeft, SlidersHorizontal, PanelTop, Trash2, Plus, Palette, Camera, ChevronDown } from 'lucide-react';
import { DEFAULT_SCREEN } from '../constants/actions';

interface AppDesignerPanelProps {
  appState: AppState;
  onStateChange: (newState: AppState) => void;
}

const LAYOUT_MODES = [
  { id: 'stack', label: 'Stack', icon: '↕️' },
  { id: 'grid', label: 'Grid', icon: '⊞' },
  { id: 'row', label: 'Row', icon: '↔️' },
] as const;

const ELEMENT_CATEGORIES = [
  {
    name: 'Basic',
    elements: [
      { type: 'text', label: 'Text', icon: Square },
      { type: 'button', label: 'Button', icon: Square },
      { type: 'input', label: 'Input', icon: Square },
      { type: 'image', label: 'Image', icon: Square },
    ],
  },
  {
    name: 'Interactive',
    elements: [
      { type: 'switch', label: 'Toggle', icon: ToggleLeft },
      { type: 'slider', label: 'Slider', icon: SlidersHorizontal },
      { type: 'camera', label: 'Camera', icon: Camera },
    ],
  },
];

const AppDesignerPanel: React.FC<AppDesignerPanelProps> = ({ appState, onStateChange }) => {
  const [layoutMode, setLayoutMode] = useState<'stack' | 'grid' | 'row'>('stack');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Basic');

  const handleAddScreen = () => {
    const newScreenName = `screen${Object.keys(appState.screens).length + 1}`;
    onStateChange({
      ...appState,
      screens: {
        ...appState.screens,
        [newScreenName]: []
      }
    });
  };

  const handleDeleteScreen = (screenName: string) => {
    const newScreens = { ...appState.screens };
    delete newScreens[screenName];
    onStateChange({
      ...appState,
      screens: newScreens
    });
  };

  const handleLayoutChange = (mode: 'stack' | 'grid' | 'row') => {
    setLayoutMode(mode);
  };

  const getLayoutClasses = () => {
    switch (layoutMode) {
      case 'grid': return 'grid grid-cols-2 gap-3';
      case 'row': return 'flex flex-row gap-3 flex-wrap';
      case 'stack':
      default: return 'flex flex-col gap-3';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-4 bg-white border-b border-slate-200">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Layout className="text-blue-500" /> App Designer
        </h3>
        <p className="text-xs text-slate-400">Design your app interface!</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 150px)', height: 'calc(100vh - 150px)' }}>
        
        {/* Preview Box */}
        <div className="aspect-video bg-white rounded-2xl border-2 border-slate-200 mb-6 flex items-center justify-center relative overflow-hidden shadow-inner group">
          <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==')] opacity-10"></div>
          <div className="text-center p-4">
            <div className="text-4xl mb-2">📱</div>
            <p className="text-slate-500 text-sm">App Preview</p>
            <p className="text-slate-400 text-xs mt-1">Screen: {appState.activeScreen || DEFAULT_SCREEN}</p>
          </div>
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] bg-black/50 text-white px-2 py-1 rounded-full">Preview</span>
          </div>
        </div>

        {/* Layout Mode Selector */}
        <div className="bg-white p-3 rounded-xl border border-slate-100 mb-6">
          <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wide mb-2">Layout Mode</h4>
          <div className="flex gap-2">
            {LAYOUT_MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => handleLayoutChange(mode.id)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                  layoutMode === mode.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{mode.icon}</span>
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Actions */}
        <div className="flex flex-col gap-3 mb-6">
          <button
            onClick={handleAddScreen}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add New Screen
          </button>
          <button
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            <Palette size={18} /> Theme Editor
          </button>
        </div>

        {/* App Elements */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 mb-6">
          <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wide mb-3">UI Components</h4>
          {ELEMENT_CATEGORIES.map(category => (
            <div key={category.name} className="mb-3 last:mb-0">
              <button
                onClick={() => setExpandedCategory(expandedCategory === category.name ? null : category.name)}
                className="w-full flex items-center justify-between py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
              >
                <span>{category.name}</span>
                <ChevronDown size={14} className={`transition-transform ${expandedCategory === category.name ? 'rotate-180' : ''}`} />
              </button>
              {expandedCategory === category.name && (
                <div className={getLayoutClasses()}>
                  {category.elements.map(el => (
                    <button key={el.type} className="flex flex-col items-center justify-center p-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                      <el.icon className="text-slate-600 mb-1" size={20} />
                      <span className="text-xs text-slate-500">{el.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Screen List */}
        <h4 className="font-bold text-slate-700 mb-2 text-xs uppercase tracking-wide">Screens</h4>
        <div className="flex flex-col gap-2">
          {Object.keys(appState.screens).length > 0 ? (
            Object.keys(appState.screens).map(screenName => (
              <div 
                key={screenName}
                className={`p-3 rounded-lg border flex items-center justify-between ${(appState.activeScreen === screenName ? 'border-blue-500 bg-blue-50' : 'border-slate-200')}`}
              >
                <div className="flex items-center gap-2">
                  <PanelTop size={16} />
                  <span className="font-medium">{screenName}</span>
                </div>
                <button 
                  onClick={() => handleDeleteScreen(screenName)}
                  className="text-slate-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-slate-400 text-sm rounded-lg border border-dashed border-slate-300">
              No screens created yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppDesignerPanel;