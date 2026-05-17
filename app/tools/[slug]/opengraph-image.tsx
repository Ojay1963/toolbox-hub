import { ImageResponse } from "next/og";
import { getTool } from "@/lib/tools";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const categoryColors: Record<string, string> = {
  "image-tools": "#059669",
  "pdf-tools": "#d97706",
  "text-tools": "#0284c7",
  "developer-tools": "#475569",
  "generator-tools": "#dc2626",
  "calculator-tools": "#7c3aed",
  "converter-tools": "#ea580c",
  "internet-tools": "#0891b2",
};

const categoryLabels: Record<string, string> = {
  "image-tools": "Image Tools",
  "pdf-tools": "PDF Tools",
  "text-tools": "Text Tools",
  "developer-tools": "Developer Tools",
  "generator-tools": "Generator Tools",
  "calculator-tools": "Calculator Tools",
  "converter-tools": "Converter Tools",
  "internet-tools": "Internet Tools",
};

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getTool(slug);

  const toolName =
    tool?.seoTitle ??
    slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const categoryColor = tool ? (categoryColors[tool.category] ?? "#6366f1") : "#6366f1";
  const categoryLabel = tool ? (categoryLabels[tool.category] ?? "") : "";
  const description = tool?.shortDescription ?? "Free online tool — no signup required.";

  const fontSize = toolName.length > 50 ? 52 : toolName.length > 35 ? 62 : 72;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0F172A",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px 70px",
          justifyContent: "space-between",
          fontFamily: "sans-serif",
        }}
      >
        {/* Category badge */}
        <div style={{ display: "flex" }}>
          {categoryLabel ? (
            <div
              style={{
                backgroundColor: categoryColor,
                borderRadius: "10px",
                padding: "8px 20px",
                display: "flex",
              }}
            >
              <span
                style={{
                  color: "white",
                  fontSize: "17px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {categoryLabel}
              </span>
            </div>
          ) : null}
        </div>

        {/* Tool name + description */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <span
            style={{
              color: "white",
              fontSize,
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {toolName}
          </span>
          <span
            style={{
              color: "#94A3B8",
              fontSize: "22px",
              lineHeight: 1.5,
              maxWidth: "860px",
            }}
          >
            {description}
          </span>
          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            {(["Free to Use", "No Signup", "Works in Browser"] as const).map((label) => (
              <div
                key={label}
                style={{
                  backgroundColor: "#1E3A5F",
                  borderRadius: "8px",
                  padding: "6px 16px",
                  display: "flex",
                }}
              >
                <span style={{ color: "#60A5FA", fontSize: "15px", fontWeight: 600 }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#475569", fontSize: "19px", fontWeight: 600 }}>
            toolboxhubapp.com
          </span>
          <span style={{ fontSize: "26px", fontWeight: 900, letterSpacing: "-0.01em" }}>
            <span style={{ color: "#6366F1" }}>Toolbox</span>
            <span style={{ color: "#94A3B8" }}> Hub</span>
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
