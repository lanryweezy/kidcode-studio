
import React from 'react';
import { useStore } from '../store/useStore';
import { useState } from 'react';
import { Zap, Sparkles, Trophy, Users, Star, ArrowRight, Play, Rocket } from 'lucide-react';
import { playSoundEffect } from '../services/soundService';
import { VideoModal } from './VideoModal';

const LandingPage: React.FC = () => {
    const { setShowLanding, setShowHome } = useStore();
    const [showVideo, setShowVideo] = useState(false);

    const handleStartBuilding = () => {
        playSoundEffect('powerup');
        setShowLanding(false);
        setShowHome(true);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden">
            {/* HERO SECTION */}
            <section className="relative pt-20 pb-32 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col items-center text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-600/10 border border-violet-500/30 text-violet-400 font-black text-xs uppercase tracking-widest mb-8 animate-bounce-sm">
                            <Sparkles size={14} className="animate-pulse" /> THE FUTURE OF CODING IS HERE
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.85] mb-8 bg-gradient-to-b from-white via-white to-slate-500 bg-clip-text text-transparent tracking-tighter">
                            Build Your Own <br />
                            <span className="text-violet-500">Universe.</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mb-12 font-medium leading-relaxed">
                            The all-in-one professional studio where kids build 3D open-world games,
                            real mobile apps, and simulate advanced electronics—all with the power of blocks.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-6">
                            <button
                                onClick={handleStartBuilding}
                                className="group px-10 py-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-xl rounded-2xl shadow-[0_0_40px_rgba(124,58,237,0.3)] hover:shadow-[0_0_60px_rgba(124,58,237,0.5)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                            >
                                <Zap size={24} fill="currentColor" /> GET STARTED FREE <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => setShowVideo(true)}
                                className="px-10 py-5 bg-slate-900/50 border border-slate-800 text-white font-black text-xl rounded-2xl transition-all hover:border-violet-500/50 flex items-center gap-3"
                            >
                                <Play size={24} fill="currentColor" className="text-violet-500" /> WATCH VIDEO
                            </button>
                        </div>

                        <VideoModal isOpen={showVideo} onClose={() => setShowVideo(false)} />

                        {/* Phone Mockup with Glass Effect */}
                        <div className="mt-16 relative">
                            <div className="w-64 h-[500px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] border-4 border-slate-700 shadow-2xl shadow-violet-500/20 mx-auto relative overflow-hidden">
                                {/* Phone notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-20" />
                                {/* Screen content */}
                                <div className="absolute inset-2 rounded-[2rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 overflow-hidden">
                                    {/* Glass reflection overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
                                    <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
                                    {/* Animated content */}
                                    <div className="p-6 pt-12 space-y-4">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                            <Zap size={24} className="text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-3 bg-white/30 rounded-full w-3/4" />
                                            <div className="h-3 bg-white/20 rounded-full w-1/2" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mt-6">
                                            <div className="h-20 bg-white/10 backdrop-blur-sm rounded-xl" />
                                            <div className="h-20 bg-white/10 backdrop-blur-sm rounded-xl" />
                                            <div className="h-20 bg-white/10 backdrop-blur-sm rounded-xl col-span-2" />
                                        </div>
                                    </div>
                                </div>
                                {/* Glass reflection shine */}
                                <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none rounded-[2rem]" />
                            </div>
                            {/* Glow effect behind phone */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-600/30 blur-[100px] rounded-full -z-10" />
                        </div>

                        {/* Social Proof */}
                        <div className="mt-20 flex flex-wrap items-center justify-center gap-12 py-8 px-12 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/5">
                            <div className="text-center">
                                <div className="text-4xl font-black text-violet-400 mb-1">200+</div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Logic Blocks</div>
                            </div>
                            <div className="h-10 w-px bg-white/10 hidden md:block" />
                            <div className="text-center">
                                <div className="text-4xl font-black text-emerald-400 mb-1">3D</div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Physics engine</div>
                            </div>
                            <div className="h-10 w-px bg-white/10 hidden md:block" />
                            <div className="text-center">
                                <div className="text-4xl font-black text-amber-400 mb-1">50+</div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Circuit Parts</div>
                            </div>
                            <div className="h-10 w-px bg-white/10 hidden md:block" />
                            <div className="text-center">
                                <div className="text-4xl font-black text-blue-400 mb-1">Web</div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Instant Publish</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Animated background elements */}
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/20 blur-[120px] rounded-full animate-blob" />
                <div className="absolute top-1/2 -right-32 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full animate-blob animation-delay-2000" />
            </section>

            {/* FEATURES SECTION */}
            <section className="py-32 px-6 bg-slate-900/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-5xl font-black mb-6">Three Studios. One Tool.</h2>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto">Everything you need to go from an idea to a published game, app, or hardware prototype.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-10 bg-slate-950 rounded-[3rem] border border-slate-800 hover:border-violet-500/50 transition-all group">
                            <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-violet-500/20 group-hover:scale-110 transition-transform">
                                <Trophy size={32} />
                            </div>
                            <h3 className="text-3xl font-black mb-4">3D Game Builder</h3>
                            <p className="text-slate-300 leading-relaxed">
                                Build immersive 3D open worlds with real-time physics, AI NPCs, and cinematic cameras. Export your games directly to a web link.
                            </p>
                        </div>
                        {/* Feature 2 */}
                        <div className="p-10 bg-slate-950 rounded-[3rem] border border-slate-800 hover:border-emerald-500/50 transition-all group">
                            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                <Rocket size={32} />
                            </div>
                            <h3 className="text-3xl font-black mb-4">App Designer</h3>
                            <p className="text-slate-300 leading-relaxed">
                                Create real mobile-style apps with multi-screen navigation, buttons, text inputs, and dynamic UI elements. Design the next big thing.
                            </p>
                        </div>
                        {/* Feature 3 */}
                        <div className="p-10 bg-slate-950 rounded-[3rem] border border-slate-800 hover:border-amber-500/50 transition-all group">
                            <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-amber-500/20 group-hover:scale-110 transition-transform">
                                <Zap size={32} />
                            </div>
                            <h3 className="text-3xl font-black mb-4">Circuit Lab</h3>
                            <p className="text-slate-300 leading-relaxed">
                                Experience a complete electronics workbench. Connect sensors, LEDs, and LCDs on a breadboard and code them with blocks.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <h2 className="text-6xl font-black mb-8 leading-tight">Trusted by young <br /> creators worldwide.</h2>
                            <div className="flex gap-1 mb-8">
                                <Star fill="#f59e0b" className="text-amber-500" />
                                <Star fill="#f59e0b" className="text-amber-500" />
                                <Star fill="#f59e0b" className="text-amber-500" />
                                <Star fill="#f59e0b" className="text-amber-500" />
                                <Star fill="#f59e0b" className="text-amber-500" />
                            </div>
                            <blockquote className="text-2xl font-medium text-slate-300 italic mb-8">
                                \"I built a 3D parkour game in less than 10 minutes. I usually use Scratch but this feels like I’m a professional game developer!\"
                            </blockquote>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-xl">🧑‍💻</div>
                                <div>
                                    <div className="font-bold">Leo, 11</div>
                                    <div className="text-xs text-slate-500">Master Level Explorer</div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 transform lg:-translate-x-10 translate-y-10">
                                <p className="text-slate-300 mb-6 font-medium">\"My daughter loves the Circuit Lab. Seeing her understand logic through virtual electronics has been amazing. Highly recommended for any STEM-focused parent.\"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">👩‍🏫</div>
                                    <div className="font-bold text-sm text-slate-300">Sarah, STEM Educator</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA FOOTER */}
            <section className="py-40 px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-6xl font-black mb-12">The journey to 1 million users starts with your first block.</h2>
                    <button
                        onClick={handleStartBuilding}
                        className="px-12 py-6 bg-white text-black font-black text-2xl rounded-[2rem] hover:scale-110 active:scale-95 transition-all shadow-2xl flex items-center gap-4 mx-auto"
                    >
                        START CREATING NOW <ArrowRight size={28} />
                    </button>
                    <p className="mt-8 text-slate-600 font-bold uppercase tracking-widest text-sm">No credit card required · Free forever for students</p>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
