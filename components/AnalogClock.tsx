import React, { useEffect, useState } from 'react';

interface AnalogClockProps {
  className?: string;
  size?: number;
}

export const AnalogClock: React.FC<AnalogClockProps> = ({ className = '', size = 200 }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secondDegrees = (seconds / 60) * 360;
  const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
  const hourDegrees = ((hours % 12 + minutes / 60) / 12) * 360;

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Clock Face */}
      <div className="absolute inset-0 rounded-full border-4 border-slate-200 bg-white shadow-inner">
        {/* Markers */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-slate-300 w-1 h-3 origin-bottom"
            style={{
              left: 'calc(50% - 2px)',
              top: '10px',
              height: i % 3 === 0 ? '12px' : '6px',
              width: i % 3 === 0 ? '4px' : '2px',
              transform: `rotate(${i * 30}deg)`,
              transformOrigin: `50% ${size / 2 - 14}px` // Adjust based on border/padding
            }}
          />
        ))}
      </div>

      {/* Hour Hand */}
      <div
        className="absolute w-1.5 bg-slate-800 rounded-full origin-bottom z-10"
        style={{
          height: '25%',
          bottom: '50%',
          transform: `rotate(${hourDegrees}deg)`,
          transition: 'transform 0.5s cubic-bezier(0.4, 2.08, 0.55, 0.44)',
        }}
      />

      {/* Minute Hand */}
      <div
        className="absolute w-1 bg-slate-600 rounded-full origin-bottom z-10"
        style={{
          height: '35%',
          bottom: '50%',
          transform: `rotate(${minuteDegrees}deg)`,
          transition: 'transform 0.5s cubic-bezier(0.4, 2.08, 0.55, 0.44)',
        }}
      />

      {/* Second Hand */}
      <div
        className="absolute w-0.5 bg-indigo-500 rounded-full origin-bottom z-20"
        style={{
          height: '40%',
          bottom: '50%',
          transform: `rotate(${secondDegrees}deg)`,
          transition: 'transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44)',
        }}
      />

      {/* Center Dot */}
      <div className="absolute w-3 h-3 bg-indigo-600 rounded-full z-30 border-2 border-white" />
    </div>
  );
};