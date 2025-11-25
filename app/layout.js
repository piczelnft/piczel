import { Geist, Geist_Mono, Rajdhani } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "./components/ConditionalLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import { WalletProvider } from "@/contexts/WalletContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "PICZEL - NFT's Platform",
  description:
    "Professional cryptocurrency trading and investment platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${rajdhani.variable} antialiased min-h-screen`}
        style={{fontFamily: 'var(--font-rajdhani)', background: 'var(--default-body-bg-color)'}}
      >
        <AuthProvider>
          <WalletProvider>
            <SidebarProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </SidebarProvider>
          </WalletProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
