import React, { useState } from 'react';
import {
  X, BookOpen, Rocket, Blocks, Gamepad2, Cpu, Lightbulb,
  HelpCircle, ChevronDown, Keyboard, Zap,
  ArrowRight, Play, Save, CircleDot, Sparkles,
  AlertTriangle, MessageCircle, Layout, Gauge
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { SHORTCUT_GROUPS } from './ui/ShortcutsOverlay';

type Tab = 'getting-started' | 'blocks' | 'game-modes' | 'tips' | 'faq';

const tabs: { id: Tab; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'getting-started', label: 'Getting Started', icon: <Rocket size={18} />, color: 'text-blue-500' },
  { id: 'blocks', label: 'Block Reference', icon: <Blocks size={18} />, color: 'text-violet-500' },
  { id: 'game-modes', label: 'Game Modes', icon: <Gamepad2 size={18} />, color: 'text-orange-500' },
  { id: 'tips', label: 'Tips & Tricks', icon: <Lightbulb size={18} />, color: 'text-amber-500' },
  { id: 'faq', label: 'FAQ', icon: <HelpCircle size={18} />, color: 'text-emerald-500' },
];

const gettingStartedSteps = [
  { step: 1, title: 'Create Your First Project', icon: <CircleDot size={20} />, desc: 'Click "New Project" from the home screen. Choose a template or start from scratch. Give your project a fun name!', color: 'bg-blue-500' },
  { step: 2, title: 'Add Blocks to the Workspace', icon: <Blocks size={20} />, desc: 'Drag blocks from the toolbox on the left into the workspace. Connect them like puzzle pieces to build your logic.', color: 'bg-violet-500' },
  { step: 3, title: 'Run Your Game/App', icon: <Play size={20} />, desc: 'Press the big green "Run" button or hit Ctrl+R to see your creation come to life in the preview panel!', color: 'bg-emerald-500' },
  { step: 4, title: 'Save and Share', icon: <Save size={20} />, desc: 'Hit Ctrl+S to save your work. Click "Share" to show your project to friends or teachers!', color: 'bg-amber-500' },
];

const blockCategories = [
  {
    category: 'Movement Blocks',
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    blocks: [
      { name: 'Move Forward', desc: 'Moves the character forward by a set number of steps.', example: 'Walk a character across the screen.' },
      { name: 'Turn Left/Right', desc: 'Rotates the character in a direction.', example: 'Make a character spin or change direction.' },
      { name: 'Set Position', desc: 'Teleports the character to exact coordinates.', example: 'Reset character to starting position.' },
      { name: 'Move to Mouse', desc: 'Makes the character follow the mouse cursor.', example: 'Build a following enemy.' },
    ]
  },
  {
    category: 'Event Blocks',
    color: 'bg-violet-500',
    textColor: 'text-violet-600',
    borderColor: 'border-violet-200',
    blocks: [
      { name: 'When Game Starts', desc: 'Runs code when the game begins.', example: 'Initialize score or spawn enemies.' },
      { name: 'When Key Pressed', desc: 'Triggers when a keyboard key is pressed.', example: 'Player movement or shooting.' },
      { name: 'When Clicked', desc: 'Triggers when the mouse clicks something.', example: 'Button presses or UI interactions.' },
      { name: 'When Touching', desc: 'Triggers when two objects collide.', example: 'Collecting coins or taking damage.' },
    ]
  },
  {
    category: 'Logic Blocks',
    color: 'bg-amber-500',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    blocks: [
      { name: 'If / Then', desc: 'Runs code only if a condition is true.', example: 'Check if player health is above zero.' },
      { name: 'Loop', desc: 'Repeats code multiple times.', example: 'Spawn 10 enemies in a row.' },
      { name: 'Compare', desc: 'Checks if two values are equal, greater, or less.', example: 'Check if score is high enough to win.' },
      { name: 'And / Or', desc: 'Combines multiple conditions.', example: 'Check if player has key AND door is locked.' },
    ]
  },
  {
    category: 'Math Blocks',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    blocks: [
      { name: 'Add / Subtract', desc: 'Performs basic arithmetic on numbers.', example: 'Add 10 points to the score.' },
      { name: 'Random Number', desc: 'Generates a random number in a range.', example: 'Random enemy spawn position.' },
      { name: 'Round / Floor', desc: 'Rounds numbers up or down.', example: 'Display whole number scores.' },
      { name: 'Distance', desc: 'Calculates distance between two points.', example: 'Detect how close enemies are.' },
    ]
  },
  {
    category: 'Sound Blocks',
    color: 'bg-pink-500',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-200',
    blocks: [
      { name: 'Play Sound', desc: 'Plays a sound effect or music.', example: 'Coin collect sound or background music.' },
      { name: 'Stop Sound', desc: 'Stops all currently playing sounds.', example: 'Silence music on pause screen.' },
      { name: 'Set Volume', desc: 'Changes the volume level.', example: 'Volume slider in settings.' },
      { name: 'Play Note', desc: 'Plays a specific musical note.', example: 'Create a simple melody.' },
    ]
  },
  {
    category: 'Hardware Blocks',
    color: 'bg-cyan-500',
    textColor: 'text-cyan-600',
    borderColor: 'border-cyan-200',
    blocks: [
      { name: 'Read Sensor', desc: 'Gets data from a connected sensor.', example: 'Read temperature from a thermometer.' },
      { name: 'Control LED', desc: 'Turns LEDs on or off.', example: 'Light up a traffic light circuit.' },
      { name: 'Logic Gate', desc: 'AND, OR, NOT operations.', example: 'Build a simple computer circuit.' },
      { name: 'Send Signal', desc: 'Sends data to another device.', example: 'Send a message from one board to another.' },
    ]
  },
];

const gameModeGuides = [
  {
    title: 'Building a 2D Game',
    icon: <Gamepad2 size={24} />,
    color: 'bg-orange-500',
    tips: [
      'Start with the Game Maker mode to access the tile map editor.',
      'Use Movement blocks to control your character.',
      'Add Event blocks like "When Key Pressed" for player controls.',
      'Use the Collision blocks to detect when the player touches objects.',
      'Add Sound blocks for background music and sound effects.',
      'Test often — hit Run after every few blocks to see your progress!',
    ]
  },
  {
    title: 'Building a 3D Game',
    icon: <Sparkles size={24} />,
    color: 'bg-violet-500',
    tips: [
      'Switch to the 3D game mode for the 3D world editor.',
      'Place objects using the 3D grid — click to add, drag to move.',
      'Use "Set Position" with X, Y, and Z coordinates for 3D placement.',
      'Lighting blocks help create atmosphere and shadows.',
      '3D games use more resources — keep object counts low for smooth gameplay.',
      'Preview your game frequently to check the 3D camera angles.',
    ]
  },
  {
    title: 'Using the App Builder',
    icon: <Layout size={24} />,
    color: 'bg-blue-500',
    tips: [
      'App Builder creates mobile-friendly apps with screens and navigation.',
      'Start by designing your first screen with UI widgets.',
      'Use "Navigate" blocks to switch between screens.',
      'Global variables let you share data between screens.',
      'Custom widgets let you reuse UI designs across screens.',
      'Test on different screen sizes using the preview modes.',
    ]
  },
  {
    title: 'Using the Circuit Lab',
    icon: <Cpu size={24} />,
    color: 'bg-emerald-500',
    tips: [
      'Circuit Lab lets you build real electronic circuits with code.',
      'Start with simple circuits — an LED and a button.',
      'Use Logic Gates (AND, OR, NOT) for smart circuits.',
      'Connect sensors to read real-world data like temperature.',
      'Use the oscilloscope to visualize signals.',
      'Save your circuit designs as templates for reuse.',
    ]
  },
];

const faqItems = [
  { q: 'How do I undo a mistake?', a: 'Press Ctrl+Z to undo your last action. You can undo multiple times. Press Ctrl+Y to redo.' },
  { q: 'Why won\'t my blocks connect?', a: 'Make sure the blocks have matching types. Movement blocks connect to other Movement blocks, Logic blocks connect to Logic blocks. Look for the colored tabs on the sides of blocks.' },
  { q: 'How do I save my project?', a: 'Press Ctrl+S or click the Save button in the top bar. Your project saves automatically every 30 seconds.' },
  { q: 'Can I share my project with friends?', a: 'Yes! Click the "Share" button to generate a link. Your friends can open it and play your game or use your app.' },
  { q: 'My game is running slowly. What can I do?', a: 'Reduce the number of active objects, simplify your loops, and avoid too many sound effects playing at once. Check the Tips & Tricks section for more performance tips.' },
  { q: 'How do I add images or sounds?', a: 'Click the Assets tab in the toolbox. You can upload your own images and sounds or use the built-in library.' },
  { q: 'What are global variables?', a: 'Global variables let you share data between screens or game states. Name them starting with "global_" and they\'ll be available everywhere.' },
  { q: 'How do I test on a mobile device?', a: 'Click the Preview button and choose "Mobile" view. You can also scan the QR code to open your project on your phone.' },
];

const commonMistakes = [
  { mistake: 'Forgetting to initialize variables', fix: 'Always set starting values for variables at the top of your code or in the "When Game Starts" block.' },
  { mistake: 'Infinite loops', fix: 'Make sure every loop has a condition that will eventually become false, or a way to break out.' },
  { mistake: 'Wrong block type connections', fix: 'Check the block colors and tab shapes. Only matching types can connect.' },
  { mistake: 'Not testing frequently', fix: 'Run your code after every few changes. Small changes are easier to debug than big ones.' },
];

const performanceTips = [
  'Use loops instead of copying blocks many times.',
  'Limit the number of objects on screen at once.',
  'Reuse assets — don\'t load the same image multiple times.',
  'Use simple shapes instead of complex images when possible.',
  'Pause or remove off-screen objects to save processing power.',
];

export const HelpCenter: React.FC = () => {
  const { showHelp, setShowHelp, setShowTutorial } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>('getting-started');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  if (!showHelp) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl border-4 border-violet-500 overflow-hidden flex flex-col h-[700px] animate-in zoom-in-95 duration-300">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-violet-500 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <BookOpen size={28} fill="currentColor" className="opacity-80" />
            <div>
              <h2 className="text-2xl font-black tracking-tight">HELP CENTER</h2>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Your guide to KidCode Studio</p>
            </div>
          </div>
          <button onClick={() => setShowHelp(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-56 bg-slate-50 border-r border-slate-100 p-3 space-y-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                    : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
            {activeTab === 'getting-started' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Getting Started</h3>
                  <p className="text-slate-500 font-medium">Follow these steps to create your first project!</p>
                </div>
                {gettingStartedSteps.map((step) => (
                  <div key={step.step} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-violet-200 transition-colors">
                    <div className={`${step.color} w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shrink-0`}>
                      {step.step}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {step.icon}
                        <h4 className="font-bold text-slate-900">{step.title}</h4>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'blocks' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="mb-4">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Block Reference</h3>
                  <p className="text-slate-500 font-medium">Every block you need, organized by category.</p>
                </div>
                {blockCategories.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`${cat.color} w-3 h-3 rounded-full`} />
                      <h4 className={`font-black text-sm uppercase tracking-wider ${cat.textColor}`}>{cat.category}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {cat.blocks.map((block) => (
                        <div key={block.name} className={`p-3 rounded-xl border ${cat.borderColor} bg-white hover:shadow-md transition-shadow`}>
                          <p className="font-bold text-sm text-slate-900 mb-1">{block.name}</p>
                          <p className="text-xs text-slate-500 mb-2">{block.desc}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Use case: {block.example}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'game-modes' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="mb-4">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Game Modes Guide</h3>
                  <p className="text-slate-500 font-medium">Learn how to use each mode effectively.</p>
                </div>
                {gameModeGuides.map((guide) => (
                  <div key={guide.title} className="p-5 rounded-2xl border border-slate-100 bg-white hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`${guide.color} w-10 h-10 rounded-xl flex items-center justify-center text-white`}>
                        {guide.icon}
                      </div>
                      <h4 className="font-black text-slate-900">{guide.title}</h4>
                    </div>
                    <ul className="space-y-2">
                      {guide.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <ArrowRight size={14} className="text-slate-400 mt-0.5 shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'tips' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="mb-4">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Tips & Tricks</h3>
                  <p className="text-slate-500 font-medium">Pro tips to level up your coding!</p>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Keyboard size={18} className="text-violet-500" />
                    <h4 className="font-black text-violet-700 text-sm uppercase tracking-wider">Keyboard Shortcuts</h4>
                  </div>
                  <div className="space-y-1.5">
                    {SHORTCUT_GROUPS.map((group) => (
                      <div key={group.label} className="mb-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          {group.icon}
                          <span className="text-[10px] font-black text-slate-500 uppercase">{group.label}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {group.shortcuts.map((s, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="text-slate-600">{s.description}</span>
                              <div className="flex items-center gap-0.5">
                                {s.keys.map((k, ki) => (
                                  <React.Fragment key={ki}>
                                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-600">{k}</kbd>
                                    {ki < s.keys.length - 1 && <span className="text-slate-300 text-[10px]">+</span>}
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Gauge size={18} className="text-amber-500" />
                    <h4 className="font-black text-amber-700 text-sm uppercase tracking-wider">Performance Tips</h4>
                  </div>
                  <ul className="space-y-1.5">
                    {performanceTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <Zap size={12} className="text-amber-400 mt-1 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-red-50 border border-red-100">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={18} className="text-red-500" />
                    <h4 className="font-black text-red-700 text-sm uppercase tracking-wider">Common Mistakes</h4>
                  </div>
                  <div className="space-y-3">
                    {commonMistakes.map((item, i) => (
                      <div key={i}>
                        <p className="text-sm font-bold text-red-600 mb-0.5">{item.mistake}</p>
                        <p className="text-xs text-slate-600">{item.fix}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="mb-4">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Frequently Asked Questions</h3>
                  <p className="text-slate-500 font-medium">Got questions? We've got answers!</p>
                </div>
                {faqItems.map((item, i) => (
                  <div key={i} className="rounded-2xl border border-slate-100 overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <MessageCircle size={16} className="text-emerald-500" />
                        <span className="font-bold text-sm text-slate-900">{item.q}</span>
                      </div>
                      <ChevronDown size={16} className={`text-slate-400 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedFaq === i && (
                      <div className="px-4 pb-4 pt-0">
                        <p className="text-sm text-slate-600 leading-relaxed pl-7">{item.a}</p>
                      </div>
                    )}
                  </div>
                ))}

                <div className="mt-6 p-5 rounded-2xl bg-blue-50 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle size={16} className="text-blue-500" />
                    <h4 className="font-black text-blue-700 text-sm uppercase tracking-wider">Still Need Help?</h4>
                  </div>
                  <p className="text-sm text-slate-600">If your question isn't listed here, try the built-in Tutorial by clicking "Restart Tutorial" below, or ask your teacher for help!</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 flex items-center justify-between border-t border-slate-100">
          <button
            onClick={() => { setShowHelp(false); setShowTutorial(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-xl font-bold text-xs hover:bg-violet-200 transition-all"
          >
            <Sparkles size={14} />
            Restart Tutorial
          </button>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter italic">Keep building, keep coding, keep creating!</p>
        </div>
      </div>
    </div>
  );
};
