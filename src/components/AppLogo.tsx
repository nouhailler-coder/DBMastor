import React from 'react';
import logoImg from '../assets/images/dbmastery_logo_1790662821248.jpg';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  variant?: 'svg' | 'image';
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = true,
  subtitle = 'Studio Engine',
  variant = 'svg',
  className = '',
}) => {
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div
        className={`relative ${dimensions} rounded-xl overflow-hidden shrink-0 shadow-md shadow-[#0284c7]/25 border border-[#38bdf8]/40 bg-[#061322] flex items-center justify-center group`}
      >
        {variant === 'image' ? (
          <img
            src={logoImg}
            alt="DBMastery Studio Logo"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        ) : (
          <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full p-0.5"
            aria-label="DBMastery Studio Logo"
          >
            <defs>
              <linearGradient id="dbmCyan" x1="20" y1="20" x2="100" y2="95" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
              <linearGradient id="dbmEmerald" x1="30" y1="25" x2="95" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4EDEA3" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
              <linearGradient id="dbmAmber" x1="50" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            <ellipse cx="54" cy="32" rx="32" ry="11" fill="#102034" stroke="url(#dbmCyan)" strokeWidth="4" />
            <ellipse cx="54" cy="32" rx="18" ry="4.5" fill="#38BDF8" fillOpacity="0.3" />
            <path
              d="M22 32V54C22 60 36.3 65 54 65C71.7 65 86 60 86 54V32"
              fill="#0B1C30"
              stroke="url(#dbmCyan)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="34" cy="48" r="3" fill="#4EDEA3" />
            <circle cx="43" cy="50" r="3" fill="#38BDF8" />
            <path
              d="M22 54V76C22 82 36.3 87 54 87C71.7 87 86 82 86 76V54"
              fill="#061322"
              stroke="url(#dbmEmerald)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="34" cy="70" r="3" fill="#4EDEA3" />
            <circle cx="43" cy="72" r="3" fill="#38BDF8" />
            <circle cx="85" cy="83" r="23" fill="#061322" stroke="url(#dbmEmerald)" strokeWidth="3.5" />
            <path
              d="M87 67L74 84H85L83 99L96 82H85L87 67Z"
              fill="url(#dbmAmber)"
              stroke="#FEF3C7"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[17px] font-extrabold tracking-tight leading-none text-[#d3e4fe] font-sans">
              DBMastery
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#4edea3]/15 text-[#4edea3] border border-[#4edea3]/30 leading-none">
              SQL
            </span>
          </div>
          {subtitle && (
            <span className="text-[10px] text-[#93ccff] uppercase tracking-wider font-mono font-semibold mt-1">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
