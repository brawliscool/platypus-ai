"use client";

import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  const [dots, setDots] = useState<{ id: number; top: string; left: string; size: string; delay: string; duration: string }[]>([]);

  useEffect(() => {
    const dotCount = 50;
    const newDots = Array.from({ length: dotCount }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 3 + 2}s`,
    }));
    setDots(newDots);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {dots.map((dot) => (
        <div
          key={dot.id}
          className="absolute bg-white rounded-full animate-fade-in-out"
          style={{
            top: dot.top,
            left: dot.left,
            width: dot.size,
            height: dot.size,
            animationDelay: dot.delay,
            animationDuration: dot.duration,
          }}
        />
      ))}
    </div>
  );
}

