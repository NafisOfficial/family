import { TreePine } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description?: string;
  quote: string;
  primaryImageSrc: string;
  primaryImageAlt: string;
  secondaryImageSrc: string;
  secondaryImageAlt: string;
  secondaryCaption: string;
  tertiaryImageSrc: string;
  tertiaryImageAlt: string;
  tertiaryCaption: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({
  eyebrow,
  title,
  description,
  quote,
  primaryImageSrc,
  primaryImageAlt,
  secondaryImageSrc,
  secondaryImageAlt,
  secondaryCaption,
  tertiaryImageSrc,
  tertiaryImageAlt,
  tertiaryCaption,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#EFEAD9] text-[#2A2A22]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[#1F3D2B] lg:block">
          <div className="absolute inset-0 opacity-25">
            <Image
              src={primaryImageSrc}
              alt={primaryImageAlt}
              fill
              className="object-cover"
              priority
            />
          </div>

          <svg
            className="absolute inset-0 h-full w-full opacity-40"
            viewBox="0 0 500 700"
            fill="none"
          >
            <path
              d="M60 660 C 60 500, 180 480, 180 340 C 180 220, 120 200, 120 60"
              stroke="#C08A3E"
              strokeWidth="1.5"
              strokeDasharray="1 8"
              strokeLinecap="round"
            />
            <path
              d="M60 660 C 60 560, 340 540, 340 400 C 340 260, 420 240, 420 80"
              stroke="#C08A3E"
              strokeWidth="1.5"
              strokeDasharray="1 8"
              strokeLinecap="round"
            />
          </svg>

          <div className="polaroid absolute left-16 top-16 w-48 -rotate-6">
            <div className="relative aspect-4/5 w-full overflow-hidden rounded-sm">
              <Image
                src={secondaryImageSrc}
                alt={secondaryImageAlt}
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
            <div className="mt-2 text-center text-[11px] font-medium italic text-[#6B6353]">
              {secondaryCaption}
            </div>
          </div>

          <div className="polaroid absolute bottom-20 right-14 w-44 rotate-3">
            <div className="relative aspect-4/5 w-full overflow-hidden rounded-sm">
              <Image
                src={tertiaryImageSrc}
                alt={tertiaryImageAlt}
                fill
                sizes="180px"
                className="object-cover"
              />
            </div>
            <div className="mt-2 text-center text-[11px] font-medium italic text-[#6B6353]">
              {tertiaryCaption}
            </div>
          </div>

          <div className="relative z-10 flex h-full flex-col justify-between p-12">
            <Link href="/" className="flex items-center gap-2">
              <TreePine className="h-6 w-6 text-[#EFEAD9]" />
              <span className="font-display text-lg font-semibold text-[#EFEAD9]">
                Memory
              </span>
            </Link>

            <p className="font-display max-w-sm text-2xl leading-snug text-[#EFEAD9] italic">
              “{quote}”
            </p>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-md">
            <div className="mb-4 flex items-center gap-2 lg:hidden">
              <TreePine className="h-6 w-6 text-[#1F3D2B]" />
              <span className="font-display text-lg font-semibold text-[#1F3D2B]">
                Memory
              </span>
            </div>

            <div className="rounded-[1.5rem] border border-[#1F3D2B]/10 bg-[#FFFDF7] p-6 shadow-[0_20px_60px_-40px_rgba(31,61,43,0.45)] sm:p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C08A3E]">
                  {eyebrow}
                </p>
                <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-[#1F3D2B] sm:text-3xl">
                  {title}
                </h2>
                {description ? (
                  <p className="mt-2 text-sm leading-6 text-[#6B6353]">
                    {description}
                  </p>
                ) : null}
              </div>

              {children}

              {footer ? <div className="mt-6">{footer}</div> : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
