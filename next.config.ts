import type { NextConfig } from "next";

const publicContactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim().toLowerCase();
const hasValidPublicContactEmail = Boolean(publicContactEmail && publicContactEmail.includes("@"));

if (!hasValidPublicContactEmail) {
  console.warn(
    "[tools-website] Warning: NEXT_PUBLIC_CONTACT_EMAIL is missing or invalid. Public contact email will not appear on the contact page and footer until it is set.",
  );
}

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
