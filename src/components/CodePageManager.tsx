import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CommandBlock, PageCode, AppElement, AppState } from '../types';
import { FileCode, Copy, Download, Eye, Code2, Layout, Smartphone, Terminal, ChevronRight, Plus, Trash2, Edit2, MousePointer2 } from 'lucide-react';
import { exportToPython, exportToJavaScript, exportToArduino, exportToHTML5 } from '../services/codeExporter';
import { AppMode } from '../types';
import { eventBus } from '../services/eventBus';
import { multiplayerService, RemoteUser } from '../services/multiplayerService';

interface CodePageManagerProps {
  commands: CommandBlock[];
  appState: AppState;
  activeScreen: string;
  onScreenChange: (screenId: string) => void;
  onCreateScreen: (screenName: string) => void;
  onDeleteScreen: (screenId: string) => void;
}

const CodePageManager: React.FC<CodePageManagerProps> = ({
  commands,
  appState,
  activeScreen,
  onScreenChange,
  onCreateScreen,
  onDeleteScreen
}) => {
  const [selectedView, setSelectedView] = useState<'blocks' | 'python' | 'javascript' | 'arduino' | 'html'>('blocks');
  const [newScreenName, setNewScreenName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [participants, setParticipants] = useState<RemoteUser[]>([]);

  useEffect(() => {
      eventBus.on('multiplayer_update', (data: RemoteUser[]) => {
          setParticipants(data);
      });
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
      multiplayerService.broadcast('cursor_move', { x: e.clientX, y: e.clientY });
  };

  // Organize commands by screen
  const pagesByScreen = useMemo(() => {
    const pages: Record<string, PageCode> = {};
    
    // Initialize pages from appState.screens
    Object.entries(appState.screens).forEach(([screenId, elements]) => {
      pages[screenId] = {
        screenId,
        screenName: screenId,
        blocks: commands.filter(cmd => !cmd.screenId || cmd.screenId === screenId),
        generatedCode: {
          python: '',
          javascript: '',
          arduino: ''
        },
        lastEdited: Date.now()
      };
    });

    // Generate code for each page
    Object.keys(pages).forEach(screenId => {
      const pageCommands = pages[screenId].blocks;
      pages[screenId].generatedCode = {
        python: exportToPython(pageCommands, AppMode.APP),
        javascript: exportToJavaScript(pageCommands, AppMode.APP),
        arduino: exportToArduino(pageCommands)
      };
    });

    return pages;
  }, [commands, appState.screens]);

  const screens = Object.keys(appState.screens);
  const currentPage = pagesByScreen[activeScreen];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  const handleDownloadCode = (code: string, extension: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeScreen}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateScreen = () => {
    if (newScreenName.trim()) {
      onCreateScreen(newScreenName.trim());
      setNewScreenName('');
      setShowCreateModal(false);
    }
  };

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden" onMouseMove={handleMouseMove}>
      {/* Ghost Cursors */}
      {participants.map(p => (
          <div 
            key={p.id} 
            className="fixed z-[1000] pointer-events-none transition-all duration-75"
            style={{ left: p.cursor.x, top: p.cursor.y }}
          >
              <MousePointer2 size={24} fill="currentColor" className="text-violet-400 drop-shadow-md" />
              <div className="bg-violet-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded ml-4 -mt-2 uppercase tracking-tighter shadow-lg">Collab</div>
          </div>
      ))}

      {/* Left Sidebar - Screen Navigation */}
      <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Layout size={18} className="text-blue-500" />
            App Pages
          </h3>
          <p className="text-xs text-slate-500 mt-1">Organize code by screen</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {screens.map(screenId => (
            <div
              key={screenId}
              className={`group flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${
                activeScreen === screenId
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
              }`}
              onClick={() => onScreenChange(screenId)}
            >
              <div className="flex items-center gap-3 flex-1">
                <Smartphone size={18} className={activeScreen === screenId ? 'text-blue-500' : 'text-slate-400'} />
                <div className="flex-1">
                  <div className="font-bold text-sm text-slate-800 dark:text-white">{screenId}</div>
                  <div className="text-xs text-slate-500">
                    {pagesByScreen[screenId]?.blocks.length || 0} blocks
                  </div>
                </div>
              </div>
              
              {screenId !== 'main' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteScreen(screenId);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-slate-400 hover:text-red-500 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Screen Button */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Plus size={18} /> Add Page
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Smartphone size={20} className="text-blue-500" />
            <div>
              <h2 className="font-black text-lg text-slate-800 dark:text-white">{activeScreen}</h2>
              <p className="text-xs text-slate-500">
                {currentPage?.blocks.length || 0} blocks • Last edited {new Date(currentPage?.lastEdited || Date.now()).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* View Tabs */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <ViewTab active={selectedView === 'blocks'} onClick={() => setSelectedView('blocks')} icon={Layout} label="Blocks" />
            <ViewTab active={selectedView === 'python'} onClick={() => setSelectedView('python')} icon={Code2} label="Python" />
            <ViewTab active={selectedView === 'javascript'} onClick={() => setSelectedView('javascript')} icon={FileCode} label="JavaScript" />
            <ViewTab active={selectedView === 'arduino'} onClick={() => setSelectedView('arduino')} icon={Terminal} label="Arduino" />
            <ViewTab active={selectedView === 'html'} onClick={() => setSelectedView('html')} icon={Smartphone} label="HTML5" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedView === 'blocks' && (
            <BlocksView commands={currentPage?.blocks || []} screenId={activeScreen} />
          )}
          
          {selectedView === 'python' && (
            <CodeView
              code={currentPage?.generatedCode.python || '# No blocks on this page'}
              language="python"
              onCopy={() => handleCopyCode(currentPage?.generatedCode.python || '')}
              onDownload={() => handleDownloadCode(currentPage?.generatedCode.python || '', 'py')}
            />
          )}
          
          {selectedView === 'javascript' && (
            <CodeView
              code={currentPage?.generatedCode.javascript || '// No blocks on this page'}
              language="javascript"
              onCopy={() => handleCopyCode(currentPage?.generatedCode.javascript || '')}
              onDownload={() => handleDownloadCode(currentPage?.generatedCode.javascript || '', 'js')}
            />
          )}
          
          {selectedView === 'arduino' && (
            <CodeView
              code={currentPage?.generatedCode.arduino || '// Arduino not supported for App mode'}
              language="arduino"
              onCopy={() => handleCopyCode(currentPage?.generatedCode.arduino || '')}
              onDownload={() => handleDownloadCode(currentPage?.generatedCode.arduino || '', 'ino')}
            />
          )}
          
          {selectedView === 'html' && (
            <CodeView
              code={exportToHTML5(currentPage?.blocks || [], AppMode.APP)}
              language="html"
              onCopy={() => handleCopyCode(exportToHTML5(currentPage?.blocks || [], AppMode.APP))}
              onDownload={() => handleDownloadCode(exportToHTML5(currentPage?.blocks || [], AppMode.APP), 'html')}
            />
          )}
        </div>
      </div>

      {/* Create Screen Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border-2 border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4">Create New Page</h3>
            <input
              type="text"
              value={newScreenName}
              onChange={(e) => setNewScreenName(e.target.value)}
              placeholder="Page name (e.g., settings, profile)"
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400 mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateScreen()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateScreen}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all"
              >
                Create Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// === SUB-COMPONENTS ===

const ViewTab: React.FC<{ active: boolean; onClick: () => void; icon: any; label: string }> = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
      active
        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
    }`}
  >
    <Icon size={16} />
    <span className="hidden md:inline">{label}</span>
  </button>
);

const BlocksView: React.FC<{ commands: CommandBlock[]; screenId: string }> = ({ commands, screenId }) => {
  if (commands.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400">
        <Layout size={64} className="mb-4 opacity-50" />
        <h3 className="text-xl font-bold mb-2">No blocks on this page</h3>
        <p className="text-sm">Add blocks to create functionality for the "{screenId}" screen</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm font-bold">
          <Smartphone size={16} />
          Showing {commands.length} block{commands.length !== 1 ? 's' : ''} for page "{screenId}"
        </div>
      </div>
      
      {commands.map((cmd, index) => (
        <div
          key={cmd.id}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center gap-4"
        >
          <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-sm font-bold text-slate-500">
            {index + 1}
          </div>
          <div className="flex-1">
            <div className="font-bold text-slate-800 dark:text-white">{cmd.type}</div>
            {cmd.params.text && (
              <div className="text-sm text-slate-500 truncate">{cmd.params.text}</div>
            )}
          </div>
          <ChevronRight size={20} className="text-slate-400" />
        </div>
      ))}
    </div>
  );
};

const CodeView: React.FC<{ code: string; language: string; onCopy: () => void; onDownload: () => void }> = ({ code, language, onCopy, onDownload }) => (
  <div className="relative">
    <div className="absolute top-4 right-4 flex gap-2 z-10">
      <button
        onClick={onCopy}
        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-all"
      >
        <Copy size={14} /> Copy
      </button>
      <button
        onClick={onDownload}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-all"
      >
        <Download size={14} /> Download .{language}
      </button>
    </div>
    
    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-xs text-slate-400 font-mono ml-2">code.{language}</span>
        </div>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-slate-300 leading-relaxed max-h-[600px] overflow-y-auto">
        <code>{code}</code>
      </pre>
    </div>
  </div>
);

export default CodePageManager;
