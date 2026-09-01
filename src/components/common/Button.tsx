import React from 'react';
import { sound } from '../../engine/audio/soundEngine';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'gold';
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
    primary: 'bg-[#EDEDED] hover:bg-white text-[#0A0A0A] border border-[#EDEDED] font-semibold',
    secondary: 'bg-[#181818] hover:bg-[#222222] text-[#EDEDED] border border-[#2A2A2A]',
    danger: 'bg-[#2A1416] hover:bg-[#381B1E] text-[#F87171] border border-[#4D2024]',
    gold: 'bg-[#261E0E] hover:bg-[#362A14] text-[#FBBF24] border border-[#4D3B18] font-semibold',
    ghost: 'bg-transparent hover:bg-[#181818] text-[#8E8E93] border border-transparent',
    outline: 'bg-transparent hover:bg-[#181818] text-[#EDEDED] border border-[#2A2A2A]',
  }[variant];

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs rounded-md',
    md: 'px-3.5 py-1.5 text-xs font-medium rounded-md',
    lg: 'px-5 py-2.5 text-sm font-semibold rounded-md',
  }[size];

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center transition-all duration-100 active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none cursor-pointer tracking-tight ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
