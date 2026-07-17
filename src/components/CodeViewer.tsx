
import React from 'react';
import { X, Copy, Check } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  onClose: () => void;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ code, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCode = (src: string): string => {
    const lines = src.split('\n');
    let indent = 0;
    const formatted: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) { formatted.push(''); continue; }
      if (/^\s*[})\]]/.test(trimmed) || /^end\b/i.test(trimmed)) {
        indent = Math.max(0, indent - 1);
      }
      formatted.push('  '.repeat(indent) + trimmed);
      if (/[{[(]\s*$/.test(trimmed) || /^(repeat|function|if|else|for|while|def|class)\b/i.test(trimmed)) {
        indent++;
      }
    }
    return formatted.join('\n');
  };

  const formattedCode = formatCode(code);

  const highlightCode = (src: string) => {
    const escaped = src
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return escaped
      .replace(/(\/\/.*$)/gm, '<span class="text-slate-500 italic">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-slate-500 italic">$1</span>')
      .replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g, '<span class="text-emerald-400">$1</span>')
      .replace(/\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|new|this|import|from|export|default|try|catch|finally|throw|async|await|yield|typeof|instanceof|in|of|void|delete|null|undefined|true|false)\b/g, '<span class="text-purple-400 font-bold">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-amber-400">$1</span>');
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
              className={`p-2 rounded-lg transition-all flex items-center gap-1.5 ${copied ? 'bg-green-500/20 text-green-400' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
              title={copied ? 'Copied!' : 'Copy Code'}
              aria-label="Copy code to clipboard"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied && <span className="text-xs font-bold text-green-400">Copied!</span>}
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Close code viewer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-6 custom-scrollbar bg-[#0f172a]">
          <pre className="font-mono text-sm leading-relaxed">
            <code className="text-blue-300">
              {formattedCode.split('\n').map((line, i) => (
                <div key={i} className="flex">
                  <span className="inline-block w-10 text-right pr-4 text-slate-600 select-none shrink-0 border-r border-slate-700/50 mr-4">{i + 1}</span>
                  <span dangerouslySetInnerHTML={{ __html: highlightCode(line) || '&nbsp;' }} />
                </div>
              ))}
            </code>
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
