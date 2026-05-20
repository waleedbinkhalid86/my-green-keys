import Link from "next/link";
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
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
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
