import type { Metadata } from "next";
import { Nunito, Poppins } from "next/font/google";
import "./globals.css";
import ConditionalSiteHeader from "@/components/ConditionalSiteHeader";
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

const siteDescription =
  "A daily learning platform for kids 6–14. Typing, math, and eco lessons that build daily habits — not just screen time. Try free.";

export const metadata: Metadata = {
  metadataBase: new URL("https://mygreenkeys.com"),
  title: {
    default: "My Green Keys — Daily learning habits for kids 6–14",
    template: "%s | My Green Keys",
  },
  description: siteDescription,
  keywords: [
    "typing for kids",
    "kids typing app",
    "homeschool typing",
    "kids learning app",
    "educational software for kids",
    "typing software for schools",
    "daily learning habits",
    "kids math app",
    "eco lessons for kids",
  ],
  authors: [{ name: "My Green Keys" }],
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "My Green Keys — Daily learning habits for kids 6–14",
    description: siteDescription,
    url: "https://mygreenkeys.com",
    siteName: "My Green Keys",
    images: [{ url: "/logo-bgr.png", width: 1200, height: 630, alt: "My Green Keys" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Green Keys — Daily learning habits for kids 6–14",
    description: siteDescription,
    images: ["/logo-bgr.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("h-full", nunito.variable, poppins.variable)}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <Providers>
          <ConditionalSiteHeader />
          <main className="flex-1">{children}</main>
          <ConditionalSiteFooter />
        </Providers>
      </body>
    </html>
  );
}
