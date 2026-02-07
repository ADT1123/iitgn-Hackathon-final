import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'glass' | 'elevated' | 'outline';
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  variant = 'default',
  hoverable = false,
  padding = 'md',
}) => {
  const variantStyles = {
    default: 'bg-white border-slate-200 shadow-sm',
    glass: 'glass shadow-sm',
    elevated: 'bg-white border-transparent shadow-md',
    outline: 'bg-transparent border-slate-200 shadow-none',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  const baseStyles = `rounded-xl border transition-all duration-300`;
  const hoverStyles = (hoverable || onClick) ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
