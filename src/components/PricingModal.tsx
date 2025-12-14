
import React, { useState } from 'react';
import { X, Check, Zap, Cpu, Rocket, Star } from 'lucide-react';
import { PlanType } from '../types';

interface PricingModalProps {
  currentPlan: PlanType;
  onClose: () => void;
  onUpgrade: (plan: PlanType) => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ currentPlan, onClose, onUpgrade }) => {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'free' as PlanType,
      name: 'Starter',
      price: 0,
      description: 'Perfect for learning the basics.',
      features: ['Unlimited Public Projects', 'Basic Blocks Library', 'Community Support'],
      color: 'bg-slate-100',
      textColor: 'text-slate-900',
      icon: Star
    },
    {
      id: 'maker' as PlanType,
      name: 'Maker',
      price: billing === 'monthly' ? 9 : 90,
      description: 'For aspiring game developers.',
      features: ['Everything in Starter', 'AI Code Assistant (Unlimited)', 'Advanced Game Physics', 'Export to HTML5'],
      color: 'bg-blue-500',
      textColor: 'text-white',
      popular: true,
      icon: Zap
    },
    {
      id: 'inventor' as PlanType,
      name: 'Inventor',
      price: billing === 'monthly' ? 19 : 190,
      description: 'For hardware engineers & pros.',
      features: ['Everything in Maker', 'IoT & Cloud Variables', 'Hardware Simulator Pro', 'Team Collaboration'],
      color: 'bg-violet-600',
      textColor: 'text-white',
      icon: Rocket
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 text-center bg-slate-50 border-b border-slate-100 relative">
           <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} /></button>
           <h2 className="text-3xl font-black text-slate-900 mb-2">Unlock Your Superpowers 🚀</h2>
           <p className="text-slate-500">Choose the plan that fits your coding journey.</p>
           
           {/* Billing Toggle */}
           <div className="flex items-center justify-center gap-4 mt-6">
               <span className={`font-bold text-sm ${billing === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
               <button 
                 onClick={() => setBilling(b => b === 'monthly' ? 'yearly' : 'monthly')}
                 className="w-14 h-7 bg-slate-200 rounded-full relative transition-colors duration-300"
               >
                   <div className={`absolute top-1 w-5 h-5 bg-white shadow-sm rounded-full transition-all duration-300 ${billing === 'monthly' ? 'left-1' : 'left-8'}`} />
               </button>
               <span className={`font-bold text-sm ${billing === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>Yearly <span className="text-green-500 text-xs">(Save 20%)</span></span>
           </div>
        </div>

        {/* Plans Grid */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(plan => {
                    const isCurrent = currentPlan === plan.id;
                    const Icon = plan.icon;
                    return (
                        <div 
                            key={plan.id}
                            className={`relative rounded-3xl p-6 border-2 transition-all flex flex-col ${plan.popular ? 'border-blue-500 shadow-xl scale-105 z-10' : 'border-slate-100 hover:border-slate-300 shadow-sm'}`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                    MOST POPULAR
                                </div>
                            )}
                            
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-3 rounded-xl ${plan.color === 'bg-white' ? 'bg-slate-100' : plan.color} ${plan.textColor === 'text-white' ? 'bg-opacity-100' : 'bg-opacity-20'} `}>
                                    <Icon className={plan.textColor === 'text-white' ? 'text-white' : 'text-slate-700'} size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-slate-900">${plan.price}</span>
                                        <span className="text-sm text-slate-400">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{plan.description}</p>
                            
                            <div className="space-y-3 mb-8 flex-1">
                                {plan.features.map((feat, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
                                        <div className="p-0.5 bg-green-100 text-green-600 rounded-full"><Check size={10} strokeWidth={4} /></div>
                                        {feat}
                                    </div>
                                ))}
                            </div>
                            
                            <button 
                                onClick={() => onUpgrade(plan.id)}
                                disabled={isCurrent}
                                className={`w-full py-3 rounded-xl font-bold transition-all ${isCurrent ? 'bg-slate-100 text-slate-400 cursor-default' : `${plan.color} ${plan.textColor} hover:brightness-110 shadow-lg`}`}
                            >
                                {isCurrent ? 'Current Plan' : 'Upgrade Now'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400">
            Secure payment powered by KidCode Secure. Cancel anytime.
        </div>

      </div>
    </div>
  );
};

export default PricingModal;
