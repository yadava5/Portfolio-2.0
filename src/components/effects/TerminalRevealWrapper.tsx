"use client";

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";

const TerminalStepContext = createContext(0);

export function useTerminalStep() {
  return useContext(TerminalStepContext);
}

interface TerminalRevealWrapperProps {
  children: ReactNode;
  className?: string;
  stepCount: number;
}

export function TerminalRevealWrapper({ children, className = "", stepCount }: TerminalRevealWrapperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        if (currentStep < stepCount) {
          e.preventDefault();
          setCurrentStep((prev) => prev + 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, stepCount]);

  return (
    <TerminalStepContext.Provider value={currentStep}>
      <div
        ref={containerRef}
        className={`relative cursor-pointer ${className}`}
        onClick={() => {
          if (currentStep < stepCount) {
            setCurrentStep((prev) => prev + 1);
          }
        }}
      >
        {currentStep < stepCount && (
          <div className="absolute top-4 right-4 text-[#00ff41]/50 text-xs animate-pulse z-10">
            [PRESS ENTER OR CLICK TO CONTINUE]
          </div>
        )}
        {children}
      </div>
    </TerminalStepContext.Provider>
  );
}

interface TerminalStepItemProps {
  children: ReactNode;
  step: number;
  className?: string;
}

export function TerminalStepItem({ children, step, className = "" }: TerminalStepItemProps) {
  const currentStep = useTerminalStep();
  const visible = currentStep > step;

  return (
    <div
      className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"} ${className}`}
    >
      {children}
    </div>
  );
}
