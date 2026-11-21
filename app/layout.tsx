import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Form Event",
  description: "Pengalihan ke formulir event",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
