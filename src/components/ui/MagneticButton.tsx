/**
 * @fileoverview Magnetic button wrapper with hover attraction effect
 *
 * Creates a magnetic attraction effect where the element follows
 * the cursor slightly when hovering, giving a "pulled towards"
 * sensation.
 *
 * @module components/ui/MagneticButton
 */

"use client";

import { useRef, useState, useCallback, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Props for MagneticButton */
export interface MagneticButtonProps {
  /** Child elements to wrap */
  children: ReactNode;
  /** Strength of the magnetic effect (0-1), default 0.65 */
  strength?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether the effect is disabled */
  disabled?: boolean;
}

/**
 * Magnetic button wrapper component
 *
 * Wraps any element to add a magnetic hover effect where the element
 * subtly moves towards the cursor position.
 *
 * @example
 * ```tsx
 * <MagneticButton strength={0.2}>
 *   <button className="btn">Click me</button>
 * </MagneticButton>
 * ```
 *
 * @param props - Component props
 * @returns A wrapper div with magnetic effect
 */
export function MagneticButton({
  children,
  strength = 0.65,
  className,
  disabled = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      setPosition({ x: deltaX, y: deltaY });
    },
    [strength, disabled]
  );

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={ref}
      className={cn("inline-block", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition:
          position.x === 0 && position.y === 0
            ? "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
            : "none",
      }}
    >
      {children}
    </div>
  );
}

export default MagneticButton;
