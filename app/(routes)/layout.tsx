import localFont from "next/font/local";
import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "sonner";

const geistSans = localFont({
  src: "../_fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../_fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AppTestify",
  //  title: "AppTestify Platform",
  description: "AppTestify",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster richColors closeButton />
        {children}
      </body>
    </html>
  );
}
