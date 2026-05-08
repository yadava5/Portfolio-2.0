"use client";

import { personalInfo, socialLinks } from "@/lib/data/personal";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 w-full border-t border-white/10 bg-black/20 py-8 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <p className="text-sm text-white/50">
          &copy; {currentYear} {personalInfo.name}. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/50 transition-colors hover:text-white"
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
