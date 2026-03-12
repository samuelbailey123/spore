import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Spore — Pollen Intelligence Dashboard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#052e16",
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(34,197,94,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(74,222,128,0.06) 0%, transparent 50%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Pollen dot */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            backgroundColor: "#22c55e",
            boxShadow:
              "0 0 40px rgba(34,197,94,0.4), 0 0 80px rgba(34,197,94,0.2)",
            marginBottom: 32,
            display: "flex",
          }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#ecfdf5",
            letterSpacing: "0.05em",
            display: "flex",
          }}
        >
          SPORE
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 22,
            color: "#86efac",
            letterSpacing: "0.2em",
            marginTop: 16,
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          Pollen Intelligence
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background:
              "linear-gradient(90deg, transparent, #22c55e, transparent)",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
