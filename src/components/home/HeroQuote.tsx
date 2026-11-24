"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { waUrl } from "@/lib/contact";

type Mode = "transfer" | "daytrip";

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  fontSize: "15px",
  border: "1px solid #E4DEC6",
  borderRadius: "4px",
  color: "#17351F",
  backgroundColor: "#fff",
} as const;

const labelStyle = { display: "block", fontSize: "13px", fontWeight: 500, color: "#17351F", marginBottom: "6px" } as const;

/**
 * Quick-quote bar for the hero. There is no backend: it builds a WhatsApp
 * message from the fields and opens the chat, which is how quotes are given.
 */
export default function HeroQuote() {
  const [mode, setMode] = useState<Mode>("transfer");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [pax, setPax] = useState("");

  const message = (() => {
    const lines = [
      mode === "transfer" ? "Salam, I need a quote for a private transfer." : "Salam, I need a quote for a day trip / Ziyarat tour.",
      from && (mode === "transfer" ? `From: ${from}` : `City: ${from}`),
      mode === "transfer" && to ? `To: ${to}` : null,
      date ? `Date: ${date}` : null,
      pax ? `Passengers: ${pax}` : null,
    ];
    return lines.filter(Boolean).join("\n");
  })();

  const tabStyle = (active: boolean) =>
    ({
      padding: "10px 20px",
      fontSize: "15px",
      fontWeight: 600,
      border: "none",
      borderBottom: active ? "3px solid #8F6F25" : "3px solid transparent",
      background: "none",
      color: active ? "#17351F" : "#5C6B5A",
      cursor: "pointer",
      fontFamily: "inherit",
    }) as const;

  return (
    <section style={{ backgroundColor: "#F4F1C6", padding: "0 0 8px" }}>
      <div className="container">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            window.open(waUrl(message), "_blank", "noopener,noreferrer");
          }}
          aria-label="Quick quote"
          style={{ position: "relative", top: "-36px", backgroundColor: "#fff", border: "1px solid #E4DEC6", borderRadius: "10px", boxShadow: "0 10px 30px rgba(15,42,24,0.12)", padding: "8px 24px 24px", marginBottom: "-12px" }}
        >
          <div role="tablist" aria-label="Trip type" style={{ display: "flex", gap: "4px", borderBottom: "1px solid #E4DEC6", marginBottom: "20px" }}>
            <button type="button" role="tab" aria-selected={mode === "transfer"} onClick={() => setMode("transfer")} style={tabStyle(mode === "transfer")}>
              Transfer
            </button>
            <button type="button" role="tab" aria-selected={mode === "daytrip"} onClick={() => setMode("daytrip")} style={tabStyle(mode === "daytrip")}>
              Ziyarat / Day trip
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px", alignItems: "end" }}>
            <div>
              <label htmlFor="hq-from" style={labelStyle}>{mode === "transfer" ? "From" : "City"}</label>
              <input id="hq-from" value={from} onChange={(e) => setFrom(e.target.value)} placeholder={mode === "transfer" ? "e.g. Jeddah Airport" : "e.g. Makkah"} style={inputStyle} maxLength={80} />
            </div>
            {mode === "transfer" && (
              <div>
                <label htmlFor="hq-to" style={labelStyle}>To</label>
                <input id="hq-to" value={to} onChange={(e) => setTo(e.target.value)} placeholder="e.g. Makkah hotel" style={inputStyle} maxLength={80} />
              </div>
            )}
            <div>
              <label htmlFor="hq-date" style={labelStyle}>Date</label>
              <input id="hq-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="hq-pax" style={labelStyle}>Passengers</label>
              <select id="hq-pax" value={pax} onChange={(e) => setPax(e.target.value)} style={inputStyle}>
                <option value="">Select</option>
                <option>1 – 4</option>
                <option>5 – 7</option>
                <option>8 – 11</option>
                <option>12 – 17</option>
                <option>17+</option>
              </select>
            </div>
            <button type="submit" className="btn-whatsapp" style={{ justifyContent: "center", height: "46px" }}>
              <MessageCircle size={18} /> Get Quote on WhatsApp
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
