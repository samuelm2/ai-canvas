import type { Metadata } from "next";
import ErrorBoundary from "../components/ErrorBoundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Image Canvas",
  description: "Generate images with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
