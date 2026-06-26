interface OdaTreeIconProps {
  className?: string;
  size?: number;
}

export function OdaTreeIcon({ className = '', size = 24 }: OdaTreeIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Canopy - layered green circles forming the tree crown */}
      <circle cx="32" cy="20" r="14" fill="hsl(152, 45%, 28%)" />
      <circle cx="22" cy="22" r="10" fill="hsl(152, 50%, 22%)" />
      <circle cx="42" cy="22" r="10" fill="hsl(152, 50%, 22%)" />
      <circle cx="32" cy="16" r="11" fill="hsl(152, 40%, 35%)" />
      <circle cx="26" cy="19" r="8" fill="hsl(152, 45%, 30%)" />
      <circle cx="38" cy="19" r="8" fill="hsl(152, 45%, 30%)" />
      {/* Highlight spots */}
      <circle cx="28" cy="14" r="3" fill="hsl(152, 55%, 42%)" opacity="0.6" />
      <circle cx="36" cy="16" r="2.5" fill="hsl(152, 55%, 42%)" opacity="0.5" />
      {/* Trunk */}
      <rect x="29" y="30" width="6" height="16" rx="2" fill="hsl(30, 35%, 25%)" />
      {/* Branches */}
      <path d="M32 30 Q26 26 20 24" stroke="hsl(30, 35%, 25%)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M32 30 Q38 26 44 24" stroke="hsl(30, 35%, 25%)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M32 32 Q28 28 24 27" stroke="hsl(30, 35%, 25%)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M32 32 Q36 28 40 27" stroke="hsl(30, 35%, 25%)" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Roots */}
      <path d="M29 46 Q24 48 20 50" stroke="hsl(30, 35%, 25%)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M35 46 Q40 48 44 50" stroke="hsl(30, 35%, 25%)" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Ground line */}
      <ellipse cx="32" cy="48" rx="18" ry="3" fill="hsl(43, 40%, 35%)" opacity="0.4" />
      {/* Small people silhouettes under the tree (community gathering) */}
      <circle cx="24" cy="52" r="2" fill="hsl(45, 30%, 90%)" opacity="0.8" />
      <circle cx="32" cy="53" r="2" fill="hsl(45, 30%, 90%)" opacity="0.8" />
      <circle cx="40" cy="52" r="2" fill="hsl(45, 30%, 90%)" opacity="0.8" />
      <rect x="23" y="54" width="2" height="3" rx="1" fill="hsl(45, 30%, 90%)" opacity="0.7" />
      <rect x="31" y="55" width="2" height="3" rx="1" fill="hsl(45, 30%, 90%)" opacity="0.7" />
      <rect x="39" y="54" width="2" height="3" rx="1" fill="hsl(45, 30%, 90%)" opacity="0.7" />
    </svg>
  );
}
