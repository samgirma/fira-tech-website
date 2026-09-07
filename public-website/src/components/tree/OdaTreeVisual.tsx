import { useEffect, useState } from "react";

interface OdaTreeVisualProps {
  className?: string;
  withTechOverlay?: boolean;
  parallax?: boolean;
}

export function OdaTreeVisual({ className = "", withTechOverlay = true, parallax = false }: OdaTreeVisualProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return (
    <div className={`relative ${className}`} aria-hidden="true">
      {/* Background tree image */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${parallax && !prefersReducedMotion ? "will-change-transform" : ""}`}
        style={{
          backgroundImage: "url(/hero-oda-tree.jpg)",
          opacity: 0.15,
          filter: "blur(1px)",
        }}
      />

      {/* SVG tree silhouette overlay */}
      <svg
        viewBox="0 0 800 600"
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.08 }}
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Main trunk */}
        <path
          d="M400 580 L400 350 Q400 300 380 260 Q360 220 340 200"
          stroke="hsl(152 45% 38%)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M400 350 Q400 300 420 260 Q440 220 460 200"
          stroke="hsl(152 45% 38%)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />

        {/* Major branches */}
        <path
          d="M380 260 Q340 230 300 220 Q260 210 230 230"
          stroke="hsl(152 40% 35%)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M420 260 Q460 230 500 220 Q540 210 570 230"
          stroke="hsl(152 40% 35%)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M360 230 Q330 200 310 170 Q290 140 300 110"
          stroke="hsl(152 40% 35%)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M440 230 Q470 200 490 170 Q510 140 500 110"
          stroke="hsl(152 40% 35%)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Canopy / leaf clusters */}
        <ellipse cx="300" cy="200" rx="80" ry="60" fill="hsl(152 45% 28%)" opacity="0.15" />
        <ellipse cx="500" cy="200" rx="80" ry="60" fill="hsl(152 45% 28%)" opacity="0.15" />
        <ellipse cx="400" cy="160" rx="100" ry="70" fill="hsl(152 45% 28%)" opacity="0.12" />
        <ellipse cx="340" cy="140" rx="60" ry="50" fill="hsl(152 45% 28%)" opacity="0.10" />
        <ellipse cx="460" cy="140" rx="60" ry="50" fill="hsl(152 45% 28%)" opacity="0.10" />
        <ellipse cx="400" cy="120" rx="70" ry="50" fill="hsl(152 45% 28%)" opacity="0.08" />

        {/* Roots */}
        <path d="M400 580 Q370 590 340 585" stroke="hsl(152 50% 22%)" strokeWidth="3" fill="none" opacity="0.3" />
        <path d="M400 580 Q430 590 460 585" stroke="hsl(152 50% 22%)" strokeWidth="3" fill="none" opacity="0.3" />
        <path d="M400 580 Q380 595 360 600" stroke="hsl(152 50% 22%)" strokeWidth="2" fill="none" opacity="0.2" />
        <path d="M400 580 Q420 595 440 600" stroke="hsl(152 50% 22%)" strokeWidth="2" fill="none" opacity="0.2" />
      </svg>

      {/* Tech overlay — circuit traces connecting tree branches */}
      {withTechOverlay && (
        <svg
          viewBox="0 0 800 600"
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.06 }}
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Circuit traces */}
          <line x1="230" y1="230" x2="150" y2="200" stroke="hsl(43 85% 55%)" strokeWidth="1" strokeDasharray="4 8" />
          <line x1="570" y1="230" x2="650" y2="200" stroke="hsl(43 85% 55%)" strokeWidth="1" strokeDasharray="4 8" />
          <line x1="300" y1="110" x2="250" y2="60" stroke="hsl(43 85% 55%)" strokeWidth="1" strokeDasharray="4 8" />
          <line x1="500" y1="110" x2="550" y2="60" stroke="hsl(43 85% 55%)" strokeWidth="1" strokeDasharray="4 8" />
          <line x1="400" y1="120" x2="400" y2="50" stroke="hsl(43 85% 55%)" strokeWidth="1" strokeDasharray="4 8" />

          {/* Node points */}
          <circle cx="230" cy="230" r="3" fill="hsl(43 85% 55%)" opacity="0.4" />
          <circle cx="570" cy="230" r="3" fill="hsl(43 85% 55%)" opacity="0.4" />
          <circle cx="300" cy="110" r="3" fill="hsl(43 85% 55%)" opacity="0.4" />
          <circle cx="500" cy="110" r="3" fill="hsl(43 85% 55%)" opacity="0.4" />
          <circle cx="400" cy="120" r="3" fill="hsl(43 85% 55%)" opacity="0.4" />
          <circle cx="150" cy="200" r="2" fill="hsl(43 85% 55%)" opacity="0.3" />
          <circle cx="650" cy="200" r="2" fill="hsl(43 85% 55%)" opacity="0.3" />
          <circle cx="250" cy="60" r="2" fill="hsl(43 85% 55%)" opacity="0.3" />
          <circle cx="550" cy="60" r="2" fill="hsl(43 85% 55%)" opacity="0.3" />
          <circle cx="400" cy="50" r="2" fill="hsl(43 85% 55%)" opacity="0.3" />
        </svg>
      )}

      {/* Floating particles (hidden or paused if prefers-reduced-motion) */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                backgroundColor: i % 3 === 0 ? "hsl(43 85% 55% / 0.3)" : "hsl(152 45% 38% / 0.2)",
                animation: `float ${4 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          50% { transform: translateY(-12px) translateX(4px); opacity: 0.7; }
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
