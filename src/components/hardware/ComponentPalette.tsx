import React from 'react';
import { CircuitTemplate } from '../../constants/circuitTemplates';
import { ValidationResult } from '../../services/circuitValidator';
import { WaveformType } from '../../services/waveformGenerator';
import { COMPONENT_LABELS, PIN_INFO, getPinTypeLabel, getPinTypeColor } from './PinManager';
import { HardwareState } from '../../types';
import { formatValue } from '../../services/circuitSimulator';
import {
    Usb, Zap, AlertTriangle, CheckCircle, XCircle, Link, Unlink, RotateCw,
    Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, Trash2, Download, FileCode,
    Image, BookOpen, Brain, Eye, Ruler, Activity, Cpu, Copy, Clipboard,
    HelpCircle, Minimize2, Map, Calculator, Search, Terminal, GitBranch,
} from 'lucide-react';
import { Box } from 'lucide-react';

interface ToolbarProps {
    isBoardConnected: boolean;
    wiringMode: boolean;
    voltmeterMode: boolean;
    showTemplates: boolean;
    showExport: boolean;
    quizMode: boolean;
    validation: ValidationResult | null;
    showValidation: boolean;
    showOhmCalc: boolean;
    showShortcutsOverlay: boolean;
    is3DView: boolean;
    onConnect: () => void;
    onToggleWiring: () => void;
    onToggleVoltmeter: () => void;
    onToggleTemplates: () => void;
    onToggleExport: () => void;
    onStartQuiz: () => void;
    onToggleValidation: () => void;
    onToggleOhmCalc: () => void;
    onToggleShortcuts: () => void;
    onToggle3D: () => void;
}

export const HardwareToolbar: React.FC<ToolbarProps> = ({
    isBoardConnected, wiringMode, voltmeterMode, showTemplates, showExport,
    quizMode, validation, showValidation, showOhmCalc, showShortcutsOverlay,
    is3DView, onConnect, onToggleWiring, onToggleVoltmeter, onToggleTemplates,
    onToggleExport, onStartQuiz, onToggleValidation, onToggleOhmCalc,
    onToggleShortcuts, onToggle3D,
}) => (
    <div className="absolute top-2 right-2 z-50 flex gap-1">
        <button onClick={onConnect}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg font-black text-[9px] uppercase tracking-tighter shadow-lg transition-all active:scale-95 ${isBoardConnected ? 'bg-emerald-500 text-white animate-pulse-glow' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            <Usb size={11} /> {isBoardConnected ? 'CONNECTED' : 'CONNECT'}
        </button>
        <button onClick={onToggleWiring}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg font-black text-[9px] uppercase tracking-tighter shadow-lg transition-all active:scale-95 ${wiringMode ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            {wiringMode ? <Unlink size={11} /> : <Link size={11} />}
            {wiringMode ? 'WIRING' : 'WIRE'}
        </button>
        <button onClick={onToggleVoltmeter}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg font-black text-[9px] uppercase tracking-tighter shadow-lg transition-all active:scale-95 ${voltmeterMode ? 'bg-cyan-500 text-black' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            <Ruler size={11} />
            {voltmeterMode ? 'PROBE' : 'V-METER'}
        </button>
        <button onClick={onToggleTemplates}
            className="flex items-center gap-1 px-2 py-1 rounded-lg font-black text-[9px] uppercase tracking-tighter shadow-lg transition-all active:scale-95 bg-slate-700 text-slate-300 hover:bg-slate-600">
            <BookOpen size={11} /> TEMPLATES
        </button>
        <button onClick={onToggleExport}
            className="flex items-center gap-1 px-2 py-1 rounded-lg font-black text-[9px] uppercase tracking-tighter shadow-lg transition-all active:scale-95 bg-slate-700 text-slate-300 hover:bg-slate-600">
            <Download size={11} /> EXPORT
        </button>
        <button onClick={onStartQuiz}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg font-black text-[9px] uppercase tracking-tighter shadow-lg transition-all active:scale-95 ${quizMode ? 'bg-violet-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            <Brain size={11} /> QUIZ
        </button>
        <button onClick={onToggleValidation}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg font-black text-[9px] uppercase tracking-tighter shadow-lg transition-all active:scale-95 ${
                validation && validation.errors.length > 0 ? 'bg-red-500 text-white' :
                validation && validation.warnings.length > 0 ? 'bg-yellow-500 text-black' :
                'bg-emerald-500 text-white'
            }`}>
            {validation && validation.errors.length > 0 ? <XCircle size={11} /> :
             validation && validation.warnings.length > 0 ? <AlertTriangle size={11} /> :
             <CheckCircle size={11} />}
            CHECK
        </button>
        <button onClick={onToggleOhmCalc}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg font-black text-[9px] uppercase tracking-tighter shadow-lg transition-all active:scale-95 ${showOhmCalc ? 'bg-violet-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            <Calculator size={11} /> OHM
        </button>
        <button onClick={onToggleShortcuts}
            className="flex items-center gap-1 px-2 py-1 rounded-lg font-black text-[9px] uppercase tracking-tighter shadow-lg transition-all active:scale-95 bg-slate-700 text-slate-300 hover:bg-slate-600">
            <HelpCircle size={11} /> ?
        </button>
        <button onClick={onToggle3D}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg font-black text-[9px] uppercase tracking-tighter shadow-lg transition-all active:scale-95 ${is3DView ? 'bg-violet-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            <Box size={11} /> 3D
        </button>
    </div>
);

interface SelectionToolbarProps {
    count: number;
    onRotate: () => void;
    onDelete: () => void;
    onDeselect: () => void;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
    count, onRotate, onDelete, onDeselect,
}) => (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 bg-slate-800/95 rounded-lg px-3 py-1.5 shadow-lg border border-slate-600">
        <span className="text-[10px] font-bold text-slate-300">{count} selected</span>
        <div className="w-px h-3 bg-slate-600" />
        <button onClick={onRotate} className="p-1 text-slate-400 hover:text-yellow-400 transition-colors" title="Rotate (R)">
            <RotateCw size={13} />
        </button>
        <button onClick={onDelete} className="p-1 text-slate-400 hover:text-red-400 transition-colors" title="Delete (Del)">
            <Trash2 size={13} />
        </button>
        <button onClick={onDeselect} className="p-1 text-slate-400 hover:text-white transition-colors" title="Deselect">
            <XCircle size={13} />
        </button>
    </div>
);

interface ZoomControlsProps {
    zoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onZoomReset: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
    zoom, onZoomIn, onZoomOut, onZoomReset,
}) => (
    <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-slate-800/90 rounded-lg px-2 py-1 shadow-lg border border-slate-700">
        <button onClick={onZoomOut} className="p-1 text-slate-400 hover:text-white transition-colors" title="Zoom Out">
            <ZoomOut size={14} />
        </button>
        <span className="text-[10px] font-mono text-slate-300 w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={onZoomIn} className="p-1 text-slate-400 hover:text-white transition-colors" title="Zoom In">
            <ZoomIn size={14} />
        </button>
        <div className="w-px h-3 bg-slate-600 mx-1" />
        <button onClick={onZoomReset} className="p-1 text-slate-400 hover:text-white transition-colors" title="Reset View">
            <Maximize2 size={14} />
        </button>
    </div>
);

interface ValidationPanelProps {
    validation: ValidationResult;
    onClose: () => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({ validation, onClose }) => (
    <div className="w-[600px] bg-white rounded-xl border border-slate-200 shadow-lg p-3 max-h-[200px] overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">Circuit Check</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
        </div>
        {validation.errors.length === 0 && validation.warnings.length === 0 && validation.infos.length === 0 && (
            <div className="flex items-center gap-2 text-emerald-600 text-sm py-2">
                <CheckCircle size={16} />
                <span className="font-bold">Circuit looks good!</span>
            </div>
        )}
        {validation.errors.map(err => (
            <div key={err.id} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg mb-1.5">
                <XCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                    <div className="text-xs font-bold text-red-700">{err.message}</div>
                    <div className="text-[10px] text-red-500">{err.suggestion}</div>
                </div>
            </div>
        ))}
        {validation.warnings.map(warn => (
            <div key={warn.id} className="flex items-start gap-2 p-2 bg-yellow-50 rounded-lg mb-1.5">
                <AlertTriangle size={14} className="text-yellow-500 mt-0.5 shrink-0" />
                <div>
                    <div className="text-xs font-bold text-yellow-700">{warn.message}</div>
                    <div className="text-[10px] text-yellow-500">{warn.suggestion}</div>
                </div>
            </div>
        ))}
        {validation.infos.map(info => (
            <div key={info.id} className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg mb-1.5">
                <Zap size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <div>
                    <div className="text-xs font-bold text-blue-700">{info.message}</div>
                    <div className="text-[10px] text-blue-500">{info.suggestion}</div>
                </div>
            </div>
        ))}
    </div>
);

interface TemplatesPanelProps {
    templates: CircuitTemplate[];
    onLoad: (template: CircuitTemplate) => void;
    onClose: () => void;
}

export const TemplatesPanel: React.FC<TemplatesPanelProps> = ({ templates, onLoad, onClose }) => (
    <div className="w-[600px] bg-white rounded-xl border border-slate-200 shadow-lg p-3 max-h-[300px] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1"><BookOpen size={12} /> Circuit Templates</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
            {templates.map(tpl => (
                <button key={tpl.id} onClick={() => onLoad(tpl)}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-emerald-400 transition-all text-left group">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{tpl.icon}</span>
                        <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-600">{tpl.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">{tpl.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${tpl.difficulty === 'beginner' ? 'bg-green-100 text-green-700' : tpl.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {tpl.difficulty}
                        </span>
                        <span className="text-[8px] text-slate-400">{tpl.components.length} parts</span>
                    </div>
                    <div className="mt-2 text-[9px] text-slate-400 text-left">
                        {tpl.tutorial[0]}
                    </div>
                </button>
            ))}
        </div>
    </div>
);

interface ExportPanelProps {
    onExportSVG: () => void;
    onExportPNG: () => void;
    onExportArduino: () => void;
    onExportPython: () => void;
    onClose: () => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
    onExportSVG, onExportPNG, onExportArduino, onExportPython, onClose,
}) => (
    <div className="w-[400px] bg-white rounded-xl border border-slate-200 shadow-lg p-3">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1"><Download size={12} /> Export Circuit</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
        </div>
        <div className="space-y-2">
            <button onClick={onExportSVG} className="w-full flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-400 transition-all text-left">
                <Image size={16} className="text-blue-500" />
                <div>
                    <div className="text-xs font-bold text-slate-700">Save as SVG</div>
                    <div className="text-[10px] text-slate-400">Vector image, scalable, small file</div>
                </div>
            </button>
            <button onClick={onExportPNG} className="w-full flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-green-400 transition-all text-left">
                <Image size={16} className="text-green-500" />
                <div>
                    <div className="text-xs font-bold text-slate-700">Save as PNG</div>
                    <div className="text-[10px] text-slate-400">Raster image, 1200x800px</div>
                </div>
            </button>
            <button onClick={onExportArduino} className="w-full flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-amber-400 transition-all text-left">
                <FileCode size={16} className="text-amber-500" />
                <div>
                    <div className="text-xs font-bold text-slate-700">Arduino Code</div>
                    <div className="text-[10px] text-slate-400">.ino sketch with auto-generated setup/loop</div>
                </div>
            </button>
            <button onClick={onExportPython} className="w-full flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-emerald-400 transition-all text-left">
                <FileCode size={16} className="text-emerald-500" />
                <div>
                    <div className="text-xs font-bold text-slate-700">Python Code</div>
                    <div className="text-[10px] text-slate-400">MicroPython for ESP32 / Raspberry Pi</div>
                </div>
            </button>
        </div>
    </div>
);

interface QuizPanelProps {
    quizComponent: string | null;
    quizOptions: string[];
    quizScore: { correct: number; total: number };
    quizFeedback: string | null;
    onAnswer: (answer: string) => void;
    onNewQuestion: () => void;
    onClose: () => void;
}

export const QuizPanel: React.FC<QuizPanelProps> = ({
    quizComponent, quizOptions, quizScore, quizFeedback,
    onAnswer, onNewQuestion, onClose,
}) => (
    <div className="w-[400px] bg-white rounded-xl border border-slate-200 shadow-lg p-4">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1"><Brain size={12} /> Component Quiz</h3>
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-slate-400">{quizScore.correct}/{quizScore.total}</span>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
            </div>
        </div>
        {quizComponent && (
            <div className="text-center">
                <div className="text-[10px] text-slate-400 mb-2">What component is this?</div>
                <div className="inline-block p-4 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 mb-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center">
                        <span className="text-2xl font-black text-slate-400">{quizComponent.slice(0, 4)}</span>
                    </div>
                </div>
                {quizFeedback ? (
                    <div className={`text-sm font-bold py-2 ${quizFeedback.startsWith('\u2713') ? 'text-emerald-500' : 'text-red-500'}`}>
                        {quizFeedback}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {quizOptions.map(opt => (
                            <button key={opt} onClick={() => onAnswer(opt)}
                                className="p-2 bg-slate-50 rounded-lg border border-slate-200 hover:border-violet-400 hover:bg-violet-50 transition-all text-xs font-bold text-slate-700">
                                {opt}
                            </button>
                        ))}
                    </div>
                )}
                <div className="mt-3 flex justify-center gap-2">
                    <button onClick={onNewQuestion} className="px-3 py-1 bg-violet-500 text-white rounded-lg text-[10px] font-bold hover:bg-violet-600 transition-colors">
                        New Question
                    </button>
                    <button onClick={onClose} className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-300 transition-colors">
                        End Quiz
                    </button>
                </div>
            </div>
        )}
    </div>
);

interface OhmCalcPanelProps {
    ohmV: number;
    ohmI: number;
    ohmR: number;
    ohmMode: 'V' | 'I' | 'R';
    onSetV: (v: number) => void;
    onSetI: (i: number) => void;
    onSetR: (r: number) => void;
    onSetMode: (m: 'V' | 'I' | 'R') => void;
    onCalculate: () => void;
    onClose: () => void;
}

export const OhmCalcPanel: React.FC<OhmCalcPanelProps> = ({
    ohmV, ohmI, ohmR, ohmMode, onSetV, onSetI, onSetR, onSetMode, onCalculate, onClose,
}) => (
    <div className="w-[400px] bg-white rounded-xl border border-slate-200 shadow-lg p-4">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1"><Calculator size={12} /> Ohm's Law Calculator</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
        </div>
        <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
                {(['V', 'I', 'R'] as const).map(unit => (
                    <button key={unit} onClick={() => { onSetMode(unit); onCalculate(); }}
                        className={`p-2 rounded-lg text-center transition-all ${ohmMode === unit ? 'bg-violet-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <div className="text-lg font-black">{unit}</div>
                        <div className="text-[9px]">{unit === 'V' ? 'Voltage' : unit === 'I' ? 'Current' : 'Resistance'}</div>
                    </button>
                ))}
            </div>
            <div className="space-y-2">
                {ohmMode !== 'V' && (
                    <div>
                        <label className="text-[10px] text-slate-400">Voltage (V)</label>
                        <input type="number" value={ohmV} onChange={e => onSetV(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono" />
                    </div>
                )}
                {ohmMode !== 'I' && (
                    <div>
                        <label className="text-[10px] text-slate-400">Current (A)</label>
                        <input type="number" value={ohmI} onChange={e => onSetI(Number(e.target.value))} step="0.001"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono" />
                    </div>
                )}
                {ohmMode !== 'R' && (
                    <div>
                        <label className="text-[10px] text-slate-400">Resistance (ohm)</label>
                        <input type="number" value={ohmR} onChange={e => onSetR(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono" />
                    </div>
                )}
            </div>
            <button onClick={onCalculate} className="w-full py-2 bg-violet-500 text-white rounded-lg text-sm font-bold hover:bg-violet-600 transition-colors">
                Calculate
            </button>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
                <div className="text-[10px] text-slate-400 mb-1">Result ({ohmMode === 'V' ? 'Voltage' : ohmMode === 'I' ? 'Current' : 'Resistance'})</div>
                <div className="text-2xl font-black text-slate-800 font-mono">
                    {ohmMode === 'V' ? `${ohmV.toFixed(2)} V` : ohmMode === 'I' ? `${(ohmI * 1000).toFixed(1)} mA` : `${ohmR.toFixed(1)} ohm`}
                </div>
            </div>
            <div className="text-[10px] text-slate-400 text-center">V = I x R &nbsp;|&nbsp; I = V / R &nbsp;|&nbsp; R = V / I</div>
        </div>
    </div>
);

export const ShortcutsOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black text-slate-800">Keyboard Shortcuts</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                    ['R', 'Rotate selected'],
                    ['Del', 'Delete selected'],
                    ['Space', 'Toggle component'],
                    ['W', 'Wire mode'],
                    ['V', 'Voltmeter'],
                    ['Esc', 'Deselect / Exit'],
                    ['Ctrl+Z', 'Undo'],
                    ['Ctrl+Y', 'Redo'],
                    ['Ctrl+C', 'Copy'],
                    ['Ctrl+V', 'Paste'],
                    ['Ctrl+D', 'Duplicate'],
                    ['Ctrl+A', 'Select all'],
                    ['Ctrl++/-', 'Zoom in/out'],
                    ['Ctrl+0', 'Reset zoom'],
                    ['?', 'Show this help'],
                ].map(([key, desc]) => (
                    <div key={key} className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg">
                        <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-[10px] font-mono font-bold text-slate-700 min-w-[40px] text-center">{key}</kbd>
                        <span className="text-slate-600">{desc}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

interface TooltipProps {
    hoveredComponent: { type: string; pin: number; resistance?: number; voltage?: number } | null;
    hoveredPin: { pin: number; x: number; y: number } | null;
    hardwareState: HardwareState;
    zoom: number;
    pan: { x: number; y: number };
    containerWidth: number;
}

export const ComponentTooltip: React.FC<TooltipProps> = ({
    hoveredComponent, hoveredPin, hardwareState, zoom, pan, containerWidth,
}) => (
    <>
        {hoveredPin && (
            <div className="absolute z-50 pointer-events-none bg-slate-900/95 text-white px-2 py-1 rounded-lg text-[10px] font-mono shadow-lg border border-slate-600"
                style={{ left: Math.min(hoveredPin.x * zoom + pan.x, containerWidth - 100), top: Math.max(hoveredPin.y * zoom + pan.y - 24, 4) }}>
                <span className="font-bold" style={{ color: getPinTypeColor(PIN_INFO[hoveredPin.pin]?.type || 'digital') }}>{getPinTypeLabel(hoveredPin.pin)}</span>
                <span className="text-slate-400 ml-1">{PIN_INFO[hoveredPin.pin]?.type || 'digital'}</span>
                <span className="text-slate-500 ml-1">{hardwareState.pins[hoveredPin.pin] ? '\u25cf HIGH' : '\u25cb LOW'}</span>
            </div>
        )}
        {hoveredComponent && (
            <div className="absolute z-50 pointer-events-none bg-slate-900/95 text-white px-3 py-2 rounded-lg text-xs shadow-xl border border-slate-600 max-w-[200px]"
                style={{ left: Math.min(12, containerWidth - 210), top: 12 }}>
                <div className="font-bold text-emerald-400">{COMPONENT_LABELS[hoveredComponent.type] || hoveredComponent.type}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{hoveredComponent.type}</div>
                {hoveredComponent.resistance !== undefined && (
                    <div className="text-[10px] text-slate-300 mt-1">R: {formatValue(hoveredComponent.resistance, 'ohm')}</div>
                )}
                {hoveredComponent.voltage !== undefined && (
                    <div className="text-[10px] text-slate-300 mt-0.5">V: {hoveredComponent.voltage}V</div>
                )}
                <div className="text-[10px] text-slate-500 mt-1">Pin {hoveredComponent.pin} - Click to edit</div>
            </div>
        )}
    </>
);

interface PowerAnalysisProps {
    hardwareState: HardwareState;
}

export const PowerAnalysisPanel: React.FC<PowerAnalysisProps> = ({ hardwareState }) => {
    if (hardwareState.powerDraw === undefined) return null;
    return (
        <div className="absolute top-14 right-2 bg-black/80 text-emerald-400 font-mono text-xs p-2 rounded border border-emerald-900/50 shadow-xl pointer-events-none w-36">
            <div className="text-emerald-700 text-[10px] mb-1 flex items-center gap-1"><Cpu size={10} /> POWER ANALYSIS</div>
            <div className="flex justify-between"><span>Total:</span> <span>{hardwareState.powerDraw.toFixed(1)} mW</span></div>
            <div className="flex justify-between"><span>Current:</span> <span>{((hardwareState.powerDraw || 0) / 5000 * 1000).toFixed(1)} mA</span></div>
            {hardwareState.powerDraw > 500 && (
                <div className="mt-1 text-[9px] text-yellow-400 flex items-center gap-1">
                    <AlertTriangle size={9} /> USB limit (500mA) exceeded!
                </div>
            )}
            <div className="mt-1 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.min(100, (hardwareState.powerDraw / 1000) * 100)}%` }} />
            </div>
        </div>
    );
};
