import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import CryptoPriceTicker from "./components/CryptoPriceTicker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DGtek - Advanced Crypto Exchange",
  description: "Professional cryptocurrency trading platform with advanced features",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen`}
      >
        <Navbar />
        <CryptoPriceTicker />
        <main className="pt-28">
          {children}
        </main>
      </body>
    </html>
  );
}
