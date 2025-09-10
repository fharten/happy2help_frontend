"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, LayoutDashboard, Pencil, Scroll } from "lucide-react";

const LogoRight = "/images/h2h_logo_mint.png";

const Header = () => {
  const pathname = usePathname();

  return (
    <>
      {/* DESKTOP & MOBILE TOP BAR */}
      <header className="bg-white pt-8 pb-4 lg:pb-4">
        <nav aria-label="Main navigation" className="px-8">
          <div className="flex justify-between items-center">
            {/* LOGO TEXT */}
            <div className="flex items-center gap-6">
              <span className="text-4xl font-extrabold text-black select-none tracking-tight drop-shadow-sm">
                Happy<span className="text-mint">2Help</span>
              </span>
            </div>

            {/* DESKTOP NAVIGATION PILL - versteckt auf mobil */}
            <div className="hidden lg:flex items-center bg-light-mint/80 rounded-full px-16 py-2 shadow-md">
              <Link
                href={"/"}
                className={`flex items-center gap-2 px-8 py-1 text-base hover:bg-white/40 transition-colors ${
                  pathname === "/"
                    ? "text-prussian font-bold"
                    : "text-prussian/60 font-normal"
                }`}
              >
                <House size={18} />
                Homepage
              </Link>
              <Link
                href={"/dashboard"}
                className={`flex items-center gap-2 px-8 py-1 text-base hover:bg-white/40 transition-colors ${
                  pathname === "/dashboard"
                    ? "text-prussian font-bold"
                    : "text-prussian/60 font-normal"
                }`}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <Link
                href={"/projects/edit"}
                className={`flex items-center gap-2 px-8 py-1 text-base hover:bg-white/40 transition-colors ${
                  pathname.startsWith("/projects/edit")
                    ? "text-prussian font-bold"
                    : "text-prussian/60 font-normal"
                }`}
              >
                <Pencil size={18} />
                Edit Project
              </Link>
              <Link
                href={"/projects"}
                className={`flex items-center gap-2 px-8 py-1 text-base hover:bg-white/40 transition-colors ${
                  pathname === "/projects"
                    ? "text-prussian font-bold"
                    : "text-prussian/60 font-normal"
                }`}
              >
                <Scroll size={18} />
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

      {/* MOBILE BOTTOM NAVIGATION - nur auf mobil sichtbar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-center px-4 py-2">
          <div className="flex items-center bg-light-mint/80 rounded-full px-6 py-3 shadow-lg">
            <Link
              href={"/"}
              className={`flex flex-col items-center gap-1 px-4 py-2 text-xs hover:bg-white/40 transition-colors rounded-full ${
                pathname === "/"
                  ? "text-prussian font-bold"
                  : "text-prussian/60 font-normal"
              }`}
            >
              <House size={20} />
              Home
            </Link>
            <Link
              href={"/dashboard"}
              className={`flex flex-col items-center gap-1 px-4 py-2 text-xs hover:bg-white/40 transition-colors rounded-full ${
                pathname === "/dashboard"
                  ? "text-prussian font-bold"
                  : "text-prussian/60 font-normal"
              }`}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </Link>
            <Link
              href={"/projects/edit"}
              className={`flex flex-col items-center gap-1 px-4 py-2 text-xs hover:bg-white/40 transition-colors rounded-full ${
                pathname.startsWith("/projects/edit")
                  ? "text-prussian font-bold"
                  : "text-prussian/60 font-normal"
              }`}
            >
              <Pencil size={20} />
              Edit
            </Link>
            <Link
              href={"/projects"}
              className={`flex flex-col items-center gap-1 px-4 py-2 text-xs hover:bg-white/40 transition-colors rounded-full ${
                pathname === "/projects"
                  ? "text-prussian font-bold"
                  : "text-prussian/60 font-normal"
              }`}
            >
              <Scroll size={20} />
              Projects
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
