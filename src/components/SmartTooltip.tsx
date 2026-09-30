import React, { useState, useEffect } from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';

const TOOLTIPS_STORAGE_KEY = 'dbmastery_tooltips_enabled_v1';

export function getTooltipsEnabled(): boolean {
  try {
    const raw = localStorage.getItem(TOOLTIPS_STORAGE_KEY);
    if (raw === null) return true;
    return raw === 'true';
  } catch {
    return true;
  }
}

export function setTooltipsEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(TOOLTIPS_STORAGE_KEY, String(enabled));
    window.dispatchEvent(new CustomEvent('dbmastery:tooltips_toggled', { detail: enabled }));
  } catch {
    // ignore storage errors
  }
}

interface SmartTooltipProps {
  title: string;
  description: string;
  badge?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  children?: React.ReactNode;
  showInfoIcon?: boolean;
  className?: string;
}

export const SmartTooltip: React.FC<SmartTooltipProps> = ({
  title,
  description,
  badge,
  placement = 'top',
  children,
  showInfoIcon = false,
  className = '',
}) => {
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState<boolean>(() => getTooltipsEnabled());

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<boolean>;
      setEnabled(Boolean(ce.detail));
    };
    window.addEventListener('dbmastery:tooltips_toggled', handler);
    return () => window.removeEventListener('dbmastery:tooltips_toggled', handler);
  }, []);

  if (!enabled) {
    return <>{children}</>;
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2.5',
  }[placement];

  return (
    <span
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {showInfoIcon && (
        <span
          role="button"
          tabIndex={0}
          aria-label={title}
          className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#102034] hover:bg-[#1b2b3f] text-[#89ceff] border border-[#26364a] transition-colors cursor-help shrink-0"
        >
          <HelpCircle className="w-3 h-3" />
        </span>
      )}

      {visible && (
        <div
          role="tooltip"
          className={`pointer-events-none absolute z-[90] w-64 sm:w-72 p-3 rounded-xl bg-[#031427]/98 border border-[#38bdf8]/50 shadow-[0_10px_30px_rgba(0,0,0,0.65)] backdrop-blur-md text-left animate-fade-in ${positionClasses}`}
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-sans text-xs font-extrabold text-[#d3e4fe] flex items-center gap-1.5 leading-snug">
              <Sparkles className="w-3.5 h-3.5 text-[#4edea3] shrink-0" />
              <span>{title}</span>
            </span>
            {badge && (
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#0284c7]/30 text-[#38bdf8] border border-[#38bdf8]/40 shrink-0">
                {badge}
              </span>
            )}
          </div>
          <p className="font-sans text-[11px] text-[#bfc7d2] leading-relaxed font-normal whitespace-normal">
            {description}
          </p>
        </div>
      )}
    </span>
  );
};
