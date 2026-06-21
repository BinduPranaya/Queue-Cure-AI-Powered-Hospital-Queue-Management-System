/**
 * Minimal hand-rolled icon set (no external icon library dependency).
 * Each icon is a simple stroked SVG sized to fill its parent via className.
 */

const base = "w-5 h-5";

export const TokenIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 9h18" strokeLinecap="round" />
    <path d="M7 14h4" strokeLinecap="round" />
  </svg>
);

export const UsersIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="8" r="3" />
    <path d="M2.5 19c0-3 3-5 6.5-5s6.5 2 6.5 5" strokeLinecap="round" />
    <circle cx="17" cy="8" r="2.4" />
    <path d="M16.5 14c2.7.3 4.9 2 4.9 5" strokeLinecap="round" />
  </svg>
);

export const CheckCircleIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.3l2.3 2.3 4.7-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ClockIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PlusIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2.4">
    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
  </svg>
);

export const TrashIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    <path d="M4 7h16" strokeLinecap="round" />
    <path d="M9 7V4.8C9 4.4 9.4 4 9.8 4h4.4c.4 0 .8.4.8.8V7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 7l1 13c.05.6.55 1 1.1 1h7.8c.55 0 1.05-.4 1.1-1l1-13" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 11v6M14 11v6" strokeLinecap="round" />
  </svg>
);

export const BellRingIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    <path d="M18 8a6 6 0 1 0-12 0c0 3-1 5-2 6h16c-1-1-2-3-2-6Z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.5 19a2.5 2.5 0 0 0 5 0" strokeLinecap="round" />
  </svg>
);

export const SettingsIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path
      d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1.5 12h3M19.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
      strokeLinecap="round"
    />
  </svg>
);

export const EmptyQueueIcon = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 9h18" strokeLinecap="round" />
    <path d="M8 14h8" strokeLinecap="round" strokeDasharray="2 2" />
  </svg>
);

export const ChevronRightIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2.4">
    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
