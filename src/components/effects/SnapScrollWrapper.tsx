"use client";

import { ReactNode } from "react";

interface SnapScrollWrapperProps {
  children: ReactNode;
  className?: string;
}

export function SnapScrollWrapper({ children, className = "" }: SnapScrollWrapperProps) {
  return (
    <div className={`w-full ${className}`}>
      {children}
    </div>
  );
}

export function SnapSection({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <div className={`min-h-screen w-full flex items-center justify-center py-24 ${className}`}>
      {children}
    </div>
  );
}
