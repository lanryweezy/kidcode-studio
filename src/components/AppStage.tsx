
import React from 'react';
import { Search, ArrowLeft, ToggleLeft, ToggleRight, Globe, MessageSquare } from 'lucide-react';
import { AppState, AppElement } from '../types';
import { playSoundEffect } from '../services/soundService';

interface AppStageProps {
  appState: AppState;
  onNavigate?: (screenName: string) => void;
  onAppInteraction?: (varName: string, value: any) => void;
}

const AppStage: React.FC<AppStageProps> = React.memo(({ appState, onNavigate, onAppInteraction }) => {
    const currentAppElements = appState.screens?.[appState.activeScreen] || [];
    
    const handleElementClick = (el: any) => {
        if (el.actionMessage) {
            alert(el.actionMessage);
        }
        if (el.targetScreen) {
            onNavigate?.(el.targetScreen);
        }
        playSoundEffect('click');
    };

    const handleInputChange = (varName: string, value: any) => {
        onAppInteraction?.(varName, value);
    };

    return (
      <div className="relative w-[340px] h-[680px] bg-slate-900 rounded-[3.5rem] shadow-2xl border-[10px] border-slate-800 overflow-hidden shrink-0 animate-in zoom-in-95 duration-500">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-7 bg-slate-900 rounded-b-2xl z-50 pointer-events-none flex justify-center items-end pb-1.5"><div className="w-16 h-1 bg-slate-800 rounded-full"></div></div>
           
           <div className="w-full h-full bg-white relative overflow-y-auto" style={{ backgroundColor: appState.backgroundColor }}>
                <div className="bg-white/80 backdrop-blur-md sticky top-0 border-b border-slate-100 p-4 z-30 shadow-sm flex items-center justify-between">
                    {appState.activeScreen !== 'main' && (
                        <button onClick={() => onNavigate?.('main')} className="p-2 rounded-full hover:bg-slate-100 mr-2 text-slate-500 transition-colors">
                            <ArrowLeft size={20}/>
                        </button>
                    )}
                    <h2 className="text-lg font-black text-slate-800 tracking-tight flex-1 truncate text-center">{appState.title}</h2>
                    <div className="w-8" />
                </div>

                <div className="p-4 space-y-4 min-h-[500px]">
                    {currentAppElements.map((el: any) => (
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
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{el.content}</span>
                                        <span className="font-mono text-slate-500 text-xs">{appState.variables[el.variableName] || 0}</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg accent-blue-500 appearance-none cursor-pointer"
                                        value={appState.variables[el.variableName] || 0}
                                        onChange={(e) => handleInputChange(el.variableName, Number(e.target.value))}
                                    />
                                </div>
                            )}

                            {el.type === 'news_feed' && (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">U{i}</div>
                                                <div>
                                                    <div className="font-bold text-sm text-slate-800 dark:text-slate-200">KidCoder_{i}</div>
                                                    <div className="text-[10px] text-slate-400">2 hours ago</div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{el.content} #{i}</p>
                                            <div className="aspect-video bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 text-xs">Image Placeholder</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {el.type === 'chat_bubble' && (
                                <div className={`flex gap-3 ${el.alignment === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">AI</div>
                                    <div className={`p-3 rounded-2xl shadow-sm text-sm max-w-[80%] ${el.alignment === 'right' ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'}`}>
                                        {el.content}
                                    </div>
                                </div>
                            )}

                            {el.type === 'image' && (
                                <img src={el.content} className="w-full rounded-2xl shadow-sm border border-slate-100 object-cover" alt="App Image" />
                            )}

                            {el.type === 'text' && (
                                <p className={`font-medium ${el.textSize === 'xl' ? 'text-2xl font-black' : el.textSize === 'lg' ? 'text-xl font-bold' : 'text-base'}`} style={{ color: el.color || '#334155' }}>
                                    {el.content}
                                </p>
                            )}
                            
                            {el.type === 'divider' && <div className="h-px bg-slate-200 my-2" />}
                            
                            {el.type === 'spacer' && <div style={{ height: (el.max || 20) + 'px' }} />}
                        </div>
                    ))}
                </div>
           </div>
           
           <div className="absolute bottom-0 w-full h-10 bg-white/90 backdrop-blur border-t border-slate-100 flex items-center justify-center pointer-events-auto cursor-pointer hover:bg-slate-50 transition-colors z-50" onClick={() => onNavigate?.('main')}>
               <div className="w-32 h-1 bg-slate-300 rounded-full"></div>
           </div>
      </div>
    );
});

export default AppStage;
