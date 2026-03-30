"use client";

import { useState } from "react";
import { personalInfo, socialLinks } from "@/lib/data/personal";
import { Mail, MapPin, Linkedin, Github } from "lucide-react";
import { getThemeConfig } from "@/config/themes";

interface ContactProps {
  themeId?: string;
}

export function Contact({ themeId = "dark-luxe" }: ContactProps) {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const config = getThemeConfig(themeId);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormState({ name: "", email: "", message: "" });
      setSubmitted(false);
    }, 3000);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Mail":
        return Mail;
      case "Linkedin":
        return Linkedin;
      case "Github":
        return Github;
      default:
        return null;
    }
  };

  return (
    <section
      id="contact"
      className="relative py-24 md:py-32 px-4 md:px-8 bg-background"
      data-theme={themeId}
      style={{
        backgroundColor:
          themeId === "paper-ink"
            ? "#f5f1de"
            : themeId === "editorial"
            ? "#fefefe"
            : undefined,
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="mb-16 flex flex-col items-center">
          <div
            className="h-px w-12 mb-6"
            style={{
              background:
                themeId === "dark-luxe" || themeId === "noir-cinema"
                  ? "linear-gradient(to right, transparent, var(--accent-primary), transparent)"
                  : themeId === "neon-cyber"
                  ? "linear-gradient(to right, transparent, var(--neon-green), transparent)"
                  : "solid black",
            }}
          />
          <h2
            className={`text-5xl md:text-6xl font-light text-foreground text-center ${
              themeId === "paper-ink" || themeId === "editorial" ? "text-black" : ""
            }`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            Get in Touch
          </h2>
          <p className={`text-foreground-muted text-lg mt-6 max-w-2xl text-center ${
            themeId === "paper-ink" || themeId === "editorial" ? "text-gray-600" : ""
          }`}>
            Interested in working together? Let me know how I can help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3
                className="text-2xl font-light text-accent-primary mb-4 uppercase tracking-wide"
                style={{
                  fontFamily: "var(--font-display)",
                  fontVariant: "small-caps",
                }}
              >
                Contact Info
              </h3>
              <div
                className="h-px w-12"
                style={{
                  background:
                    "linear-gradient(to right, var(--accent-primary), transparent)",
                }}
              />
            </div>

            {/* Email */}
            <div className="flex items-start gap-4 transition-all duration-300 hover:translate-x-1">
              <Mail className="w-6 h-6 text-accent-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-foreground font-medium mb-1">Email</p>
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="text-accent-secondary hover:text-accent-primary transition-colors text-sm"
                >
                  {personalInfo.email}
                </a>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-4 transition-all duration-300 hover:translate-x-1">
              <MapPin className="w-6 h-6 text-accent-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-foreground font-medium mb-1">Location</p>
                <p className="text-accent-secondary text-sm">{personalInfo.location}</p>
              </div>
            </div>

            {/* Availability */}
            <div
              className="p-6 rounded-sm"
              style={{
                backgroundColor: "var(--card-bg)",
                opacity: 0.5,
              }}
            >
              <p className="text-foreground font-medium mb-2 uppercase tracking-widest text-sm">
                Availability
              </p>
              <p className="text-foreground-muted text-sm">{personalInfo.availability}</p>
            </div>

            {/* Social Links */}
            <div>
              <p className="text-foreground font-medium mb-4 uppercase tracking-widest text-sm">
                Connect
              </p>
              <div className="flex gap-4">
                {socialLinks.map((link) => {
                  const IconComponent = getIconComponent(link.icon);
                  return (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center border text-accent-primary hover:bg-accent-primary hover:text-background transition-all duration-300 rounded-sm"
                      style={{ borderColor: "var(--accent-primary)" }}
                      title={link.name}
                    >
                      {IconComponent && <IconComponent size={18} />}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h3
              className="text-2xl font-light text-accent-primary mb-4 uppercase tracking-wide"
              style={{
                fontFamily: "var(--font-display)",
                fontVariant: "small-caps",
              }}
            >
              Send a Message
            </h3>
            <div
              className="h-px w-12 mb-8"
              style={{
                background:
                  "linear-gradient(to right, var(--accent-primary), transparent)",
              }}
            />

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name field */}
              <div>
                <label className="block text-sm uppercase tracking-widest text-foreground mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-background border-b text-foreground placeholder-foreground-muted focus:outline-none transition-colors duration-300 py-2 text-sm"
                  placeholder="Your name"
                  style={{
                    borderBottomColor: "var(--accent-primary)",
                    borderBottomWidth: "1px",
                    opacity: 0.4,
                  } as React.CSSProperties}
                />
              </div>

              {/* Email field */}
              <div>
                <label className="block text-sm uppercase tracking-widest text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-background border-b text-foreground placeholder-foreground-muted focus:outline-none transition-colors duration-300 py-2 text-sm"
                  placeholder="your@email.com"
                  style={{
                    borderBottomColor: "var(--accent-primary)",
                    borderBottomWidth: "1px",
                    opacity: 0.4,
                  } as React.CSSProperties}
                />
              </div>

              {/* Message field */}
              <div>
                <label className="block text-sm uppercase tracking-widest text-foreground mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full bg-background border-b text-foreground placeholder-foreground-muted focus:outline-none transition-colors duration-300 py-2 text-sm resize-none"
                  placeholder="Your message..."
                  style={{
                    borderBottomColor: "var(--accent-primary)",
                    borderBottomWidth: "1px",
                    opacity: 0.4,
                  } as React.CSSProperties}
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full px-6 py-3 border text-accent-primary hover:bg-accent-primary hover:text-background transition-all duration-300 text-sm uppercase tracking-widest font-medium mt-8"
                style={{ borderColor: "var(--accent-primary)" }}
              >
                {submitted ? "Message Sent" : "Send Message"}
              </button>

              {/* Status message */}
              {submitted && (
                <p className="text-accent-primary text-sm text-center">
                  Thank you for your message. I&apos;ll get back to you soon!
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom divider */}
        <div
          className="h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--accent-secondary), transparent)",
          }}
        />

        {/* Footer */}
        <div className="mt-12 text-center text-foreground-muted text-sm">
          <p>
            Designed & built by Ayush Yadav •{" "}
            <span className="text-accent-primary">{config.label} Theme</span> • 2026
          </p>
        </div>
      </div>
    </section>
  );
}
