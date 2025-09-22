import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import CryptoPriceTicker from "./components/CryptoPriceTicker";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PICZEL - Meme NFT platform",
  description:
    "Meme NFT platform and investment company",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen`}
      >
        <AuthProvider>
          <Navbar />
          <CryptoPriceTicker />
          <main className="pt-28">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
