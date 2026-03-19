"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// ============================================================================
// FLOATING PARTICLES COMPONENT (Client-side only to prevent hydration mismatch)
// ============================================================================

export function FloatingParticles() {
  const [isMounted, setIsMounted] = useState(false);
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      size: number;
      x: number;
      y: number;
      duration: number;
      delay: number;
    }>
  >([]);

  useEffect(() => {
    setIsMounted(true);
    // Generate particles on client side only
    setParticles(
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        size: Math.random() * 3 + 1,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
      }))
    );
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-blue-500/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// ANIMATED GRID BACKGROUND
// ============================================================================

export function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
      <motion.div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "100px 100px",
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 100, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}
