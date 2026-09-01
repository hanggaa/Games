import React from 'react';
import { sound } from '../../engine/audio/soundEngine';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'gold' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      sound.playButtonClick();
      if (onClick) onClick(e);
    }
  };

  const variantClasses = {
    primary: 'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-900/40 border border-emerald-400/30',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-md shadow-rose-950/40',
    gold: 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 border border-amber-200',
    outline: 'bg-transparent hover:bg-slate-800/60 text-slate-300 border border-slate-600/60',
  }[variant];

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl font-bold',
  }[size];

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
