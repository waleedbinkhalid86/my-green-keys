import Link from "next/link";

function Inner({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[1200px] px-6">{children}</div>;
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-white/45 text-sm no-underline transition-colors hover:text-white/85"
    >
      {children}
    </Link>
  );
}

export default function SiteFooter() {
  return (
    <footer className="bg-[#1a252f] pt-20 pb-10">
      <Inner>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-12">
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[var(--green)]">
                <span aria-hidden className="text-white text-[18px] leading-none">
                  🌿
                </span>
              </div>
              <span className="text-white font-extrabold text-base tracking-[-0.01em]">
                My Green Keys
              </span>
            </div>
            <p className="text-white/45 text-sm leading-7">
              A premium typing platform for kids that blends keyboard skills with planet-friendly
              values.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-white/85 text-sm font-bold">Company</h3>
            <ul className="flex list-none flex-col gap-3 p-0">
              <li>
                <FooterLink href="/">Home</FooterLink>
              </li>
              <li>
                <FooterLink href="/pricing">Pricing</FooterLink>
              </li>
              <li>
                <FooterLink href="/signup">Sign up</FooterLink>
              </li>
              <li>
                <FooterLink href="/login">Log in</FooterLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-white/85 text-sm font-bold">Legal</h3>
            <ul className="flex list-none flex-col gap-3 p-0">
              <li>
                <FooterLink href="/privacy">Privacy Policy</FooterLink>
              </li>
              <li>
                <FooterLink href="/terms">Terms of Service</FooterLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-white/85 text-sm font-bold">Contact</h3>
            <p className="text-white/45 text-sm leading-7">
              Questions about privacy, COPPA, or GDPR?
              <br />
              Email{" "}
              <a
                href="mailto:waleedbinkhalid86@gmail.com"
                className="text-white/70 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white"
              >
                waleedbinkhalid86@gmail.com
              </a>
              .
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-7 text-white/35 md:flex-row md:items-center">
          <p className="text-xs">
            © {new Date().getFullYear()} My Green Keys. All rights reserved.
          </p>
          <p className="text-xs">Made for the planet&apos;s future.</p>
        </div>
      </Inner>
    </footer>
  );
}

