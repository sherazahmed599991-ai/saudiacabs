import Link from "next/link";
import type { ContentBlock } from "@/lib/blog-data";

// Parses "[label](href)" markers inside plain text into real links -
// internal (starting with "/") via next/link, external ones as a new tab.
// Keeps src/lib/blog-data.ts as plain data (no JSX) while still giving
// every article real, contextual internal linking.
function renderInline(text: string) {
  const parts: React.ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const [, label, href] = match;
    if (href.startsWith("/")) {
      parts.push(
        <Link key={key++} href={href} style={{ color: "#B5913D", fontWeight: 600, textDecoration: "underline" }}>
          {label}
        </Link>
      );
    } else {
      parts.push(
        <a key={key++} href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#B5913D", fontWeight: 600, textDecoration: "underline" }}>
          {label}
        </a>
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

export default function RichText({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === "h2") {
          return (
            <h2 key={i} style={{ fontSize: "24px", fontWeight: 700, color: "#184A27", marginTop: "36px", marginBottom: "14px" }}>
              {block.text}
            </h2>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={i} style={{ margin: "0 0 18px 0", paddingLeft: "22px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {block.items.map((item, j) => (
                <li key={j} style={{ fontSize: "16px", lineHeight: "1.75", color: "#17351F" }}>
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} style={{ fontSize: "16px", lineHeight: "1.8", color: "#17351F", marginBottom: "18px" }}>
            {renderInline(block.text)}
          </p>
        );
      })}
    </>
  );
}
