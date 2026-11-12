import { ImageResponse } from "next/og";

export const alt = "DevSync — Find your next project. Build it with a team.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      width: "100%",
      height: "100%",
      padding: "72px",
      color: "#f4faf9",
      background: "linear-gradient(145deg, #080d12 35%, #0b2c38 75%, #12524b 100%)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 34, fontWeight: 700, marginBottom: 46 }}>
        <span style={{ color: "#5ee4b9" }}>›_</span> DevSync
      </div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 72, lineHeight: 1.1, fontWeight: 700, letterSpacing: -3 }}>
        <span>Find your next project.</span>
        <span style={{ color: "#5ee4b9" }}>Build it with a team.</span>
      </div>
      <div style={{ display: "flex", fontSize: 26, color: "#b5c8cf", marginTop: 36 }}>devsyncr.xyz</div>
    </div>,
    size,
  );
}
