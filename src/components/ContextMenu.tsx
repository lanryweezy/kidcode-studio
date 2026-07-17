
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Copy, Trash2, StickyNote, Ban } from 'lucide-react';

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
  const [isClosing, setIsClosing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 150);
  };

  const menuItems = React.useMemo(() => {
    const items: { key: string; action: () => void; label: string }[] = [
      { key: 'duplicate', action: onDuplicate, label: 'Duplicate' },
    ];
    if (onComment) items.push({ key: 'comment', action: onComment, label: 'Add Comment' });
    if (onDisable) items.push({ key: 'disable', action: onDisable, label: 'Disable Block' });
    items.push({ key: 'delete', action: onDelete, label: 'Delete' });
    return items;
  }, [onDuplicate, onComment, onDisable, onDelete]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, menuItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = menuItems[activeIndex];
      if (item) {
        item.action();
        handleClose();
      }
    }
  }, [activeIndex, menuItems]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, handleKeyDown]);

  useEffect(() => {
    itemsRef.current[activeIndex]?.focus();
  }, [activeIndex]);

  return (
    <div 
      ref={menuRef}
      className={`fixed z-50 bg-white rounded-2xl shadow-2xl border-4 border-slate-200 p-2 w-64 origin-top-left overflow-hidden transition-all duration-200 transform-gpu ${isClosing ? 'opacity-0 scale-90 translate-y-2' : 'animate-in zoom-in duration-200'}`}
      style={{ top: y, left: x }}
      role="menu"
      aria-label="Block actions"
    >
      <div className="flex flex-col gap-2 max-h-80 overflow-y-auto custom-scrollbar">
        {menuItems.map((item, i) => {
          const Icon = item.key === 'duplicate' ? Copy : item.key === 'comment' ? StickyNote : item.key === 'disable' ? Ban : Trash2;
          const isDelete = item.key === 'delete';
          return (
            <button
              key={item.key}
              ref={el => { itemsRef.current[i] = el; }}
              onClick={() => { item.action(); handleClose(); }}
              onMouseEnter={() => setActiveIndex(i)}
              role="menuitem"
              tabIndex={-1}
              className={`flex items-center gap-3 px-4 py-3 text-base rounded-xl font-bold transition-all transform-gpu hover:scale-105 active:scale-95 text-left shadow-sm ${
                i === activeIndex
                  ? isDelete ? 'bg-red-500 text-white' : 'bg-violet-500 text-white'
                  : isDelete ? 'bg-red-50 text-red-600 hover:bg-red-500 hover:text-white' : 'bg-slate-50 text-slate-700 hover:bg-violet-500 hover:text-white'
              }`}
            >
              <Icon size={20} className={i === activeIndex ? 'animate-bounce' : ''} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ContextMenu;
