
import { useState, useCallback, useRef } from 'react';
import { CommandBlock } from '../types/types';
import { playSoundEffect } from '../services/soundService';

export const useEditor = (initialCommands: CommandBlock[] = []) => {
  const [activeTab, setActiveTab] = useState('code');
  const [darkMode, setDarkMode] = useState(false);
  const [commands, setCommands] = useState<CommandBlock[]>(initialCommands);
  const [history, setHistory] = useState<CommandBlock[][]>([]);
  const [redoStack, setRedoStack] = useState<CommandBlock[][]>([]);
  const commandsRef = useRef(commands);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    setRedoStack(prev => [commands, ...prev]);
    setHistory(newHistory);
    setCommands(previous);
  }, [history, commands]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    const newRedo = redoStack.slice(1);

    setHistory(prev => [...prev, commands]);
    setRedoStack(newRedo);
    setCommands(next);
  }, [redoStack, commands]);

  const pushToHistory = (newCommands: CommandBlock[]) => {
      setHistory(prev => [...prev.slice(-20), commands]);
      setRedoStack([]);
      setCommands(newCommands);
  };

  const handleUpdateBlock = useCallback((id: string, params: any) => {
      setCommands(prev => prev.map(c => c.id === id ? { ...c, params: { ...c.params, ...params } } : c));
  }, []);

  const handleDeleteBlock = useCallback((id: string) => {
      const currentCmds = commandsRef.current;
      const newCmds = currentCmds.filter(c => c.id !== id);
      setHistory(h => [...h.slice(-20), currentCmds]);
      setRedoStack([]);
      setCommands(newCmds);
      playSoundEffect('click');
  }, []);

  const handleDuplicateBlock = useCallback((id: string) => {
      const currentCmds = commandsRef.current;
      const original = currentCmds.find(c => c.id === id);
      if (original) {
          const index = currentCmds.indexOf(original);
          const copy = { ...original, id: crypto.randomUUID() };
          const newCmds = [...currentCmds];
          newCmds.splice(index + 1, 0, copy);
          setHistory(h => [...h.slice(-20), currentCmds]);
          setRedoStack([]);
          setCommands(newCmds);
          playSoundEffect('click');
      }
  }, []);

  return {
    activeTab,
    setActiveTab,
    darkMode,
    setDarkMode,
    commands,
    setCommands,
    history,
    setHistory,
    redoStack,
    setRedoStack,
    handleUndo,
    handleRedo,
    pushToHistory,
    handleUpdateBlock,
    handleDeleteBlock,
    handleDuplicateBlock,
  };
};
