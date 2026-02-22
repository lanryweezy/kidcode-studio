import React, { useState } from 'react';
import { AppState } from '../types';
import { Layout, Square, ToggleLeft, SlidersHorizontal, PanelTop, Trash2, Plus, Palette } from 'lucide-react';

interface AppDesignerPanelProps {
  appState: AppState;
  onStateChange: (newState: AppState) => void;
}

const AppDesignerPanel: React.FC<AppDesignerPanelProps> = ({ appState, onStateChange }) => {
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

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Layout className="text-blue-500" /> App Designer
        </h3>
        <p className="text-xs text-slate-400">Design your app interface!</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 150px)', height: 'calc(100vh - 150px)' }}>
        
        {/* Preview Box */}
        <div className="aspect-video bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 mb-6 flex items-center justify-center relative overflow-hidden shadow-inner group">
          <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==')] opacity-10"></div>
          <div className="text-center p-4">
            <div className="text-4xl mb-2">📱</div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">App Preview</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Screen: {appState.activeScreen || 'main'}</p>
          </div>
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] bg-black/50 text-white px-2 py-1 rounded-full">Preview</span>
          </div>
        </div>

        {/* Main Actions */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleAddScreen}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add New Screen
          </button>
          <button
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <Palette size={18} /> Theme Editor
          </button>
        </div>

        {/* App Elements */}
        <div className="space-y-4 mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide">UI Components</h4>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center p-3 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <Square className="text-slate-600 dark:text-slate-300 mb-1" size={20} />
              <span className="text-xs text-slate-500 dark:text-slate-400">Text</span>
            </button>
            <button className="flex flex-col items-center justify-center p-3 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <Square className="text-slate-600 dark:text-slate-300 mb-1" size={20} />
              <span className="text-xs text-slate-500 dark:text-slate-400">Button</span>
            </button>
            <button className="flex flex-col items-center justify-center p-3 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <Square className="text-slate-600 dark:text-slate-300 mb-1" size={20} />
              <span className="text-xs text-slate-500 dark:text-slate-400">Input</span>
            </button>
            <button className="flex flex-col items-center justify-center p-3 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <Square className="text-slate-600 dark:text-slate-300 mb-1" size={20} />
              <span className="text-xs text-slate-500 dark:text-slate-400">Image</span>
            </button>
            <button className="flex flex-col items-center justify-center p-3 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <ToggleLeft className="text-slate-600 dark:text-slate-300 mb-1" size={20} />
              <span className="text-xs text-slate-500 dark:text-slate-400">Toggle</span>
            </button>
            <button className="flex flex-col items-center justify-center p-3 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <SlidersHorizontal className="text-slate-600 dark:text-slate-300 mb-1" size={20} />
              <span className="text-xs text-slate-500 dark:text-slate-400">Slider</span>
            </button>
          </div>
        </div>

        {/* Screen List */}
        <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-2 text-sm uppercase tracking-wide">Screens</h4>
        <div className="space-y-2">
          {Object.keys(appState.screens).length > 0 ? (
            Object.keys(appState.screens).map(screenName => (
              <div 
                key={screenName}
                className={`p-3 rounded-lg border flex items-center justify-between ${(appState.activeScreen === screenName ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-slate-200 dark:border-slate-700')}`}
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
            <div className="p-3 text-center text-slate-400 text-sm rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
              No screens created yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppDesignerPanel;