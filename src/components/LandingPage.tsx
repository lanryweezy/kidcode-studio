
import React from 'react';
import { useStore } from '../store/useStore';
import { useTranslation } from 'react-i18next';
import { Zap, Sparkles, Trophy, Users, Star, ArrowRight, Play, Rocket } from 'lucide-react';
import { playSoundEffect } from '../services/soundService';

const FloatingDecor: React.FC = () => (
    <>
        <div className="absolute top-16 left-[8%] text-5xl bob-float opacity-40 select-none" aria-hidden="true">🎮</div>
        <div className="absolute top-40 right-[12%] text-4xl bob-float bob-float-delay-1 opacity-30 select-none" aria-hidden="true">⚡</div>
        <div className="absolute top-[60%] left-[5%] text-3xl bob-float bob-float-delay-2 opacity-25 select-none" aria-hidden="true">🚀</div>
        <div className="absolute top-[30%] right-[6%] text-6xl bob-float bob-float-delay-3 opacity-20 select-none rotate-12" aria-hidden="true">✨</div>
        <div className="absolute bottom-40 left-[15%] text-4xl bob-float bob-float-delay-2 opacity-20 select-none -rotate-6" aria-hidden="true">🤖</div>
        <div className="absolute bottom-20 right-[20%] text-3xl bob-float bob-float-delay-1 opacity-25 select-none rotate-[-10deg]" aria-hidden="true">🎨</div>
    </>
);

const DoodleLine: React.FC<{ className?: string; color?: string }> = ({ className = '', color = '#7c3aed' }) => (
    <svg className={`absolute pointer-events-none ${className}`} width="120" height="20" viewBox="0 0 120 20" aria-hidden="true">
        <path d="M0 15 Q30 2 60 12 T120 10" stroke={color} fill="none" strokeWidth="2.5" strokeLinecap="round" className="doodle-line" />
    </svg>
);

const LandingPage: React.FC = () => {
    const { t } = useTranslation();
    const { setShowLanding, setShowHome } = useStore();
    const [scrollProgress, setScrollProgress] = React.useState(0);

    React.useEffect(() => {
        const handleScroll = () => {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleStartBuilding = () => {
        playSoundEffect('powerup');
        setShowLanding(false);
        setShowHome(true);
    };

    const featureCards = [
        { icon: Trophy, label: '3D Game Builder', desc: 'Build immersive 3D open worlds with real-time physics, AI NPCs, and cinematic cameras. Export your games directly to a web link.', color: 'violet', rotate: '-1.5deg', offsetX: '-12px', offsetY: '6px' },
        { icon: Rocket, label: 'App Designer', desc: 'Create real mobile-style apps with multi-screen navigation, buttons, text inputs, and dynamic UI elements.', color: 'emerald', rotate: '1deg', offsetX: '8px', offsetY: '-4px' },
        { icon: Zap, label: 'Circuit Lab', desc: 'Experience a complete electronics workbench. Connect sensors, LEDs, and LCDs on a breadboard and code them with blocks.', color: 'amber', rotate: '-0.5deg', offsetX: '-4px', offsetY: '10px' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden">
            <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />
            <FloatingDecor />

            {/* HERO SECTION */}
            <section className="relative pt-20 pb-32 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col items-center text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-600/10 border border-violet-500/30 text-violet-400 font-black text-xs uppercase tracking-widest mb-8 animate-bounce-sm skew-1">
                            <Sparkles size={14} className="animate-pulse" /> {t('landing.futureOfCoding')}
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.85] mb-8 tracking-tighter">
                            <span className="bg-gradient-to-b from-white via-white to-slate-500 bg-clip-text text-transparent">{t('landing.heroTitleLine1')} </span>
                            <span className="font-extralight text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-slate-300 italic">{t('landing.heroTitleItal')}</span>
                            <span className="bg-gradient-to-b from-white via-white to-slate-500 bg-clip-text text-transparent"> {t('landing.heroTitleLine2')} </span>
                            <br />
                            <span className="text-violet-500 skew-2 inline-block">{t('landing.heroTitleLine3')}</span>
                            <DoodleLine className="-bottom-4 left-1/2 -translate-x-1/2 w-48" />
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mb-12 font-medium leading-relaxed drift-left">
                            {t('landing.heroDesc')}
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-6">
                            <button
                                onClick={handleStartBuilding}
                                className="group px-10 py-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-xl rounded-2xl shadow-[0_0_40px_rgba(124,58,237,0.3)] hover:shadow-[0_0_60px_rgba(124,58,237,0.5)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3 skew-1"
                            >
                                <Zap size={24} fill="currentColor" /> {t('landing.getStartedFree')} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                                className="px-10 py-5 bg-slate-900/50 border border-slate-800 text-white font-black text-xl rounded-2xl transition-all hover:border-violet-500/50 flex items-center gap-3 skew-2"
                            >
                                <Play size={24} fill="currentColor" className="text-violet-500" /> {t('landing.seeTheTools')}
                            </button>
                        </div>

                        {/* Phone Mockup with Glass Effect — offset asymmetrically */}
                        <div className="mt-16 relative drift-right">
                            <div className="w-64 h-[500px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] border-4 border-slate-700 shadow-2xl shadow-violet-500/20 mx-auto relative overflow-hidden skew-3">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-20" />
                                <div className="absolute inset-2 rounded-[2rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
                                    <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
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
                                <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none rounded-[2rem]" />
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-600/30 blur-[100px] rounded-full -z-10" />
                        </div>

                        {/* Social Proof — asymmetric, slightly rotated cards */}
                        <div className="mt-20 flex flex-wrap items-center justify-center gap-12 py-8 px-12 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/5 skew-1">
                            <div className="text-center skew-2">
                                <div className="text-4xl font-black text-violet-400 mb-1">200+</div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Logic Blocks</div>
                            </div>
                            <div className="h-10 w-px bg-white/10 hidden md:block" />
                            <div className="text-center skew-1">
                                <div className="text-4xl font-black text-emerald-400 mb-1">3D</div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Physics engine</div>
                            </div>
                            <div className="h-10 w-px bg-white/10 hidden md:block" />
                            <div className="text-center skew-3">
                                <div className="text-4xl font-black text-amber-400 mb-1">50+</div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Circuit Parts</div>
                            </div>
                            <div className="h-10 w-px bg-white/10 hidden md:block" />
                            <div className="text-center skew-2">
                                <div className="text-4xl font-black text-blue-400 mb-1">Web</div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Instant Publish</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/20 blur-[120px] rounded-full animate-blob" />
                <div className="absolute top-1/2 -right-32 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full animate-blob animation-delay-2000" />
            </section>

            {/* Scroll Arrow */}
            <div className="flex flex-col items-center -mt-16 mb-8 relative z-10">
                <div className="w-10 h-10 border-b-2 border-r-2 border-violet-500 scroll-arrow opacity-60" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 fade-pulse">{t('landing.scrollDown')}</span>
            </div>

            {/* FEATURES SECTION — horizontal scroll */}
            <section className="py-32 px-6 bg-slate-900/30 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-5xl font-black mb-6">
                            {t('landing.threeStudios')}
                        </h2>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto drift-right">
                            {t('landing.threeDesc')}
                        </p>
                    </div>
                </div>

                <div className="horizontal-scroll-section max-w-7xl mx-auto pl-6 pr-6">
                    {featureCards.map((card, idx) => {
                        const Icon = card.icon;
                        const borderHover = card.color === 'violet' ? 'hover:border-violet-500/50' : card.color === 'emerald' ? 'hover:border-emerald-500/50' : 'hover:border-amber-500/50';
                        const bgIcon = card.color === 'violet' ? 'bg-violet-600 shadow-violet-500/20' : card.color === 'emerald' ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-amber-600 shadow-amber-500/20';
                        const underlineClass = card.color === 'violet' ? 'hand-drawn-underline' : card.color === 'emerald' ? 'hand-drawn-underline hand-drawn-underline-green' : 'hand-drawn-underline hand-drawn-underline-amber';
                        return (
                            <div
                                key={idx}
                                className={`p-10 bg-slate-950 rounded-[3rem] border border-slate-800 ${borderHover} transition-all group scattered-card min-w-[320px] w-[340px]`}
                                style={{ transform: `rotate(${card.rotate}) translate(${card.offsetX}, ${card.offsetY})` }}
                            >
                                <div className={`w-16 h-16 ${bgIcon} rounded-2xl flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform`}>
                                    <Icon size={32} />
                                </div>
                                <h3 className={`text-3xl font-black mb-4 ${underlineClass}`}>{card.label}</h3>
                                <p className="text-slate-300 leading-relaxed">
                                    {card.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* TESTIMONIALS — asymmetric grid */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="drift-left">
                            <h2 className="text-6xl font-black mb-8 leading-tight">
                                {t('landing.trustedBy')}
                            </h2>
                            <div className="flex gap-1 mb-8 skew-1">
                                <Star fill="#f59e0b" className="text-amber-500" />
                                <Star fill="#f59e0b" className="text-amber-500" />
                                <Star fill="#f59e0b" className="text-amber-500" />
                                <Star fill="#f59e0b" className="text-amber-500" />
                                <Star fill="#f59e0b" className="text-amber-500" />
                            </div>
                            <blockquote className="text-2xl font-medium text-slate-300 italic mb-8 skew-2">
                                "I built a 3D parkour game in less than 10 minutes. I usually use Scratch but this feels like I'm a <span className="font-black text-violet-400 not-italic">professional</span> game developer!"
                            </blockquote>
                            <div className="flex items-center gap-4 drift-right">
                                <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-xl skew-1">🧑‍💻</div>
                                <div>
                                    <div className="font-bold">Leo, 11</div>
                                    <div className="text-xs text-slate-500">Master Level Explorer</div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 transform lg:-translate-x-10 translate-y-10 skew-2 scattered-card">
                                <p className="text-slate-300 mb-6 font-medium">"My daughter loves the <span className="font-black text-emerald-400 hand-drawn-underline hand-drawn-underline-green">Circuit Lab</span>. Seeing her understand logic through virtual electronics has been amazing. Highly recommended for any STEM-focused parent."</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm skew-3">👩‍🏫</div>
                                    <div className="font-bold text-sm text-slate-300">Sarah, STEM Educator</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA FOOTER — asymmetric */}
            <section className="py-40 px-6 text-center relative">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-6xl font-black mb-12">
                        <span className="skew-1 inline-block">{t('landing.journeyTo')}</span>{' '}
                        <span className="text-violet-500 font-extralight text-5xl italic">{t('landing.journeyUsers')}</span>{' '}
                        <span className="skew-2 inline-block">{t('landing.journeyMid')}</span>
                        <br />
                        <span className="hand-drawn-underline skew-3 inline-block">{t('landing.journeyEnd')}</span>
                    </h2>
                    <button
                        onClick={handleStartBuilding}
                        className="px-12 py-6 bg-white text-black font-black text-2xl rounded-[2rem] hover:scale-110 active:scale-95 transition-all shadow-2xl flex items-center gap-4 mx-auto skew-1"
                    >
                        {t('landing.startCreating')} <ArrowRight size={28} />
                    </button>
                    <p className="mt-8 text-slate-600 font-bold uppercase tracking-widest text-sm drift-left">{t('landing.noCreditCard')}</p>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
