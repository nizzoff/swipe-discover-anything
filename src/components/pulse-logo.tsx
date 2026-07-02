import type { SVGProps } from "react";

// 4-pointed sparkle star — Pulse identity mark
export function PulseLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M50 2 C 52 32, 68 48, 98 50 C 68 52, 52 68, 50 98 C 48 68, 32 52, 2 50 C 32 48, 48 32, 50 2 Z"
        fill="currentColor"
      />
    </svg>
  );
}