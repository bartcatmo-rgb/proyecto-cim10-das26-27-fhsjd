'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  className?: string;
  showBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function BrandLogo({ className = '', showBadge = true, size = 'md' }: BrandLogoProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
  };

  if (imgError) {
    // Elegant CSS/SVG Typographical Fallback with institutional colors (100% offline)
    return (
      <div className={`flex items-center space-x-2.5 ${className}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E30613] to-[#B91C1C] flex items-center justify-center text-white font-black text-sm shadow-sm ring-1 ring-white/20">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M2 12h20" />
          </svg>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-gray-900 text-sm tracking-tight">Campus Docent</span>
            <span className="text-xs font-semibold text-[#0077B6]">SJD</span>
            {showBadge && (
              <span className="text-[10px] bg-red-50 text-[#E30613] font-bold px-1.5 py-0.5 rounded border border-red-200">
                DAS 26/27
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold text-[#E30613] tracking-wider uppercase">AulaCIM-10 · FHSJD</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/branding/logo-docente.svg"
        alt="Campus Docent Sant Joan de Déu · AulaCIM-10"
        className={`${sizeClasses[size]} w-auto object-contain select-none`}
        onError={() => setImgError(true)}
      />
    </div>
  );
}
