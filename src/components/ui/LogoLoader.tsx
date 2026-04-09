"use client";

import React from "react";
import { LogoMark } from "@/components/branding/Logo";

interface LogoLoaderProps {
  size?: number;
  className?: string;
}

const ORBITS = [
  { radius: 0.7, dotSize: 10, duration: 2.0, color: "#3BA99C", offset: 0 },
  { radius: 0.88, dotSize: 7, duration: 3.1, color: "#5C4B8A", offset: 0.33 },
  { radius: 1.06, dotSize: 5, duration: 4.3, color: "#3BA99Caa", offset: 0.66 },
];

const LogoLoader: React.FC<LogoLoaderProps> = ({
  size = 56,
  className = "",
}) => {
  const containerSize = size * 2.6;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: containerSize, height: containerSize }}
      role="status"
      aria-label="Loading"
    >
      <div style={{ animation: "logo-loader-pulse 2.5s ease-in-out infinite" }}>
        <LogoMark size={size} />
      </div>
      {ORBITS.map((orbit, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            animation: `logo-loader-orbit ${orbit.duration}s linear infinite`,
            animationDelay: `${-orbit.duration * orbit.offset}s`,
          }}
        >
          <div
            className="absolute left-1/2 rounded-full"
            style={{
              width: orbit.dotSize,
              height: orbit.dotSize,
              backgroundColor: orbit.color,
              top: `calc(50% - ${size * orbit.radius}px)`,
              marginLeft: -(orbit.dotSize / 2),
              boxShadow: `0 0 ${orbit.dotSize}px ${orbit.color}`,
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes logo-loader-orbit {
          to { transform: rotate(360deg); }
        }
        @keyframes logo-loader-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.04); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
};

export default LogoLoader;
