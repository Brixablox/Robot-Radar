import "./globals.css";
import NavDock from "../components/NavDock";
import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#0B1020",
          color: "white",
          minHeight: "100vh",
        }}
      >
        {children}
        <NavDock />
      </body>
    </html>
  );
}
