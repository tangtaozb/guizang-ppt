import { ImageResponse } from "next/og";

export const alt = "ArtifySlide — Turn words into premium magazine-style decks";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#ffffff",
          color: "#0a0a0b",
          fontFamily: "system-ui, -apple-system, sans-serif",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
        }}
      >
        {/* Top — kicker + logo */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 18,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#737373",
              fontFamily: "monospace",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                background: "#a72f24",
              }}
            />
            ARTIFYSLIDE · MAGAZINE × SWISS DESIGN
          </div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em" }}>
            Artify<span style={{ color: "#a72f24" }}>Slide</span>
          </div>
        </div>

        {/* Middle — headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            lineHeight: 0.95,
            letterSpacing: "-0.045em",
            fontWeight: 500,
          }}
        >
          <div style={{ fontSize: 96 }}>Turn words into</div>
          <div style={{ fontSize: 96, color: "#737373", fontStyle: "italic" }}>
            premium magazine-style decks.
          </div>
        </div>

        {/* Bottom — facts */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 18,
            color: "#737373",
            fontFamily: "monospace",
            letterSpacing: "0.06em",
          }}
        >
          <div>9 EDITORIAL THEMES · CHAT EDITING · STANDALONE HTML</div>
          <div>artifyslide.com</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
