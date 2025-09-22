import React from 'react';

interface MainHeadlineProps {
  children: React.ReactNode;
  variant?: 'home' | 'page';
}

export default function MainHeadline({
  children,
  variant = 'home',
}: MainHeadlineProps) {
  const baseClasses =
    'text-black drop-shadow-[0_2px_12px_rgba(0,0,0,0.07)] text-center';

  const variantClasses = {
    home: 'text-3xl sm:text-7xl md:text-7xl lg:text-8xl py-16 md:py-28',
    page: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl py-8 md:py-12',
  };

  return (
    <h1
      className={`${baseClasses} ${variantClasses[variant]}`}
      style={{ fontFamily: 'var(--font-sans, sans-serif)' }}
    >
      {children}
    </h1>
  );
}
