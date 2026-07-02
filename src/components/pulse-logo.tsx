import { useId, type SVGProps } from "react";

// 4-pointed sparkle star — Pulse identity mark
// Supports a flat mode (nav/small use) and a 3D mode with gradient shading + optional animation.
export function PulseLogo({
  className,
  variant = "flat",
  animated = false,
  ...props
}: SVGProps<SVGSVGElement> & { variant?: "flat" | "3d"; animated?: boolean }) {
  const uid = useId().replace(/[:]/g, "");
  const starPath =
    "M50 2 C 52 32, 68 48, 98 50 C 68 52, 52 68, 50 98 C 48 68, 32 52, 2 50 C 32 48, 48 32, 50 2 Z";

  if (variant === "flat") {
    return (
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        {...props}
      >
        <path d={starPath} fill="currentColor" />
      </svg>
    );
  }

  const gradA = `pulse-grad-a-${uid}`;
  const gradB = `pulse-grad-b-${uid}`;
  const spec = `pulse-spec-${uid}`;
  const glow = `pulse-glow-${uid}`;

  return (
    <svg
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <defs>
        {/* Base violet→pink 3D body */}
        <radialGradient id={gradA} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#fbcfe8" />
          <stop offset="35%" stopColor="#c084fc" />
          <stop offset="75%" stopColor="#6d28d9" />
          <stop offset="100%" stopColor="#1e0740" />
        </radialGradient>
        {/* Rim / edge tint */}
        <linearGradient id={gradB} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
        </linearGradient>
        {/* Specular highlight */}
        <radialGradient id={spec} cx="35%" cy="28%" r="22%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        {/* Outer glow */}
        <radialGradient id={glow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#a855f7" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Halo */}
      <circle
        cx="60"
        cy="60"
        r="58"
        fill={`url(#${glow})`}
        className={animated ? "origin-center animate-[pulseHalo_1.8s_ease-in-out_infinite]" : ""}
      />

      {/* Star body — rotates gently while animated */}
      <g
        transform="translate(10 10)"
        className={
          animated
            ? "origin-center [transform-box:fill-box] animate-[pulseSpin_3.6s_ease-in-out_infinite]"
            : ""
        }
        style={{ transformOrigin: "60px 60px" }}
      >
        {/* Soft drop shadow underneath for depth */}
        <path d={starPath} fill="#1a0533" opacity="0.6" transform="translate(2 4)" />
        {/* Main filled star */}
        <path d={starPath} fill={`url(#${gradA})`} />
        {/* Rim shading over the star */}
        <path d={starPath} fill={`url(#${gradB})`} style={{ mixBlendMode: "overlay" }} />
        {/* Specular highlight */}
        <ellipse cx="38" cy="30" rx="14" ry="9" fill={`url(#${spec})`} />
      </g>

      <style>{`
        @keyframes pulseSpin {
          0%, 100% { transform: translate(10px, 10px) rotate(-6deg) scale(1); }
          50%      { transform: translate(10px, 10px) rotate(6deg)  scale(1.06); }
        }
        @keyframes pulseHalo {
          0%, 100% { opacity: 0.55; transform: scale(0.92); transform-origin: 60px 60px; }
          50%      { opacity: 1;    transform: scale(1.08); transform-origin: 60px 60px; }
        }
      `}</style>
    </svg>
  );
}