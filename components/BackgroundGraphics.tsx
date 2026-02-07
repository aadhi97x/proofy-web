
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

const BackgroundGraphics: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * -20
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#050505]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,#08120e_0%,#050505_100%)]"></div>
      <div className="absolute inset-0 opacity-[0.03] bg-grid-forensic"></div>

      {/* Floating Data Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-neon/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 0.4, 0],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }}
        />
      ))}

      {/* Periodic Scanning Laser */}
      <motion.div
        className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-neon/40 to-transparent shadow-[0_0_20px_#00FF88]"
        initial={{ top: "-10%" }}
        animate={{ top: "110%" }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 4
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-full h-full opacity-80" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="ribbon-glow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00FF88" stopOpacity="0" />
              <stop offset="20%" stopColor="#00FF88" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#00FF88" stopOpacity="0.8" />
              <stop offset="80%" stopColor="#00FF88" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00FF88" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="ribbon-volume" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00FF88" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#00FF88" stopOpacity="0" />
            </radialGradient>
            <filter id="sharp-glow">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <motion.path
            d="M-200,600 Q400,200 1000,700 T1600,400"
            fill="none"
            stroke="url(#ribbon-volume)"
            strokeWidth="600"
            animate={{
              d: [
                "M-200,600 Q400,200 1000,700 T1600,400",
                "M-200,400 Q500,800 1100,300 T1600,600",
                "M-200,600 Q400,200 1000,700 T1600,400"
              ]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.path
            d="M-200,600 Q400,200 1000,700 T1600,400"
            fill="none"
            stroke="url(#ribbon-glow-grad)"
            strokeWidth="2"
            filter="url(#sharp-glow)"
            style={{ x: mousePos.x * 20, y: mousePos.y * 10 }}
            animate={{
              d: [
                "M-200,600 Q400,200 1000,700 T1600,400",
                "M-200,400 Q500,800 1100,300 T1600,600",
                "M-200,600 Q400,200 1000,700 T1600,400"
              ]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>

      <div className="absolute inset-0 z-[2] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,5,0.4)_60%,rgba(5,5,5,0.9)_100%)]"></div>
    </div>
  );
};

export default BackgroundGraphics;
