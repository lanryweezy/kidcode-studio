import React from 'react';
import { X, Crown, Check, Sparkles } from 'lucide-react';
import { PlanType } from '../types';

interface PricingModalProps {
  currentPlan: PlanType;
  onClose: () => void;
  onUpgrade: (plan: PlanType) => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ currentPlan, onClose, onUpgrade }) => {
  const plans = [
    {
      name: 'Maker',
      description: 'Perfect for young creators',
      price: '$4.99',
      period: 'per month',
      features: [
        'AI Sprite Generation',
        'Advanced Hardware Blocks',
        'Priority Support',
        '500+ Assets Library',
        'Cloud Sync'
      ],
      cta: 'Get Maker Plan',
      popular: false,
      planType: 'maker' as PlanType
    },
    {
      name: 'Inventor',
      description: 'For serious young developers',
      price: '$9.99',
      period: 'per month',
      features: [
        'All Maker features',
        'Custom Code Export',
        'Team Collaboration',
        'API Access',
        'Early Access to Features',
        'Custom Branding'
      ],
      cta: 'Get Inventor Plan',
      popular: true,
      planType: 'inventor' as PlanType
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="text-yellow-500" size={24} />
            Upgrade Your Studio
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-2">
          <div className="grid md:grid-cols-2 gap-4">
            {plans.map((plan, idx) => (
              <div 
                key={idx}
                className={`p-6 rounded-xl border-2 ${
                  plan.popular 
                    ? 'border-violet-500 bg-gradient-to-b from-violet-50 to-white dark:from-violet-950/30 dark:to-slate-800' 
                    : 'border-slate-200 dark:border-slate-700'
                } relative`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                    <Crown size={12} /> MOST POPULAR
                  </div>
                )}
                
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  <span className="text-3xl font-black">{plan.price}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">/{plan.period}</span>
                </div>
                
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => onUpgrade(plan.planType)}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:shadow-lg hover:shadow-violet-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>7-day money-back guarantee • Cancel anytime</p>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;