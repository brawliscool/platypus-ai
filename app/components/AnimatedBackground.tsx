const dots = Array.from({ length: 50 }).map((_, index) => ({
  id: index,
  top: `${(index * 37) % 100}%`,
  left: `${(index * 61) % 100}%`,
  size: `${(index % 3) + 1}px`,
  delay: `${(index % 7) * 0.7}s`,
  duration: `${2 + (index % 5) * 0.4}s`,
}));

export default function AnimatedBackground() {

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

