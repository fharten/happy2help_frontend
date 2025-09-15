import React from "react";

interface MainHeadlineProps {
  children: React.ReactNode;
}

export default function MainHeadline({ children }: MainHeadlineProps) {
  return (
    <h1
      className="text-3xl sm:text-7xl md:text-7xl lg:text-8xl text-black drop-shadow-[0_2px_12px_rgba(0,0,0,0.07)] py-16  md:py-28 text-center"
      style={{ fontFamily: "var(--font-sans, sans-serif)" }}
    >
      {children}
    </h1>
  );
}
