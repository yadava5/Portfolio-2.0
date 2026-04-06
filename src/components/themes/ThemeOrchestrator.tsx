"use client";

import { useTheme } from "@/hooks/useTheme";
import { LiquidGlassBg } from "@/components/backgrounds/LiquidGlassBg";
import { CosmicVoyageBg } from "@/components/backgrounds/CosmicVoyageBg";
import { RetroTerminalBg } from "@/components/backgrounds/RetroTerminalBg";
import { SynthwaveSunsetBg } from "@/components/backgrounds/SynthwaveSunsetBg";
import { BioluminescentBg } from "@/components/backgrounds/BioluminescentBg";
import { GlassCursor } from "@/components/cursors/GlassCursor";
import { StarCursor } from "@/components/cursors/StarCursor";
import { BlockCursor } from "@/components/cursors/BlockCursor";
import { NeonCursor } from "@/components/cursors/NeonCursor";
import { OrbCursor } from "@/components/cursors/OrbCursor";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { Testimonials } from "@/components/sections/Testimonials";
import { Contact } from "@/components/sections/Contact";

export function ThemeOrchestrator() {
  const { theme } = useTheme();

  return (
    <div className="relative min-h-screen w-full">
      {/* Backgrounds */}
      {theme === "liquid-glass" && <LiquidGlassBg />}
      {theme === "cosmic-voyage" && <CosmicVoyageBg />}
      {theme === "retro-terminal" && <RetroTerminalBg />}
      {theme === "synthwave-sunset" && <SynthwaveSunsetBg />}
      {theme === "bioluminescent-deep" && <BioluminescentBg />}
      
      {/* Cursors */}
      {theme === "liquid-glass" && <GlassCursor />}
      {theme === "cosmic-voyage" && <StarCursor />}
      {theme === "retro-terminal" && <BlockCursor />}
      {theme === "synthwave-sunset" && <NeonCursor />}
      {theme === "bioluminescent-deep" && <OrbCursor />}

      {/* Sections */}
      <div className="relative z-10 flex flex-col">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Testimonials />
        <Contact />
      </div>
    </div>
  );
}
