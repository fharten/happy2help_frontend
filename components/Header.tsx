"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LogoRight = "/images/h2h_logo_mint.png";

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="bg-white pt-8 pb-4">
      <nav aria-label="Main navigation" className="px-8">
        <div className="flex justify-between items-center">
          {/* LOGO TEXT */}
          <div className="flex items-center gap-6">
            <span className="text-4xl font-extrabold text-black select-none tracking-tight drop-shadow-sm">
              Happy<span className="text-mint">2Help</span>
            </span>
          </div>

          {/* NAVIGATION PILL - dünn, viel Spacing, aktiver Link */}
          <div className="flex items-center bg-light-mint/80 rounded-full px-16 py-2 shadow-md">
            <Link
              href={"/"}
              className={`px-8 py-1 text-base hover:bg-white/40 transition-colors ${
                pathname === "/"
                  ? "text-prussian font-bold"
                  : "text-prussian/60 font-normal"
              }`}
            >
              Homepage
            </Link>
            <Link
              href={"/dashboard"}
              className={`px-8 py-1 text-base hover:bg-white/40 transition-colors ${
                pathname === "/dashboard"
                  ? "text-prussian font-bold"
                  : "text-prussian/60 font-normal"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href={"/projects"}
              className={`px-8 py-1 text-base hover:bg-white/40 transition-colors ${
                pathname === "/projects"
                  ? "text-prussian font-bold"
                  : "text-prussian/60 font-normal"
              }`}
            >
              Edit Project
            </Link>
            <Link
              href={"/projects"}
              className={`px-8 py-1 text-base hover:bg-white/40 transition-colors ${
                pathname === "/projects"
                  ? "text-prussian font-bold"
                  : "text-prussian/60 font-normal"
              }`}
            >
              Projects
            </Link>
          </div>

          {/* NOTIFICATION ICON & LOGO */}
          <div className="flex items-center gap-4">
            <button className="p-3 rounded-full hover:bg-seasalt transition-colors">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                className="text-prussian"
              >
                <path
                  d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.73 21a2 2 0 0 1-3.46 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* LOGO RECHTS */}
            <Link href={"/"}>
              <Image
                src={LogoRight}
                height={40}
                width={40}
                className="h-10 w-10 rounded-full object-cover"
                alt="happy2help logo"
              />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
