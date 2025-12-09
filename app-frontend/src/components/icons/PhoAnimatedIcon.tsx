// app-frontend/src/components/icons/PhoAnimatedIcon.tsx
import React from "react";

export const PhoAnimatedIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={`${className} overflow-visible`} 
    >
      <style>
        {`
          @keyframes rise {
            0% { opacity: 0; transform: translateY(0) scale(0.8); }
            20% { opacity: 0.7; }
            100% { opacity: 0; transform: translateY(-25px) scale(1.2); }
          }
          .steam-1 { animation: rise 2s ease-out infinite; }
          .steam-2 { animation: rise 2s ease-out infinite 0.7s; }
          .steam-3 { animation: rise 2s ease-out infinite 1.4s; }
        `}
      </style>

      <g className="steam-group text-gray-200" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M35,30 Q40,20 35,10" className="steam-1" />
        <path d="M50,30 Q55,20 50,10" className="steam-2" />
        <path d="M65,30 Q70,20 65,10" className="steam-3" />
      </g>

      <path d="M10,45 Q10,85 50,85 T90,45" fill="#d97706" /> 
      <path d="M10,45 Q50,60 90,45 Q50,30 10,45 Z" fill="#f59e0b" /> 
      <path d="M30,85 L35,95 H65 L70,85 Z" fill="#b45309" /> 

      <ellipse cx="50" cy="45" rx="38" ry="10" fill="#fcd34d" opacity="0.8" />

      <g transform="translate(0, 5)">
        <path d="M25,45 Q35,55 45,45 T65,45" stroke="#fffbeb" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M30,50 Q40,60 50,50 T70,50" stroke="#fffbeb" strokeWidth="4" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="42" rx="8" ry="4" fill="#991b1b" transform="rotate(-20 40 42)" />
        <ellipse cx="60" cy="45" rx="7" ry="5" fill="#7f1d1d" transform="rotate(10 60 45)" />
        <path d="M48,38 L52,42 M50,40 L50,44" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
        <circle cx="35" cy="38" r="2" fill="#22c55e" />
        <circle cx="65" cy="40" r="2" fill="#16a34a" />
      </g>
    </svg>
  );
};