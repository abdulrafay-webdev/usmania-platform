import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Jamia Usmania Trust — Madrasa Management Portal",
  description: "Official Madrasa Student & Teacher Management System, Finance Module, RBAC Roles & Access Control.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F8FAFC]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
