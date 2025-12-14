
import React, { useEffect, useRef } from 'react';
import { Copy, Trash2, StickyNote, Ban, PlayCircle } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onComment?: () => void;
  onDisable?: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onDuplicate, onDelete, onComment, onDisable }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div 
      ref={menuRef}
      className="fixed z-50 bg-white rounded-xl shadow-xl border border-slate-100 p-1 w-48 animate-in zoom-in-95 duration-100 origin-top-left overflow-hidden"
      style={{ top: y, left: x }}
    >
      <div className="flex flex-col">
        <button onClick={() => { onDuplicate(); onClose(); }} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-left">
          <Copy size={16} />
          <span className="font-bold">Duplicate</span>
        </button>
        {onComment && (
          <button onClick={() => { onComment(); onClose(); }} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-yellow-600 rounded-lg transition-colors text-left">
            <StickyNote size={16} />
            <span className="font-bold">Add Comment</span>
          </button>
        )}
        {onDisable && (
          <button onClick={() => { onDisable(); onClose(); }} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left">
            <Ban size={16} />
            <span className="font-bold">Disable Block</span>
          </button>
        )}
        <div className="h-px bg-slate-100 my-1" />
        <button onClick={() => { onDelete(); onClose(); }} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left">
          <Trash2 size={16} />
          <span className="font-bold">Delete</span>
        </button>
      </div>
    </div>
  );
};

export default ContextMenu;
