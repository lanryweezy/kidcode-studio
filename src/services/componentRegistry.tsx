import React from 'react';
import { AppElement, AppState } from '../types';

/**
 * Component Registry for App Builder
 * 
 * Allows registering custom UI components that can be used in the App Builder
 * Provides extensibility without modifying core code
 * 
 * Features:
 * - Built-in components (button, input, switch, slider, etc.)
 * - Custom component registration
 * - Type-safe component props
 * - Hot-reload support
 */

export interface ComponentProps {
  element: AppElement;
  appState: AppState;
  onInteraction?: (varName: string, value: string | number | boolean) => void;
  onNavigate?: (screen: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export type ComponentType = React.FC<ComponentProps>;

const registry: Map<string, ComponentType> = new Map();
const componentInfo: Map<string, { name: string; icon: string; category: string }> = new Map();

// ============================================
// BUILT-IN COMPONENTS
// ============================================

const ButtonComponent: ComponentType = ({ element, onNavigate, className }) => {
  const handleClick = () => {
    if (element.actionMessage) alert(element.actionMessage);
    if (element.targetScreen) onNavigate?.(element.targetScreen);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${className || ''}`}
    >
      {element.icon && <span className="text-lg">{element.icon}</span>}
      {element.content}
    </button>
  );
};

const InputComponent: ComponentType = ({ element, appState, onInteraction, className }) => {
  const varName = element.variableName || '';
  return (
  <div className={`bg-slate-50 rounded-2xl border-2 border-slate-100 px-4 py-2 flex items-center gap-2 focus-within:border-blue-400 transition-colors ${className || ''}`}>
    {element.icon && <span className="text-slate-400">{element.icon}</span>}
    <input
      className="bg-transparent w-full outline-none text-slate-700 font-medium"
      placeholder={element.placeholder || "Type here..."}
      value={appState.variables[varName] || ''}
      onChange={(e) => onInteraction?.(varName, e.target.value)}
      type={element.inputType || 'text'}
    />
  </div>
  );
};

const SwitchComponent: ComponentType = ({ element, appState, onInteraction, className }) => {
  const varName = element.variableName || '';
  const isOn = !!appState.variables[varName];
  return (
  <button
    onClick={() => onInteraction?.(varName, !isOn)}
    className={`w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-colors ${className || ''}`}
  >
    <span className="font-bold text-slate-700">{element.content}</span>
    <div className={`transition-colors ${isOn ? 'text-green-500' : 'text-slate-300'}`}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        {isOn ? (
          <rect x="2" y="6" width="20" height="12" rx="6" fill="currentColor" opacity="0.2"/>
        ) : null}
        <circle cx={isOn ? "18" : "6"} cy="12" r="4" />
      </svg>
    </div>
  </button>
  );
};

const SliderComponent: ComponentType = ({ element, appState, onInteraction, className }) => {
  const varName = element.variableName || '';
  const value = Number(appState.variables[varName] || 0);
  return (
  <div className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm ${className || ''}`}>
    <div className="flex justify-between mb-2">
      <span className="font-bold text-slate-700 text-sm">{element.content}</span>
      <span className="font-mono text-slate-500 text-xs">{value}</span>
    </div>
    <input
      type="range"
      className="w-full h-2 bg-slate-200 rounded-lg accent-blue-500 appearance-none cursor-pointer"
      value={value}
      min={element.min || 0}
      max={element.max || 100}
      step={element.step || 1}
      onChange={(e) => onInteraction?.(varName, Number(e.target.value))}
    />
  </div>
  );
};

const TextComponent: ComponentType = ({ element, className }) => (
  <p className={`text-slate-700 ${element.textSize === 'large' ? 'text-lg font-bold' : 'text-base'} ${className || ''}`}>
    {element.content}
  </p>
);

const ImageComponent: ComponentType = ({ element, className }) => (
  <img
    src={element.imageUrl || '/placeholder.png'}
    alt={element.content || 'Image'}
    className={`w-full rounded-2xl object-cover ${className || ''}`}
    style={{ aspectRatio: element.aspectRatio || '1' }}
  />
);

const CardComponent: ComponentType = ({ element, appState, children, className }) => (
  <div className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 ${className || ''}`}>
    {element.content && <h3 className="font-bold text-slate-800 mb-2">{element.content}</h3>}
    {children}
  </div>
);

const DividerComponent: ComponentType = ({ className }) => (
  <hr className={`border-t-2 border-slate-200 my-4 ${className || ''}`} />
);

const SpacerComponent: ComponentType = ({ element, className }) => (
  <div className={`${className || ''}`} style={{ height: element.height || 16 }} />
);

const LinkComponent: ComponentType = ({ element, className }) => (
  <a
    href={element.url || '#'}
    target="_blank"
    rel="noopener noreferrer"
    className={`text-blue-500 hover:underline font-medium ${className || ''}`}
  >
    {element.content}
  </a>
);

const ProgressBarComponent: ComponentType = ({ element, appState, className }) => {
  const varName = element.variableName || '';
  const value = Number(appState.variables[varName] || 0);
  const max = element.max || 100;
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full bg-slate-200 rounded-full h-4 overflow-hidden ${className || ''}`}>
      <div
        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

const BadgeComponent: ComponentType = ({ element, className }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${className || ''}`}>
    {element.icon && <span className="mr-1">{element.icon}</span>}
    {element.content}
  </span>
);

const AvatarComponent: ComponentType = ({ element, className }) => (
  <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold ${className || ''}`}>
    {element.content?.charAt(0) || '👤'}
  </div>
);

const ChatBubbleComponent: ComponentType = ({ element, className }) => (
  <div className={`max-w-[80%] p-3 rounded-2xl ${element.alignment === 'right' ? 'bg-blue-500 text-white self-end' : 'bg-slate-100 text-slate-800 self-start'} ${className || ''}`}>
    {element.content}
  </div>
);

// Register built-in components
export const registerBuiltInComponents = () => {
  registry.set('button', ButtonComponent);
  registry.set('input', InputComponent);
  registry.set('switch', SwitchComponent);
  registry.set('slider', SliderComponent);
  registry.set('text', TextComponent);
  registry.set('image', ImageComponent);
  registry.set('card', CardComponent);
  registry.set('divider', DividerComponent);
  registry.set('spacer', SpacerComponent);
  registry.set('link', LinkComponent);
  registry.set('progress_bar', ProgressBarComponent);
  registry.set('badge', BadgeComponent);
  registry.set('avatar', AvatarComponent);
  registry.set('chat_bubble', ChatBubbleComponent);
};

// ============================================
// PUBLIC API
// ============================================

/**
 * Register a custom component
 * @param type - Component type name (used in App Builder)
 * @param component - React component
 */
export const registerComponent = (type: string, component: ComponentType) => {
  registry.set(type, component);
};

/**
 * Get a component by type
 * @param type - Component type name
 * @returns Component or undefined
 */
export const getComponent = (type: string): ComponentType | undefined => {
  return registry.get(type);
};

/**
 * Unregister a component
 * @param type - Component type name
 */
export const unregisterComponent = (type: string): boolean => {
  return registry.delete(type);
};

/**
 * List all registered components
 * @returns Array of component type names
 */
export const listComponents = (): string[] => {
  return Array.from(registry.keys());
};

/**
 * Check if a component type exists
 * @param type - Component type name
 * @returns True if registered
 */
export const hasComponent = (type: string): boolean => {
  return registry.has(type);
};

/**
 * Get component metadata for UI
 * @param type - Component type name
 * @returns Component info or null
 */
export const getComponentInfo = (type: string): { name: string; icon: string; category: string } | null => {
  const componentNames: Record<string, { name: string; icon: string; category: string }> = {
    button: { name: 'Button', icon: '🔘', category: 'Interactive' },
    input: { name: 'Input', icon: '⌨️', category: 'Interactive' },
    switch: { name: 'Switch', icon: '🔀', category: 'Interactive' },
    slider: { name: 'Slider', icon: '📊', category: 'Interactive' },
    text: { name: 'Text', icon: '📝', category: 'Content' },
    image: { name: 'Image', icon: '🖼️', category: 'Content' },
    card: { name: 'Card', icon: '🃏', category: 'Layout' },
    divider: { name: 'Divider', icon: '➖', category: 'Layout' },
    spacer: { name: 'Spacer', icon: '📏', category: 'Layout' },
    link: { name: 'Link', icon: '🔗', category: 'Interactive' },
    progress_bar: { name: 'Progress Bar', icon: '📈', category: 'Content' },
    badge: { name: 'Badge', icon: '🏷️', category: 'Content' },
    avatar: { name: 'Avatar', icon: '👤', category: 'Content' },
    chat_bubble: { name: 'Chat Bubble', icon: '💬', category: 'Content' }
  };
  
  if (componentNames[type]) return componentNames[type];
  return componentInfo.get(type) || null;
};

/**
 * Get all components grouped by category
 * @returns Components grouped by category
 */
export const getComponentsByCategory = (): Record<string, Array<{ type: string; name: string; icon: string }>> => {
  const categories: Record<string, Array<{ type: string; name: string; icon: string }>> = {};
  
  registry.forEach((_, type) => {
    const info = getComponentInfo(type);
    if (info) {
      if (!categories[info.category]) {
        categories[info.category] = [];
      }
      categories[info.category].push({ type, name: info.name, icon: info.icon });
    }
  });
  
  return categories;
};

const builtInTypes = new Set<string>();

// Auto-register built-ins on import
if (typeof window !== 'undefined') {
  registerBuiltInComponents();
  registry.forEach((_, type) => { builtInTypes.add(type); });
}

export const searchComponents = (query: string): string[] => {
  const results: string[] = [];
  const lowerQuery = query.toLowerCase();
  registry.forEach((_, type) => {
    if (type.toLowerCase().includes(lowerQuery)) {
      results.push(type);
    } else {
      const info = getComponentInfo(type);
      if (info && info.category.toLowerCase().includes(lowerQuery)) {
        results.push(type);
      }
    }
  });
  return results;
};

export const createCustomComponent = (name: string, icon: string, category: string, component: ComponentType, type?: string): string => {
  const key = type || name.toLowerCase().replace(/\s+/g, '_');
  registerComponent(key, component);
  componentInfo.set(key, { name, icon, category });
  return key;
};

export const isUserComponent = (type: string): boolean => {
  return registry.has(type) && !builtInTypes.has(type);
};

export const getUserComponents = (): Map<string, ComponentType> => {
  const userComps = new Map<string, ComponentType>();
  registry.forEach((comp, type) => {
    if (!builtInTypes.has(type)) {
      userComps.set(type, comp);
    }
  });
  return userComps;
};

export const removeUserComponent = (type: string): boolean => {
  if (builtInTypes.has(type)) return false;
  return unregisterComponent(type);
};

const favorites = new Set<string>();
export const addFavorite = (type: string) => { favorites.add(type); };
export const removeFavorite = (type: string) => { favorites.delete(type); };
export const getFavorites = (): string[] => Array.from(favorites);
export const isFavorite = (type: string): boolean => favorites.has(type);

const usageCounts = new Map<string, number>();
export const trackUsage = (type: string) => {
  usageCounts.set(type, (usageCounts.get(type) || 0) + 1);
};
export const getUsageStats = (): Array<{ type: string; count: number }> => {
  const stats: Array<{ type: string; count: number }> = [];
  usageCounts.forEach((count, type) => { stats.push({ type, count }); });
  return stats.sort((a, b) => b.count - a.count);
};

const dependencies = new Map<string, string[]>();
export const registerDependencies = (type: string, deps: string[]) => {
  dependencies.set(type, deps);
};
export const getDependencies = (type: string): string[] => dependencies.get(type) || [];
export const getDependents = (type: string): string[] => {
  const dependents: string[] = [];
  dependencies.forEach((deps, key) => {
    if (deps.includes(type)) dependents.push(key);
  });
  return dependents;
};
