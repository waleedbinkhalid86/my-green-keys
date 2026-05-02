"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 py-12"
      style={{
        background: "#FAFAFA",
        color: "#1A2F23",
        textAlign: "center",
      }}
    >
      <div className="relative mx-auto mb-8 w-[300px] shrink-0">
        <Image
          src="/images/ui/ui-404.jpg"
          alt="Friendly panda lost in the forest"
          width={300}
          height={300}
          className="h-auto w-full rounded-[20px] object-contain shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
          priority
        />
      </div>
      <h1 className="font-heading text-3xl font-black tracking-tight sm:text-4xl">Oops! Page not found</h1>
      <p className="mt-3 max-w-md text-base font-semibold text-[#64748b] sm:text-lg">
        Looks like our panda got lost in the forest!
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex h-[52px] min-w-[160px] items-center justify-center rounded-[50px] bg-[#2ECC71] px-8 text-base font-extrabold text-white shadow-[0_4px_24px_rgba(46,204,113,0.35)] transition-transform duration-200 ease-in-out hover:-translate-y-0.5 active:scale-[0.97]"
        >
          Go Home
        </Link>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-base font-extrabold text-[#2ECC71] underline-offset-4 transition-opacity hover:underline"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
