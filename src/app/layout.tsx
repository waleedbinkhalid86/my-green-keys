import type { Metadata } from "next";
import { Nunito, Poppins } from "next/font/google";
import "./globals.css";
import ConditionalSiteFooter from "@/components/ConditionalSiteFooter";
import { Providers } from "@/components/Providers";
import { cn } from "@/lib/utils";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
  weight: ["400", "600", "700", "800", "900"],
});

const poppins = Poppins({
  weight: ["300", "400", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "My Green Keys – Learn to Type. Help the Planet.",
  description:
    "A premium educational typing platform for kids aged 6–14. Learn keyboard skills, sustainability, health tips, and manners.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("h-full", nunito.variable, poppins.variable)}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <Providers>
          <main className="flex-1">{children}</main>
          <ConditionalSiteFooter />
        </Providers>
      </body>
    </html>
  );
}
