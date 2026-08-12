"use client";

import { useAuth } from "@/context/AuthContext";
import { TreePine, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const PHOTOS = [
  {
    src: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=600&q=80",
    alt: "Three generations of a family laughing together",
    caption: "The whole crew, 2019",
    className: "top-0 left-4 w-44 sm:w-56 -rotate-6 z-30",
  },
  {
    src: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=600&q=80",
    alt: "Grandparents sitting together on a porch",
    caption: "Nan & Pop, 1971",
    className: "top-10 right-0 w-40 sm:w-48 rotate-3 z-20",
  },
  {
    src: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80",
    alt: "Parents holding a young child outdoors",
    caption: "First birthday",
    className: "bottom-16 left-0 w-36 sm:w-44 rotate-2 z-20",
  },
  {
    src: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=600&q=80",
    alt: "Children playing together in a garden",
    caption: "Summer, every year",
    className: "bottom-0 right-6 w-44 sm:w-52 -rotate-3 z-30",
  },
];

const STEPS = [
  {
    ring: "I",
    title: "Plant the tree",
    description:
      "Add yourself, then the people you already know — parents, siblings, kids. Memory works out how everyone connects.",
  },
  {
    ring: "II",
    title: "Invite the branches",
    description:
      "Send a relative an invite. Once they confirm, their side of the family fills in on its own.",
  },
  {
    ring: "III",
    title: "Keep it alive",
    description:
      "Write down the stories before they're gone — a photo, a memory, a name someone almost forgot.",
  },
];

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/feed");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-[#EFEAD9] text-[#2A2A22]">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap");
        .font-display {
          font-family: "Fraunces", serif;
          font-optical-sizing: auto;
        }
        .font-body {
          font-family: "Inter", sans-serif;
        }
        .polaroid {
          background: #fffdf7;
          padding: 10px 10px 34px 10px;
          border-radius: 3px;
          box-shadow: 0 12px 24px -8px rgba(31, 61, 43, 0.35);
        }
        .polaroid::after {
          content: attr(data-caption);
          position: absolute;
          bottom: 8px;
          left: 0;
          right: 0;
          text-align: center;
          font-family: "Fraunces", serif;
          font-style: italic;
          font-size: 12px;
          color: #6b6353;
        }
        @media (prefers-reduced-motion: no-preference) {
          .polaroid {
            transition: transform 0.35s ease, box-shadow 0.35s ease;
          }
          .polaroid:hover {
            transform: translateY(-6px) rotate(0deg) !important;
            box-shadow: 0 20px 30px -10px rgba(31, 61, 43, 0.4);
          }
        }
      `}</style>

      {/* Nav */}
      <header className="sticky top-0 z-40 bg-[#EFEAD9]/95 backdrop-blur border-b border-[#1F3D2B]/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TreePine className="w-6 h-6 text-[#1F3D2B]" />
            <span className="font-display font-semibold text-lg tracking-tight">
              Memory
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 font-body">
            <Link
              href="/login"
              className="text-sm font-medium text-[#2A2A22] hover:text-[#1F3D2B] px-3 py-2 transition"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-[#1F3D2B] text-[#EFEAD9] px-4 py-2 rounded-full hover:bg-[#16301F] transition"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-24 sm:pb-32 grid lg:grid-cols-2 gap-14 lg:gap-10 items-center">
          {/* Copy */}
          <div className="max-w-lg font-body">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-[#C08A3E] mb-5">
              A living family ledger
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.08] font-semibold text-[#1F3D2B] mb-6">
              Every family has a story{" "}
              <span className="italic font-medium">worth keeping</span>.
            </h1>
            <p className="text-lg text-[#4B4A3E] leading-relaxed mb-9">
              Memory is where your family tree lives — names, faces, and the
              stories behind them, gathered in one place so nobody has to be
              remembered twice.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 bg-[#1F3D2B] text-[#EFEAD9] font-semibold px-6 py-3.5 rounded-full hover:bg-[#16301F] transition"
              >
                Create your family tree
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 border border-[#1F3D2B]/25 text-[#1F3D2B] font-semibold px-6 py-3.5 rounded-full hover:bg-[#1F3D2B]/5 transition"
              >
                Log in
              </Link>
            </div>
            <p className="text-sm text-[#6B6353] mt-8">
              Already trusted by 2,000+ families keeping their history alive.
            </p>
          </div>

          {/* Photo collage */}
          <div className="relative h-[420px] sm:h-[480px] w-full max-w-md mx-auto lg:mx-0 lg:justify-self-end">
            {/* root / branch line motif, behind photos */}
            <svg
              className="absolute inset-0 w-full h-full -z-10 opacity-70"
              viewBox="0 0 400 480"
              fill="none"
            >
              <path
                d="M40 460 C 40 340, 140 320, 140 220 C 140 140, 90 120, 90 40"
                stroke="#C08A3E"
                strokeWidth="1.5"
                strokeDasharray="1 8"
                strokeLinecap="round"
              />
              <path
                d="M40 460 C 40 380, 260 360, 260 260 C 260 160, 330 140, 330 50"
                stroke="#C08A3E"
                strokeWidth="1.5"
                strokeDasharray="1 8"
                strokeLinecap="round"
              />
            </svg>

            {PHOTOS.map((photo) => (
              <div
                key={photo.caption}
                data-caption={photo.caption}
                className={`polaroid absolute ${photo.className}`}
              >
                <div className="relative w-full aspect-[4/5] overflow-hidden rounded-sm">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="240px"
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* torn-edge divider into next section */}
        <svg
          className="block w-full text-[#FFFDF7]"
          viewBox="0 0 1200 40"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 20 Q 50 0 100 20 T 200 20 T 300 20 T 400 20 T 500 20 T 600 20 T 700 20 T 800 20 T 900 20 T 1000 20 T 1100 20 T 1200 20 V40 H0 Z"
            fill="currentColor"
          />
        </svg>
      </section>

      {/* How it grows */}
      <section className="bg-[#FFFDF7] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 font-body">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1F3D2B] text-center mb-14">
            How a tree grows on Memory
          </h2>
          <div className="grid sm:grid-cols-3 gap-10">
            {STEPS.map((step) => (
              <div key={step.ring} className="text-center sm:text-left">
                <span className="font-display italic text-3xl text-[#C08A3E] block mb-3">
                  {step.ring}
                </span>
                <h3 className="font-semibold text-[#1F3D2B] mb-2">
                  {step.title}
                </h3>
                <p className="text-[#4B4A3E] text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pull quote */}
      <section className="bg-[#1F3D2B] py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-display italic text-2xl sm:text-3xl text-[#EFEAD9] leading-relaxed">
            &ldquo;A family story told once is a memory. Told again, it
            becomes a heritage.&rdquo;
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#EFEAD9] py-20 sm:py-28 px-4 sm:px-6 lg:px-8 text-center font-body">
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1F3D2B] mb-5">
          Start your family&apos;s page
        </h2>
        <p className="text-[#4B4A3E] mb-8 max-w-md mx-auto">
          It takes two minutes to plant the first root.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="bg-[#1F3D2B] text-[#EFEAD9] font-semibold px-7 py-3.5 rounded-full hover:bg-[#16301F] transition"
          >
            Sign up
          </Link>
          <Link
            href="/login"
            className="border border-[#1F3D2B]/25 text-[#1F3D2B] font-semibold px-7 py-3.5 rounded-full hover:bg-[#1F3D2B]/5 transition"
          >
            Log in
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1F3D2B]/10 py-10 px-4 sm:px-6 lg:px-8 font-body">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TreePine className="w-5 h-5 text-[#1F3D2B]" />
            <span className="font-display font-semibold">Memory</span>
          </div>
          <p className="text-sm text-[#6B6353]">
            &copy; {new Date().getFullYear()} Memory. Keeping families
            connected across generations.
          </p>
        </div>
      </footer>
    </div>
  );
}