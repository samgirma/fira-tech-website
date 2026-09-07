import { useEffect, useRef, useState } from "react";

interface TechnologyEcosystem3DProps {
  className?: string;
}

export function TechnologyEcosystem3D({ className = "" }: TechnologyEcosystem3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const mediaHandler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", mediaHandler);

    if (mediaQuery.matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      mediaQuery.removeEventListener("change", mediaHandler);
    };
  }, []);

  const nodes = [
    { x: 50, y: 30, label: "Web", color: "hsl(152 45% 38%)" },
    { x: 75, y: 45, label: "Mobile", color: "hsl(152 45% 38%)" },
    { x: 60, y: 65, label: "Cloud", color: "hsl(43 85% 55%)" },
    { x: 30, y: 55, label: "Data", color: "hsl(152 45% 38%)" },
    { x: 85, y: 70, label: "AI", color: "hsl(43 85% 55%)" },
    { x: 20, y: 35, label: "Software", color: "hsl(152 45% 38%)" },
    { x: 45, y: 80, label: "DevOps", color: "hsl(43 85% 55%)" },
  ];

  const connections = [
    [0, 1], [0, 5], [0, 3],
    [1, 2], [1, 4],
    [2, 4], [2, 6],
    [3, 6], [3, 5],
    [5, 0],
    [6, 4],
  ];

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      aria-hidden="true"
      style={{
        perspective: "1000px",
      }}
    >
      <div
        className="w-full h-full relative"
        style={{
          transform: prefersReducedMotion
            ? "none"
            : `rotateY(${mousePos.x * 3}deg) rotateX(${-mousePos.y * 3}deg)`,
          transition: prefersReducedMotion ? "none" : "transform 0.4s ease-out",
          transformStyle: "preserve-3d",
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{ filter: "drop-shadow(0 0 20px hsl(152 45% 28% / 0.15))" }}
        >
          {/* Outer ring */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="hsl(152 45% 28%)"
            strokeWidth="0.3"
            strokeDasharray="2 3"
            opacity="0.2"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="hsl(43 85% 55%)"
            strokeWidth="0.15"
            opacity="0.15"
          />

          {/* Connection lines */}
          {connections.map(([from, to], i) => (
            <line
              key={i}
              x1={nodes[from].x}
              y1={nodes[from].y}
              x2={nodes[to].x}
              y2={nodes[to].y}
              stroke="hsl(152 40% 35%)"
              strokeWidth="0.4"
              opacity="0.25"
              strokeDasharray={i % 3 === 0 ? "1 1.5" : "none"}
            />
          ))}

          {/* Nodes */}
          {nodes.map((node, i) => (
            <g key={i}>
              <circle
                cx={node.x}
                cy={node.y}
                r="1.8"
                fill={node.color}
                opacity="0.9"
              />
              {!prefersReducedMotion && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="2.5"
                  fill="none"
                  stroke={node.color}
                  strokeWidth="0.2"
                  opacity="0.3"
                >
                  <animate
                    attributeName="r"
                    from="2"
                    to="4"
                    dur={`${3 + i * 0.4}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.3"
                    to="0"
                    dur={`${3 + i * 0.4}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              {/* Label */}
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                fill="hsl(45 30% 70%)"
                fontSize="2.2"
                fontFamily="DM Sans, sans-serif"
                fontWeight="500"
              >
                {node.label}
              </text>
            </g>
          ))}

          {/* Central glow */}
          <circle cx="50" cy="50" r="15" fill="hsl(152 45% 28%)" opacity="0.04">
            {!prefersReducedMotion && (
              <animate attributeName="r" values="12;18;12" dur="6s" repeatCount="indefinite" />
            )}
          </circle>
        </svg>
      </div>
    </div>
  );
}
