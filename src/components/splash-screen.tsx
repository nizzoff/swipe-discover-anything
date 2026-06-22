import { useEffect, useState } from "react";
import logoSrc from "@/assets/swipeit-logo.png";

const SPLASH_KEY = "swipeit-splash-shown";

export function SplashScreen() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(SPLASH_KEY) !== "1";
  });
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const leaveTimer = setTimeout(() => setLeaving(true), 1500);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem(SPLASH_KEY, "1");
    }, 1900);
    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(hideTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] grid place-items-center bg-background transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      {/* Animated color halos */}
      <div className="splash-halo splash-halo-1" />
      <div className="splash-halo splash-halo-2" />
      <div className="splash-halo splash-halo-3" />

      <div className="relative">
        {/* Glow behind logo */}
        <div className="splash-glow absolute inset-0 rounded-full blur-3xl" />
        {/* Logo with hue-rotate animation */}
        <img
          src={logoSrc}
          alt="SwipeIt"
          className="splash-logo relative h-40 w-40 object-contain drop-shadow-2xl sm:h-48 sm:w-48"
        />
      </div>
    </div>
  );
}