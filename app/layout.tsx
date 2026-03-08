import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "I&D Awareness Agent",
  description: "DEI Team Portal — Inclusion & Diversity Awareness Agent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f5f5f7] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
