import React from 'react';

interface ChipBadgeProps {
  amount: number;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const CHIP_THEMES: Record<number, { bg: string; border: string; text: string }> = {
  5: { bg: 'bg-gradient-to-b from-red-600 to-red-800', border: 'border-red-300', text: 'text-white' },
  10: { bg: 'bg-gradient-to-b from-blue-600 to-blue-800', border: 'border-blue-300', text: 'text-white' },
  25: { bg: 'bg-gradient-to-b from-emerald-600 to-emerald-800', border: 'border-emerald-300', text: 'text-white' },
  50: { bg: 'bg-gradient-to-b from-amber-600 to-amber-800', border: 'border-amber-300', text: 'text-white' },
  100: { bg: 'bg-gradient-to-b from-slate-800 to-slate-950', border: 'border-amber-400', text: 'text-amber-300' },
  500: { bg: 'bg-gradient-to-b from-purple-700 to-purple-950', border: 'border-purple-300', text: 'text-white' },
};

export const ChipBadge: React.FC<ChipBadgeProps> = ({
  amount,
  isSelected = false,
  onClick,
  size = 'md',
}) => {
  const theme = CHIP_THEMES[amount] || CHIP_THEMES[25];

  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-11 h-11 text-xs',
    lg: 'w-14 h-14 text-sm font-bold',
  }[size];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-full flex items-center justify-center font-bold shadow-lg transition-transform active:scale-95 ${theme.bg} ${theme.text} ${sizeClasses} ${
        isSelected ? 'ring-3 ring-amber-300 ring-offset-2 ring-offset-slate-950 scale-110 shadow-amber-500/20' : 'opacity-90 hover:opacity-100'
      }`}
    >
      <div className={`w-[82%] h-[82%] rounded-full border border-dashed ${theme.border} flex items-center justify-center`}>
        <span>${amount}</span>
      </div>
    </button>
  );
};
