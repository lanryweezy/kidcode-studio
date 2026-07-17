
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, ArrowLeft, ToggleLeft, ToggleRight, Globe, MessageSquare } from 'lucide-react';
import { AppState, AppElement } from '../types';
import { playSoundEffect } from '../services/soundService';
import { useToast } from './ui/Toast';
import { DEFAULT_SCREEN } from '../constants/actions';

type TransitionType = 'slide-left' | 'slide-right' | 'fade' | 'flip';

interface AppStageProps {
  appState: AppState;
  onNavigate?: (screenName: string) => void;
  onAppInteraction?: (varName: string, value: any) => void;
}

const TRANSITION_STYLES: Record<TransitionType, { enter: React.CSSProperties; active: React.CSSProperties; exit: React.CSSProperties }> = {
  'slide-left': {
    enter: { transform: 'translateX(100%)', opacity: 1 },
    active: { transform: 'translateX(0)', opacity: 1 },
    exit: { transform: 'translateX(-100%)', opacity: 1 },
  },
  'slide-right': {
    enter: { transform: 'translateX(-100%)', opacity: 1 },
    active: { transform: 'translateX(0)', opacity: 1 },
    exit: { transform: 'translateX(100%)', opacity: 1 },
  },
  fade: {
    enter: { opacity: 0 },
    active: { opacity: 1 },
    exit: { opacity: 0 },
  },
  flip: {
    enter: { transform: 'perspective(600px) rotateY(-90deg)', opacity: 0 },
    active: { transform: 'perspective(600px) rotateY(0)', opacity: 1 },
    exit: { transform: 'perspective(600px) rotateY(90deg)', opacity: 0 },
  },
};

const AppStage: React.FC<AppStageProps> = React.memo(({ appState, onNavigate, onAppInteraction }) => {
    const { toast } = useToast();
    const currentAppElements = appState.screens?.[appState.activeScreen] || [];
    const [transitionState, setTransitionState] = useState<'idle' | 'entering' | 'active' | 'exiting'>('idle');
    const [transitionType, setTransitionType] = useState<TransitionType>('fade');
    const [displayedScreen, setDisplayedScreen] = useState(appState.activeScreen);
    const prevScreenRef = useRef(appState.activeScreen);
    const transitionTimerRef = useRef<ReturnType<typeof setTimeout>>();

    const getTransitionForNavigation = useCallback((fromScreen: string, toScreen: string): TransitionType => {
      if (toScreen === DEFAULT_SCREEN) return 'slide-left';
      if (fromScreen === DEFAULT_SCREEN) return 'slide-right';
      const fromIdx = Object.keys(appState.screens).indexOf(fromScreen);
      const toIdx = Object.keys(appState.screens).indexOf(toScreen);
      return toIdx > fromIdx ? 'slide-left' : 'slide-right';
    }, [appState.screens]);

    useEffect(() => {
      if (prevScreenRef.current !== appState.activeScreen && prevScreenRef.current) {
        if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
        const type = getTransitionForNavigation(prevScreenRef.current, appState.activeScreen);
        setTransitionType(type);
        setTransitionState('exiting');
        transitionTimerRef.current = setTimeout(() => {
          setDisplayedScreen(appState.activeScreen);
          setTransitionState('entering');
          transitionTimerRef.current = setTimeout(() => {
            setTransitionState('active');
            setTimeout(() => setTransitionState('idle'), 350);
          }, 30);
        }, 300);
      } else {
        setDisplayedScreen(appState.activeScreen);
        setTransitionState('active');
      }
      prevScreenRef.current = appState.activeScreen;
      return () => { if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current); };
    }, [appState.activeScreen, getTransitionForNavigation]);

    const handleNavigate = useCallback((screenName: string) => {
      onNavigate?.(screenName);
    }, [onNavigate]);

    const handleElementClick = (el: any) => {
        if (el.actionMessage) {
            toast('info', el.actionMessage);
        }
        if (el.targetScreen) {
            handleNavigate(el.targetScreen);
        }
        playSoundEffect('click');
    };

    const handleInputChange = (varName: string, value: any) => {
        onAppInteraction?.(varName, value);
    };

    const elementsToRender = appState.screens?.[displayedScreen] || [];

    const getTransitionStyle = (): React.CSSProperties => {
      const styles = TRANSITION_STYLES[transitionType];
      if (transitionState === 'entering') return styles.enter;
      if (transitionState === 'active' || transitionState === 'idle') return styles.active;
      if (transitionState === 'exiting') return styles.exit;
      return styles.active;
    };

    return (
      <div className="relative w-[340px] h-[680px] bg-slate-900 rounded-[3.5rem] shadow-2xl border-[10px] border-slate-800 overflow-hidden shrink-0 animate-in zoom-in-95 duration-500">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-7 bg-slate-900 rounded-b-2xl z-50 pointer-events-none flex justify-center items-end pb-1.5"><div className="w-16 h-1 bg-slate-800 rounded-full"></div></div>
           
           <div className="w-full h-full bg-white relative overflow-hidden flex flex-col" style={{ backgroundColor: appState.backgroundColor }}>
                <div className="bg-white/80 backdrop-blur-md shrink-0 border-b border-slate-100 p-4 z-30 shadow-sm flex items-center justify-between">
                    {displayedScreen !== DEFAULT_SCREEN && (
                        <button onClick={() => handleNavigate(DEFAULT_SCREEN)} className="p-2 rounded-full hover:bg-slate-100 mr-2 text-slate-500 transition-colors">
                            <ArrowLeft size={20}/>
                        </button>
                    )}
                    <h2 className="text-lg font-black text-slate-800 tracking-tight flex-1 truncate text-center">{appState.title}</h2>
                    <div className="w-8" />
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
                    <div
                      className="flex flex-col gap-4 p-4 min-h-full"
                      style={{
                        ...getTransitionStyle(),
                        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
                      }}
                    >
                        {elementsToRender.map((el: any) => (
                            <div key={el.id} className="animate-pop-in">
                                {el.type === 'button' && (
                                    <button 
                                        onClick={() => handleElementClick(el)}
                                        className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        {el.content}
                                    </button>
                                )}

                                {el.type === 'input' && (
                                    <div className="bg-slate-50 rounded-2xl border-2 border-slate-100 px-4 py-2 flex items-center gap-2 focus-within:border-blue-400 transition-colors">
                                        <Search size={18} className="text-slate-400" />
                                        <input 
                                            className="bg-transparent w-full outline-none text-slate-700 font-medium"
                                            placeholder={el.placeholder || "Type here..."}
                                            value={appState.variables[el.variableName] || ''}
                                            onChange={(e) => handleInputChange(el.variableName, e.target.value)}
                                        />
                                    </div>
                                )}

                                {el.type === 'switch' && (
                                    <button 
                                        onClick={() => handleInputChange(el.variableName, !appState.variables[el.variableName])}
                                        className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-colors"
                                    >
                                        <span className="font-bold text-slate-700">{el.content}</span>
                                        <div className={`transition-colors ${appState.variables[el.variableName] ? 'text-green-500' : 'text-slate-300'}`}>
                                            {appState.variables[el.variableName] ? <ToggleRight size={32} fill="currentColor" /> : <ToggleLeft size={32} />}
                                        </div>
                                    </button>
                                )}

                                {el.type === 'slider' && (
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-bold text-slate-700 text-sm">{el.content}</span>
                                            <span className="font-mono text-slate-500 text-xs">{appState.variables[el.variableName] || 0}</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            className="w-full h-2 bg-slate-200 rounded-lg accent-blue-500 appearance-none cursor-pointer"
                                            value={appState.variables[el.variableName] || 0}
                                            onChange={(e) => handleInputChange(el.variableName, Number(e.target.value))}
                                        />
                                    </div>
                                )}

                                {el.type === 'news_feed' && (
                                    <div className="flex flex-col gap-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">U{i}</div>
                                                    <div>
                                                        <div className="font-bold text-sm text-slate-800">KidCoder_{i}</div>
                                                        <div className="text-[10px] text-slate-400">2 hours ago</div>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-600 mb-3">{el.content} #{i}</p>
                                                <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs">Image Placeholder</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {el.type === 'chat_bubble' && (
                                    <div className={`flex gap-3 ${el.alignment === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">AI</div>
                                        <div className={`p-3 rounded-2xl shadow-sm text-sm max-w-[80%] ${el.alignment === 'right' ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                                            {el.content}
                                        </div>
                                    </div>
                                )}

                                {el.type === 'image' && (
                                    <img src={el.content} className="w-full rounded-2xl shadow-sm border border-slate-100 object-cover" alt="App Image" loading="lazy" />
                                )}

                                {el.type === 'text' && (
                                    <p className={`font-medium ${el.textSize === 'xl' ? 'text-2xl font-black' : el.textSize === 'lg' ? 'text-xl font-bold' : 'text-base'}`} style={{ color: el.color || '#334155' }}>
                                        {el.content}
                                    </p>
                                )}
                                
                                {el.type === 'divider' && <div className="h-px bg-slate-200 my-2" />}
                                
                                {el.type === 'spacer' && <div style={{ height: `${el.max || 20  }px` }} />}
                            </div>
                        ))}
                    </div>
                </div>
           </div>
           
           <div className="absolute bottom-0 w-full h-10 bg-white/90 backdrop-blur border-t border-slate-100 flex items-center justify-center pointer-events-auto cursor-pointer hover:bg-slate-50 transition-colors z-50" onClick={() => handleNavigate(DEFAULT_SCREEN)}>
               <div className="w-32 h-1 bg-slate-300 rounded-full"></div>
           </div>
      </div>
    );
});

export default AppStage;
