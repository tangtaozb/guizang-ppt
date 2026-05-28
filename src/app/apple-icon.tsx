import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
          fontWeight: 700,
          background: "#0a0a0b",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#a72f24",
          borderRadius: 32,
          fontFamily: "system-ui",
          letterSpacing: "-0.05em",
        }}
      >
        A
      </div>
    ),
    { ...size }
  );
}
