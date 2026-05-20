import Link from "next/link";
import { Facebook } from "lucide-react";
import { SiteFooterBrand } from "@/components/SiteFooterBrand";
import { SOCIAL_LINKS } from "@/lib/social-links";

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="mb-3 block text-sm text-gray-400 transition-colors hover:text-white last:mb-0"
    >
      {children}
    </Link>
  );
}

export default function SiteFooter() {
  return (
    <footer className="w-full bg-[#1A2F23] pt-16 pb-8 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          <div className="md:col-span-2">
            <SiteFooterBrand />
            <p className="mt-2 max-w-xs text-sm text-gray-400">
              Learn to Type. Help the Planet.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-300">
                COPPA Compliant
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-300">
                GDPR Safe
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-300">
                Ad-Free
              </span>
            </div>
            <div className="mt-6">
              <h3 className="mb-4 text-sm font-semibold uppercase text-white">
                Follow us
              </h3>
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit My Green Keys on Facebook"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border-0 bg-[#2D6A4F] text-white transition-colors duration-200 hover:bg-[#52B788]"
              >
                <Facebook size={22} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Product</h3>
            <nav className="flex flex-col">
              <FooterLink href="/lesson">Lessons</FooterLink>
              <FooterLink href="/games">Games</FooterLink>
              <FooterLink href="/pricing">Pricing</FooterLink>
              <FooterLink href="/schools">For Schools</FooterLink>
            </nav>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Company</h3>
            <nav className="flex flex-col">
              <FooterLink href="/">Story</FooterLink>
              <a
                href="mailto:mygreenkeys26@gmail.com"
                className="mb-3 block text-sm text-gray-400 transition-colors hover:text-white last:mb-0"
              >
                Contact
              </a>
            </nav>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Legal</h3>
            <nav className="flex flex-col">
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/refund">Refund Policy</FooterLink>
              <FooterLink href="/privacy">Cookies</FooterLink>
              <FooterLink href="/privacy">COPPA</FooterLink>
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} My Green Keys. All rights reserved.
          </p>
          <p className="text-center text-xs text-gray-500 md:text-right">Made in Pakistan</p>
        </div>
      </div>
    </footer>
  );
}
