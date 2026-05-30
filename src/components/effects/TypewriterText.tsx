"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

gsap.registerPlugin(ScrollTrigger);

interface TypewriterTextProps {
  text: string;
  className?: string;
  delay?: number;
  immediate?: boolean;
}

export function TypewriterText({
  text,
  className = "",
  delay = 0,
  immediate = false,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState(() =>
    immediate ? text : ""
  );
  const containerRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(immediate);

  useEffect(() => {
    if (immediate) {
      setDisplayedText(text);
      setIsVisible(true);
    }
  }, [immediate, text]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      onEnter: () => setIsVisible(true),
    });

    return () => trigger.kill();
  }, []);

  useEffect(() => {
    if (!isVisible || immediate) return;

    let i = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    const timer = setTimeout(() => {
      interval = setInterval(() => {
        setDisplayedText(text.substring(0, i));
        i++;
        if (i > text.length && interval) clearInterval(interval);
      }, 30);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [text, isVisible, delay]);

  return (
    <span ref={containerRef} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {displayedText}
        <span className="ml-1 inline-block h-[1em] w-2 animate-pulse bg-[#00ff41] align-middle" />
      </span>
    </span>
  );
}
