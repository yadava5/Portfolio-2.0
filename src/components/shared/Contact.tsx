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
  const validateField = useCallback(
    (name: string, value: string): string | undefined => {
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
    },
    []
  );

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
      className="bg-background relative px-4 py-24 md:px-8 md:py-32"
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
      <div className="mx-auto max-w-4xl">
        {/* Section header */}
        <div className="mb-16 flex flex-col items-center">
          <div
            className="mb-6 h-px w-12"
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
            className={`text-foreground text-center text-5xl font-light md:text-6xl ${
              themeId === "paper-ink" || themeId === "editorial"
                ? "text-black"
                : ""
            }`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            Get in Touch
          </h2>
          <p
            className={`text-foreground-muted mt-6 max-w-2xl text-center text-lg ${
              themeId === "paper-ink" || themeId === "editorial"
                ? "text-gray-600"
                : ""
            }`}
          >
            Interested in working together? Let me know how I can help.
          </p>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3
                className="text-accent-primary mb-4 text-2xl font-light tracking-wide uppercase"
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
              <Mail className="text-accent-primary mt-1 h-6 w-6 flex-shrink-0" />
              <div>
                <p className="text-foreground mb-1 font-medium">Email</p>
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="text-accent-secondary hover:text-accent-primary text-sm transition-colors"
                >
                  {personalInfo.email}
                </a>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-4 transition-all duration-300 hover:translate-x-1">
              <MapPin className="text-accent-primary mt-1 h-6 w-6 flex-shrink-0" />
              <div>
                <p className="text-foreground mb-1 font-medium">Location</p>
                <p className="text-accent-secondary text-sm">
                  {personalInfo.location}
                </p>
              </div>
            </div>

            {/* Availability */}
            <div
              className="rounded-sm p-6"
              style={{
                backgroundColor: "var(--card-bg)",
                opacity: 0.5,
              }}
            >
              <p className="text-foreground mb-2 text-sm font-medium tracking-widest uppercase">
                Availability
              </p>
              <p className="text-foreground-muted text-sm">
                {personalInfo.availability}
              </p>
            </div>

            {/* Social Links */}
            <div>
              <p className="text-foreground mb-4 text-sm font-medium tracking-widest uppercase">
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
                      className="text-accent-primary hover:bg-accent-primary hover:text-background flex h-10 w-10 items-center justify-center rounded-sm border transition-all duration-300"
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
              className="text-accent-primary mb-4 text-2xl font-light tracking-wide uppercase"
              style={{
                fontFamily: "var(--font-display)",
                fontVariant: "small-caps",
              }}
            >
              Send a Message
            </h3>
            <div
              className="mb-8 h-px w-12"
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
                  className="text-foreground mb-2 block text-sm tracking-widest uppercase"
                >
                  Name{" "}
                  <span className="text-red-500" aria-label="required">
                    *
                  </span>
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
                  className="bg-background text-foreground placeholder-foreground-muted w-full border-b py-2 text-sm transition-colors duration-300 focus:outline-none"
                  placeholder="Your name"
                  style={
                    {
                      borderBottomColor: formErrors.name
                        ? "#ef4444"
                        : "var(--accent-primary)",
                      borderBottomWidth: "1px",
                      opacity: 0.4,
                    } as React.CSSProperties
                  }
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
                  className="text-foreground mb-2 block text-sm tracking-widest uppercase"
                >
                  Email{" "}
                  <span className="text-red-500" aria-label="required">
                    *
                  </span>
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
                  aria-describedby={
                    formErrors.email ? "email-error" : undefined
                  }
                  className="bg-background text-foreground placeholder-foreground-muted w-full border-b py-2 text-sm transition-colors duration-300 focus:outline-none"
                  placeholder="your@email.com"
                  style={
                    {
                      borderBottomColor: formErrors.email
                        ? "#ef4444"
                        : "var(--accent-primary)",
                      borderBottomWidth: "1px",
                      opacity: 0.4,
                    } as React.CSSProperties
                  }
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
                  className="text-foreground mb-2 block text-sm tracking-widest uppercase"
                >
                  Message{" "}
                  <span className="text-red-500" aria-label="required">
                    *
                  </span>
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
                  aria-describedby={
                    formErrors.message ? "message-error" : undefined
                  }
                  className="bg-background text-foreground placeholder-foreground-muted w-full resize-none border-b py-2 text-sm transition-colors duration-300 focus:outline-none"
                  placeholder="Your message..."
                  style={
                    {
                      borderBottomColor: formErrors.message
                        ? "#ef4444"
                        : "var(--accent-primary)",
                      borderBottomWidth: "1px",
                      opacity: 0.4,
                    } as React.CSSProperties
                  }
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
                className="text-accent-primary hover:bg-accent-primary hover:text-background mt-8 w-full border px-6 py-3 text-sm font-medium tracking-widest uppercase transition-all duration-300"
                style={{ borderColor: "var(--accent-primary)" }}
              >
                {submitted ? "Message Sent" : "Send Message"}
              </button>

              {/* Status message */}
              {submitted && (
                <p
                  className="text-accent-primary text-center text-sm"
                  role="status"
                >
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
        <div className="text-foreground-muted mt-12 text-center text-sm">
          <p>
            Designed & built by Ayush Yadav •{" "}
            <span className="text-accent-primary">{config.label} Theme</span> •
            2026
          </p>
        </div>
      </div>
    </section>
  );
}
