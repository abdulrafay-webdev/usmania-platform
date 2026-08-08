'use client';

import React, { useState } from 'react';

interface TrustLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function TrustLogo({ size = 'md', showText = true }: TrustLogoProps) {
  const [imgError, setImgError] = useState(false);

  const containerClasses =
    size === 'sm'
      ? 'w-8 h-8'
      : size === 'lg'
      ? 'w-14 h-14'
      : 'w-11 h-11';

  return (
    <div className="flex items-center gap-3 select-none">
      <div className={`${containerClasses} rounded-xl bg-white flex items-center justify-center p-0.5 relative overflow-hidden shadow-xs border border-gray-100 shrink-0`}>
        {!imgError ? (
          <img
            src="/images/logo.png"
            alt="Jamia Usmania Trust"
            className="w-full h-full object-contain rounded-lg"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-[#145A32] text-[#FDF6E3] flex items-center justify-center rounded-lg">
            <svg
              className="w-3/4 h-3/4 text-[#FDF6E3]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v3M12 5c-3.5 0-6 2.5-6 6v7h12v-7c0-3.5-2.5-6-6-6z" />
              <path d="M4 18h16" />
              <path d="M9 18v3" />
              <path d="M15 18v3" />
              <circle cx="12" cy="11" r="1.5" fill="#FDF6E3" />
            </svg>
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-serif font-bold text-[#145A32] tracking-tight leading-none text-base">
            JAMIA USMANIA
          </span>
          <span className="text-[10px] font-semibold tracking-widest text-[#145A32]/80 uppercase leading-tight mt-0.5">
            Management Portal
          </span>
        </div>
      )}
    </div>
  );
}
