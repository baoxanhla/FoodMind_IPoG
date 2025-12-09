import React from "react";

export const FoodMindLogo = ({ className = "h-8" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-2 text-green-600 ${className}`}>
      
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className="h-full w-auto" 
      >
        {/* Hình dáng chiếc lá */}
        <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
        {/* Gân lá (tạo điểm nhấn) */}
        <path d="M12 6v7" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" fill="none"/>
      </svg>
      <span className="font-black text-xl tracking-tight leading-none">
        FoodMind
      </span>
    </div>
  );
};