import React from 'react';

// Custom Button Component
export const Button = ({ 
  children, 
  className = '', 
  variant = 'default', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";

  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "underline-offset-4 hover:underline text-primary"
  };

  const sizeStyles = "h-10 py-2 px-4";

  return (
    <button
      className={`
        ${baseStyles} 
        ${variantStyles[variant]} 
        ${sizeStyles} 
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

// Custom Card Component
export const Card = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <div 
      className={`
        rounded-xl 
        border 
        bg-card 
        text-card-foreground 
        shadow-md 
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};