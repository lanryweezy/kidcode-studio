
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
      className={`fixed z-50 bg-white rounded-xl shadow-xl border border-slate-100 p-1 w-48 origin-top-left overflow-hidden transition-all duration-150 ${isClosing ? 'opacity-0 scale-95' : 'animate-in zoom-in-95 duration-100'}`}
      style={{ top: y, left: x }}
      role="menu"
      aria-label="Block actions"
    >
      <div className="flex flex-col max-h-80 overflow-y-auto">
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
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                i === activeIndex
                  ? isDelete ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-blue-600'
                  : isDelete ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
              }`}
            >
              <Icon size={16} />
              <span className="font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ContextMenu;
