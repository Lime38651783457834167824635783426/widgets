import type { Metadata } from "next";
import "@/css/globals.css";

export const metadata: Metadata = {
  title: "eeeeee eeee eee",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className="overflow-hidden transition-transform">
        {children}
      </body>
    </html>
  );
}
