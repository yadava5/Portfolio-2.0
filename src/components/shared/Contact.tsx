"use client";

import { useState, useCallback } from "react";
import { personalInfo, socialLinks } from "@/lib/data/personal";
import { Mail, MapPin, Linkedin, Github } from "lucide-react";
import { getThemeConfig } from "@/config/themes";

interface ContactProps {
  themeId?: string;
}

/** Form validation error messages */
interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

/** Form field validation state */
interface FormTouched {
  name: boolean;
  email: boolean;
  message: boolean;
}

export function Contact({ themeId = "dark-luxe" }: ContactProps) {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formTouched, setFormTouched] = useState<FormTouched>({
    name: false,
    email: false,
    message: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const config = getThemeConfig(themeId);

  /** Validate individual field */
  const validateField = useCallback((name: string, value: string): string | undefined => {
    switch (name) {
      case "name":
        if (!value.trim()) {
          return "Name is required";
        }
        if (value.trim().length < 2) {
          return "Name must be at least 2 characters";
        }
        return undefined;

      case "email":
        if (!value.trim()) {
          return "Email is required";
        }
        // Basic email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return "Please enter a valid email address";
        }
        return undefined;

      case "message":
        if (!value.trim()) {
          return "Message is required";
        }
        if (value.trim().length < 10) {
          return "Message must be at least 10 characters";
        }
        return undefined;

      default:
        return undefined;
    }
  }, []);

  /** Validate all fields */
  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    const nameError = validateField("name", formState.name);
    const emailError = validateField("email", formState.email);
    const messageError = validateField("message", formState.message);

    if (nameError) errors.name = nameError;
    if (emailError) errors.email = emailError;
    if (messageError) errors.message = messageError;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formState, validateField]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate field as user types (if field was previously touched)
    if (formTouched[name as keyof FormTouched]) {
      const error = validateField(name, value);
      setFormErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate field on blur
    const error = validateField(name, value);
    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate all fields on submit
    if (!validateForm()) {
      // Mark all fields as touched to show errors
      setFormTouched({
        name: true,
        email: true,
        message: true,
      });
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      setFormState({ name: "", email: "", message: "" });
      setFormErrors({});
      setFormTouched({ name: false, email: false, message: false });
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

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Name field */}
              <div>
                <label
                  htmlFor="form-name"
                  className="block text-sm uppercase tracking-widest text-foreground mb-2"
                >
                  Name <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  id="form-name"
                  type="text"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  aria-required="true"
                  aria-invalid={!!formErrors.name}
                  aria-describedby={formErrors.name ? "name-error" : undefined}
                  className="w-full bg-background border-b text-foreground placeholder-foreground-muted focus:outline-none transition-colors duration-300 py-2 text-sm"
                  placeholder="Your name"
                  style={{
                    borderBottomColor: formErrors.name ? "#ef4444" : "var(--accent-primary)",
                    borderBottomWidth: "1px",
                    opacity: 0.4,
                  } as React.CSSProperties}
                />
                {formErrors.name && (
                  <p
                    id="name-error"
                    role="alert"
                    className="mt-1 text-sm text-red-500"
                  >
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Email field */}
              <div>
                <label
                  htmlFor="form-email"
                  className="block text-sm uppercase tracking-widest text-foreground mb-2"
                >
                  Email <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  id="form-email"
                  type="email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  aria-required="true"
                  aria-invalid={!!formErrors.email}
                  aria-describedby={formErrors.email ? "email-error" : undefined}
                  className="w-full bg-background border-b text-foreground placeholder-foreground-muted focus:outline-none transition-colors duration-300 py-2 text-sm"
                  placeholder="your@email.com"
                  style={{
                    borderBottomColor: formErrors.email ? "#ef4444" : "var(--accent-primary)",
                    borderBottomWidth: "1px",
                    opacity: 0.4,
                  } as React.CSSProperties}
                />
                {formErrors.email && (
                  <p
                    id="email-error"
                    role="alert"
                    className="mt-1 text-sm text-red-500"
                  >
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Message field */}
              <div>
                <label
                  htmlFor="form-message"
                  className="block text-sm uppercase tracking-widest text-foreground mb-2"
                >
                  Message <span className="text-red-500" aria-label="required">*</span>
                </label>
                <textarea
                  id="form-message"
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  rows={5}
                  aria-required="true"
                  aria-invalid={!!formErrors.message}
                  aria-describedby={formErrors.message ? "message-error" : undefined}
                  className="w-full bg-background border-b text-foreground placeholder-foreground-muted focus:outline-none transition-colors duration-300 py-2 text-sm resize-none"
                  placeholder="Your message..."
                  style={{
                    borderBottomColor: formErrors.message ? "#ef4444" : "var(--accent-primary)",
                    borderBottomWidth: "1px",
                    opacity: 0.4,
                  } as React.CSSProperties}
                />
                {formErrors.message && (
                  <p
                    id="message-error"
                    role="alert"
                    className="mt-1 text-sm text-red-500"
                  >
                    {formErrors.message}
                  </p>
                )}
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
                <p className="text-accent-primary text-sm text-center" role="status">
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
