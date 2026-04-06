"use client";

import { ReactNode } from "react";

interface SnapScrollWrapperProps {
  children: ReactNode;
  className?: string;
}

export function SnapScrollWrapper({ children, className = "" }: SnapScrollWrapperProps) {
  return (
    <div className={`h-screen w-full overflow-y-auto snap-y snap-mandatory scroll-smooth ${className}`}>
      {children}
    </div>
  );
}

export function SnapSection({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <div className={`h-screen w-full snap-start snap-always flex items-center justify-center ${className}`}>
      {children}
    </div>
  );
}
