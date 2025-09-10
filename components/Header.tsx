"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, LayoutDashboard, Pencil, Scroll, Bell } from "lucide-react";

const LogoRight = "/images/h2h_logo_mint.png";

const Header = () => {
  const pathname = usePathname();

  return (
    <>
      {/* DESKTOP & MOBILE TOP BAR */}
      <header className="bg-white pt-4 pb-3 lg:pt-6 lg:pb-4">
        <nav aria-label="Main navigation" className="px-4 lg:px-8">
          <div className="flex justify-between items-center">
            {/* LOGO TEXT */}
            <div className="flex items-center gap-3 lg:gap-6">
              <span className="text-xl lg:text-3xl font-bold text-black select-none tracking-tight">
                Happy<span className="text-mint">2Help</span>
              </span>
            </div>

            {/* DESKTOP NAVIGATION PILL */}
            <div className="hidden xl:flex items-center bg-light-mint/90 backdrop-blur-xl rounded-full px-2 py-2 shadow-xl gap-6">
              <Link
                href={"/"}
                className={`flex items-center gap-3 px-6 py-2 text-base font-medium rounded-full transition-all duration-200 ${
                  pathname === "/"
                    ? "bg-white/60 text-prussian font-semibold shadow-lg"
                    : "text-prussian/70 hover:text-prussian hover:bg-white/30"
                }`}
              >
                <House size={18} strokeWidth={2.5} />
                Homepage
              </Link>
              <Link
                href={"/dashboard"}
                className={`flex items-center gap-3 px-6 py-2 text-base font-medium rounded-full transition-all duration-200 ${
                  pathname === "/dashboard"
                    ? "bg-white/60 text-prussian font-semibold shadow-lg"
                    : "text-prussian/70 hover:text-prussian hover:bg-white/30"
                }`}
              >
                <LayoutDashboard size={18} strokeWidth={2.5} />
                Dashboard
              </Link>
              <Link
                href={"/projects/edit"}
                className={`flex items-center gap-3 px-6 py-2 text-base font-medium rounded-full transition-all duration-200 ${
                  pathname.startsWith("/projects/edit")
                    ? "bg-white/60 text-prussian font-semibold shadow-lg"
                    : "text-prussian/70 hover:text-prussian hover:bg-white/30"
                }`}
              >
                <Pencil size={18} strokeWidth={2.5} />
                Edit Project
              </Link>
              <Link
                href={"/projects"}
                className={`flex items-center gap-3 px-6 py-2 text-base font-medium rounded-full transition-all duration-200 ${
                  pathname === "/projects"
                    ? "bg-white/60 text-prussian font-semibold shadow-lg"
                    : "text-prussian/70 hover:text-prussian hover:bg-white/30"
                }`}
              >
                <Scroll size={18} strokeWidth={2.5} />
                Projects
              </Link>
            </div>

            {/* NOTIFICATION ICON & LOGO */}
            <div className="flex items-center gap-2 lg:gap-3">
              <button className="p-2 lg:p-2.5 rounded-full hover:bg-gray-100/60 transition-all duration-200">
                <Bell size={20} strokeWidth={2} className="text-prussian/70" />
              </button>

              {/* LOGO RECHTS */}
              <Link
                href={"/"}
                className="rounded-lg hover:bg-gray-100/60 transition-all duration-200 p-1"
              >
                <Image
                  src={LogoRight}
                  height={32}
                  width={32}
                  className="h-7 w-7 lg:h-8 lg:w-8 rounded-md object-cover"
                  alt="happy2help logo"
                />
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="xl:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center bg-light-mint/90 backdrop-blur-xl rounded-full px-2 py-2 shadow-xl gap-3">
          <Link
            href={"/"}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              pathname === "/"
                ? "bg-white/60 text-prussian shadow-lg"
                : "text-prussian/70 hover:text-prussian hover:bg-white/30"
            }`}
          >
            <House size={18} strokeWidth={2.5} />
          </Link>
          <Link
            href={"/dashboard"}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              pathname === "/dashboard"
                ? "bg-white/60 text-prussian shadow-lg"
                : "text-prussian/70 hover:text-prussian hover:bg-white/30"
            }`}
          >
            <LayoutDashboard size={18} strokeWidth={2.5} />
          </Link>
          <Link
            href={"/projects/edit"}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              pathname.startsWith("/projects/edit")
                ? "bg-white/60 text-prussian shadow-lg"
                : "text-prussian/70 hover:text-prussian hover:bg-white/30"
            }`}
          >
            <Pencil size={18} strokeWidth={2.5} />
          </Link>
          <Link
            href={"/projects"}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              pathname === "/projects"
                ? "bg-white/60 text-prussian shadow-lg"
                : "text-prussian/70 hover:text-prussian hover:bg-white/30"
            }`}
          >
            <Scroll size={18} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </>
  );
};

export default Header;
