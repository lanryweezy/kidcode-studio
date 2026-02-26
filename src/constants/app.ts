import { AppMode, AppState, CommandType } from '../types';
import {
    Layout, Gamepad2, Cpu, Box, MousePointer2, MessageSquare, TextCursorInput, Image, ToggleRight, CheckSquare, SlidersHorizontal, BarChart3, List, Pencil, MapPin, Video, Camera, Activity, Calendar, Palette, Mic, Minus, ArrowUp
} from 'lucide-react';

export const INITIAL_APP_STATE: AppState = {
    title: 'My Cool App',
    backgroundColor: '#ffffff',
    activeScreen: 'main',
    screens: { 'main': [] },
    score: 0,
    variables: {},
    activeLevelTool: undefined
};

export const MODE_CONFIG = {
    [AppMode.APP]: { label: 'App Maker', color: 'bg-blue-500', icon: Layout },
    [AppMode.GAME]: { label: 'Game Builder', color: 'bg-orange-500', icon: Gamepad2 },
    [AppMode.HARDWARE]: { label: 'Circuit Lab', color: 'bg-emerald-500', icon: Cpu }
};

export const UI_PALETTE = [
    { type: CommandType.ADD_BUTTON, label: 'Button', icon: MousePointer2, color: 'bg-blue-600' },
    { type: CommandType.ADD_TEXT_BLOCK, label: 'Text Block', icon: MessageSquare, color: 'bg-indigo-500' },
    { type: CommandType.ADD_INPUT, label: 'Input Field', icon: TextCursorInput, color: 'bg-teal-500' },
    { type: CommandType.ADD_IMAGE, label: 'Image', icon: Image, color: 'bg-fuchsia-500' },
    { type: CommandType.ADD_SWITCH, label: 'Switch', icon: ToggleRight, color: 'bg-emerald-600' },
    { type: CommandType.ADD_CHECKBOX, label: 'Checkbox', icon: CheckSquare, color: 'bg-emerald-500' },
    { type: CommandType.ADD_SLIDER, label: 'Slider', icon: SlidersHorizontal, color: 'bg-cyan-600' },
    { type: CommandType.ADD_PROGRESS, label: 'Progress Bar', icon: BarChart3, color: 'bg-green-600' },
    { type: CommandType.ADD_LIST_VIEW, label: 'List View', icon: List, color: 'bg-amber-500' },
    { type: CommandType.ADD_DRAWING_CANVAS, label: 'Drawing Canvas', icon: Pencil, color: 'bg-purple-600' },
    { type: CommandType.ADD_MAP, label: 'Map', icon: MapPin, color: 'bg-orange-500' },
    { type: CommandType.ADD_VIDEO, label: 'Video Player', icon: Video, color: 'bg-red-500' },
    { type: CommandType.ADD_CAMERA, label: 'Camera View', icon: Camera, color: 'bg-slate-800' },
    { type: CommandType.ADD_CHART, label: 'Chart', icon: Activity, color: 'bg-purple-500' },
    { type: CommandType.ADD_DATE_PICKER, label: 'Date', icon: Calendar, color: 'bg-blue-400' },
    { type: CommandType.ADD_COLOR_PICKER, label: 'Color Picker', icon: Palette, color: 'bg-pink-500' },
    { type: CommandType.ADD_AUDIO_RECORDER, label: 'Audio Recorder', icon: Mic, color: 'bg-rose-600' },
    { type: CommandType.ADD_DIVIDER, label: 'Divider', icon: Minus, color: 'bg-slate-400' },
    { type: CommandType.ADD_SPACER, label: 'Spacer', icon: ArrowUp, color: 'bg-slate-300' },
];
