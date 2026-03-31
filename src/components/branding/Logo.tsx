import React from "react";

export interface LogoMarkProps {
  className?: string;
  size?: number;
}

export const LogoMark: React.FC<LogoMarkProps> = ({ className, size = 40 }) => {
  const dimProps = className ? {} : { width: size, height: size };
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden {...dimProps}>
      <path
        d="M8 8C8 5.79 9.79 4 12 4H28C30.21 4 32 5.79 32 8V20C32 22.21 30.21 24 28 24H16L10 30V24H12H8C8 24 8 8 8 8Z"
        fill="#3BA99C"
      />
      <circle cx="15" cy="14" r="2" fill="white" />
      <circle cx="20" cy="14" r="2" fill="white" />
      <circle cx="25" cy="14" r="2" fill="white" />
      <path
        d="M20 16C20 13.79 21.79 12 24 12H38C40.21 12 42 13.79 42 16V28C42 30.21 40.21 32 38 32H36V38L30 32H24C21.79 32 20 30.21 20 28V16Z"
        fill="#5C4B8A"
      />
      <circle cx="27" cy="22" r="2" fill="white" />
      <circle cx="32" cy="22" r="2" fill="white" />
      <circle cx="37" cy="22" r="2" fill="white" />
    </svg>
  );
};

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  subtitle?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = "md",
  showText = true,
  className = "",
  subtitle = "Powered by civilly.ai",
}) => {
  const iconSizes = { sm: 32, md: 40, lg: 56 };
  const textSizes = { sm: "text-lg", md: "text-xl", lg: "text-3xl" };
  const subtextSizes = { sm: "text-[9px]", md: "text-[10px]", lg: "text-xs" };
  const iconSize = iconSizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex shrink-0 items-end">
        <LogoMark size={iconSize} />
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-bold ${textSizes[size]} text-brand-navy-dark tracking-tight`}>
            Reply Right
          </span>
          <span className={`${subtextSizes[size]} text-brand-slate font-medium tracking-wide`}>
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
