"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";

/**
 * GSAP context type
 * @internal
 */
type GSAPContext = ReturnType<typeof gsap.context>;

/**
 * Hook for GSAP context creation and automatic cleanup
 *
 * Manages GSAP context lifecycle, ensuring that all animations and tweens
 * created within the hook are cleaned up on component unmount.
 * Prevents memory leaks from abandoned tweens, timelines, and listeners.
 *
 * @returns The GSAP context object for adding animations
 *
 * @example
 * ```tsx
 * export function MyComponent() {
 *   const ctx = useGSAPCleanup();
 *
 *   useEffect(() => {
 *     // All animations added to ctx are automatically cleaned up
 *     ctx.add(() => {
 *       gsap.to(".element", { duration: 1, opacity: 1 });
 *     });
 *   }, [ctx]);
 *
 *   return <div className="element">Hello</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * export function ComplexAnimation() {
 *   const ctx = useGSAPCleanup();
 *   const containerRef = useRef(null);
 *
 *   useEffect(() => {
 *     if (!containerRef.current) return;
 *
 *     ctx.add(() => {
 *       const tl = gsap.timeline();
 *       tl.to(".item-1", { duration: 1, x: 100 })
 *         .to(".item-2", { duration: 1, y: -50 }, 0);
 *     });
 *   }, [ctx]);
 *
 *   return (
 *     <div ref={containerRef}>
 *       <div className="item-1">Item 1</div>
 *       <div className="item-2">Item 2</div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useGSAPCleanup() {
  // Use useState with lazy initializer to safely create context on first render
  const [context] = useState<GSAPContext>(() =>
    gsap.context(() => {
      // Context is created, animations can be added via ctx.add()
    })
  );

  useEffect(() => {
    // Return cleanup function
    return () => {
      if (context) {
        // Revert all animations and listeners created within this context
        context.revert();
      }
    };
  }, [context]);

  return context;
}
