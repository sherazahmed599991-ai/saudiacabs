"use client";

import { useEffect } from "react";

// Catches unexpected rendering errors in a route segment. Kept free of the
// shared Header/Footer so it still renders if one of them is what failed.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main-content" style={{ flex: 1, display: "grid", placeItems: "center", padding: "80px 24px" }}>
      <div style={{ maxWidth: "520px", textAlign: "center" }}>
        <h1 style={{ marginBottom: "16px" }}>Something went wrong</h1>
        <p style={{ marginBottom: "28px" }}>
          Sorry about that. Please try again, or message us on WhatsApp at +966 59 894 7503 and we&apos;ll sort out your
          booking directly.
        </p>
        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <button type="button" onClick={reset} className="btn-primary">Try again</button>
          <a href="https://wa.me/966598947503" target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
            WhatsApp Us
          </a>
        </div>
      </div>
    </main>
  );
}
