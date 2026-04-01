"use client";

/**
 * @fileoverview Global error boundary for root layout errors
 *
 * Client component that catches errors in the root layout itself.
 * Must include its own html/body tags.
 */

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Error - Portfolio</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          html {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          body {
            background: #0a0a0a;
            color: #f5f0e8;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Geist", sans-serif;
            line-height: 1.7;
            overflow-x: hidden;
          }
        `}</style>
      </head>
      <body>
        <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-8">
          {/* Background accent */}
          <div className="pointer-events-none absolute inset-0 opacity-5">
            <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 blur-3xl" />
          </div>

          {/* Content container */}
          <div className="relative z-10 mx-auto max-w-2xl space-y-8 text-center">
            {/* Error display */}
            <div className="space-y-4">
              <div
                className="text-6xl font-bold text-red-500"
                style={{ fontFamily: "serif" }}
              >
                Critical Error
              </div>
              <h1
                className="text-3xl font-bold tracking-tight text-[#f5f0e8] sm:text-4xl"
                style={{ fontFamily: "serif" }}
              >
                Application Error
              </h1>
              <p className="mx-auto max-w-xl text-lg leading-relaxed text-[#a09080]">
                A critical error occurred that prevented the application from
                loading. Please try refreshing the page or returning later.
              </p>

              {/* Error message (only in development) */}
              {process.env.NODE_ENV === "development" && error.message && (
                <div
                  style={{
                    marginTop: "1.5rem",
                    padding: "1rem",
                    borderRadius: "0.25rem",
                    backgroundColor: "rgba(232, 197, 71, 0.08)",
                    border: "1px solid rgba(232, 197, 71, 0.12)",
                    textAlign: "left",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.875rem",
                      fontFamily: "monospace",
                      color: "#a09080",
                      wordBreak: "break-word",
                    }}
                  >
                    {error.message}
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "1rem",
                justifyContent: "center",
                paddingTop: "1rem",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={reset}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.25rem",
                  fontWeight: "500",
                  color: "#0a0a0a",
                  backgroundColor: "#e8c547",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  transition: "background-color 0.3s ease",
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    "#d4a745";
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    "#e8c547";
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.25rem",
                  fontWeight: "500",
                  color: "#f5f0e8",
                  backgroundColor: "rgba(232, 197, 71, 0.1)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  transition: "background-color 0.3s ease",
                  textDecoration: "none",
                  display: "inline-block",
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLAnchorElement).style.backgroundColor =
                    "rgba(232, 197, 71, 0.15)";
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLAnchorElement).style.backgroundColor =
                    "rgba(232, 197, 71, 0.1)";
                }}
              >
                Return Home
              </button>
            </div>

            {/* Footer text */}
            <p
              style={{
                fontSize: "0.875rem",
                color: "#a09080",
                paddingTop: "1rem",
              }}
            >
              Error ID: {error.digest || "unknown"}
            </p>
          </div>
        </section>
      </body>
    </html>
  );
}
