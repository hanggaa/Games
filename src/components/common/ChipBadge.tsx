import React from 'react';

interface ChipBadgeProps {
  amount: number;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const ChipBadge: React.FC<ChipBadgeProps> = ({
  amount,
  isSelected = false,
  onClick,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  }[size];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md font-mono-meta font-semibold transition-all duration-100 active:scale-[0.98] border cursor-pointer ${sizeClasses} ${
        isSelected
          ? 'bg-[#EDEDED] text-[#0A0A0A] border-[#EDEDED]'
          : 'bg-[#181818] text-[#D4D4D8] border-[#2A2A2A] hover:bg-[#222222] hover:text-white'
      }`}
    >
      ${amount}
    </button>
  );
};
