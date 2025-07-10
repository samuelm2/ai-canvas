import type { Metadata } from "next";
import ErrorBoundary from "../components/ErrorBoundary";
import "./globals.css";

/**
 * Metadata configuration for the application
 * Defines the title and description for SEO and browser tabs
 */
export const metadata: Metadata = {
  title: "AI Image Canvas",
  description: "Generate images with AI",
};

/**
 * Root layout component that wraps all pages in the application
 * Provides basic HTML structure, global styles, and error boundary
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} The root layout with HTML structure
 */
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
