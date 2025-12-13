
import React from 'react';
import { X, Copy, Check } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  onClose: () => void;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ code, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="ml-3 text-slate-300 font-mono text-sm font-bold">generated_code.js</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopy}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Copy Code"
            >
              {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-6 custom-scrollbar bg-[#0f172a]">
          <pre className="font-mono text-sm leading-relaxed">
            <code className="text-blue-300">{code}</code>
          </pre>
        </div>
        
        {/* Footer */}
        <div className="p-3 bg-slate-800 border-t border-slate-700 text-xs text-slate-500 text-center">
          Code automatically generated from your blocks
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;
