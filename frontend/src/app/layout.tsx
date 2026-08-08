import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jamia Usmania Trust — Madrasa Management Portal",
  description: "Official Madrasa Student & Teacher Management System. Handles admissions, profile records, Hijri date conversion, PDF export, and bulk Excel export.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F8FAFC]">{children}</body>
    </html>
  );
}
