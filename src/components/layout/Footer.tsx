"use client";

import { personalInfo, socialLinks } from "@/lib/data/personal";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 w-full py-8 border-t border-white/10 bg-black/20 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-white/50 text-sm">
          &copy; {currentYear} {personalInfo.name}. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white text-sm transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
