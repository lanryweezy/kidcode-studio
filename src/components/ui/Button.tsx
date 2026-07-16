import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'glass';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-glow-sm hover:shadow-glow hover:brightness-110 hover:[box-shadow:0_0_24px_rgba(124,58,237,0.45),0_4px_12px_rgba(99,102,241,0.25)] active:brightness-90',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 font-bold',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 font-bold',
  danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm active:bg-rose-700',
  success: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm active:bg-emerald-700',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm active:bg-amber-700',
  glass: 'glass text-slate-700 hover:bg-white/80',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs gap-1',
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
  icon: 'p-2',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading,
  fullWidth,
  className = '',
  disabled,
  children,
  ...props
}) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-semibold rounded-xl
        transition-transform duration-100 ease-out
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        btn-ripple
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
};
