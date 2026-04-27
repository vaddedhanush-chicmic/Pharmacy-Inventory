import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PharmaCare - Inventory Management",
  description: "A calm, clinical-soft pharmacy inventory management system",
};

export const viewport: Viewport = {
  themeColor: "#7FBA9B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} h-full bg-background`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#ffffff",
              border: "1px solid #c8e0d8",
              borderRadius: "0.75rem",
            },
          }}
        />
      </body>
    </html>
  );
}
