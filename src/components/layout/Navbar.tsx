"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Menu,
  LogOut,
  User,
  Trophy,
  BookOpen,
  Home,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { QuizoraLogo } from "@/components/layout/QuizoraLogo";

const baseNavLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/quizzes", label: "Quizzes", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  // On "/" it starts hidden at the top so it doesn't collide with the hero's header.
  // On all other pages ("/quizzes", "/leaderboard", etc.), it starts visible.
  const [isVisible, setIsVisible] = useState(pathname !== "/");
  const [prevPath, setPrevPath] = useState(pathname);

  // Keep track of route changes
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setIsVisible(pathname !== "/");
  }

  // Disappearing navbar logic on scroll
  useEffect(() => {
    let prevScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const delta = currentScrollY - prevScrollY;

          // If mobile menu is open, keep navbar visible
          if (mobileOpen) {
            setIsVisible(true);
            prevScrollY = currentScrollY;
            ticking = false;
            return;
          }

          if (pathname === "/") {
            // Home page: hide at top (0-100px) so hero header is clean.
            // When user scrolls down past 100px, it appears when scrolling up!
            if (currentScrollY < 100) {
              setIsVisible(false);
            } else if (delta > 8) {
              // Scrolling down
              setIsVisible(false);
            } else if (delta < -8) {
              // Scrolling up
              setIsVisible(true);
            }
          } else {
            // All other pages (/quizzes, /leaderboard, etc.)
            if (currentScrollY <= 15) {
              // Near the very top, always show
              setIsVisible(true);
            } else if (delta > 6 && currentScrollY > 60) {
              // Scrolling down: disappear
              setIsVisible(false);
            } else if (delta < -6) {
              // Scrolling up: reappear
              setIsVisible(true);
            }
          }

          prevScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, mobileOpen]);

  // Show profile navigation link ONLY when user is logged in
  const visibleNavLinks = isAuthenticated
    ? [...baseNavLinks, { href: "/profile", label: "Profile", icon: UserCheck }]
    : baseNavLinks;

  const isHome = pathname === "/";
  const positionClass = isHome ? "fixed top-0 left-0 right-0" : "sticky top-0";

  return (
    <header
      className={`${positionClass} z-50 w-full border-b-[2.5px] border-[#0F3D2E] bg-[#FFFDF5] shadow-[0_4px_12px_rgba(15,61,46,0.06)] transition-transform duration-300 ease-in-out ${
        isVisible || mobileOpen ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto flex h-16 sm:h-18 items-center justify-between px-4 sm:px-6">
        {/* Official Brand Logo */}
        <Link href="/" className="flex items-center transition-transform hover:scale-[1.02]">
          <QuizoraLogo className="h-10 sm:h-11 w-auto" />
        </Link>

        {/* Center / Navigation Links for Subpages */}
        <nav className="hidden md:flex items-center gap-6">
          {visibleNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-bold text-[#0F3D2E] transition-all hover:bg-[linear-gradient(transparent_58%,#FFE94A_58%)] ${
                pathname === link.href ? "bg-[linear-gradient(transparent_58%,#FFE94A_58%)]" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0F3D2E] bg-[#FFE94A] text-[#0F3D2E] shadow-[2px_2px_0_#0F3D2E] focus:outline-none"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#FFE94A] text-[#0F3D2E] font-black">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#FFFDF5] border-[2.5px] border-[#0F3D2E] rounded-[12px] shadow-[5px_5px_0_#0F3D2E] text-[#0F3D2E]">
                <div className="flex items-center gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold text-[#0F3D2E]">{user.name}</p>
                    <p className="text-xs text-[#0F3D2E]/70 truncate font-mono">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-[#0F3D2E]/20" />
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer flex items-center font-bold hover:bg-[#FFE94A] focus:bg-[#FFE94A] rounded-lg">
                    <User className="mr-2 h-4 w-4" />
                    My Profile &amp; History
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-[#0F3D2E]/20" />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-[#E5484D] focus:text-[#E5484D] font-bold hover:bg-[#E5484D]/10 rounded-lg"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-bold text-[#0F3D2E] px-3 py-1.5 transition-all hover:bg-[linear-gradient(transparent_58%,#FFE94A_58%)]"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-sm font-bold bg-[#0F3D2E] text-[#FFFDF5] border-2 border-[#0F3D2E] px-4 py-2 rounded-[10px] shadow-[3px_3px_0_#0F3D2E] transition-all hover:bg-[#FFE94A] hover:text-[#0F3D2E]"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Navigation Sheet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#0F3D2E] bg-[#FFFDF5] text-[#0F3D2E] shadow-[2px_2px_0_#0F3D2E] md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-[#FFFDF5] border-l-[3px] border-[#0F3D2E] text-[#0F3D2E]">
            <SheetTitle className="flex items-center gap-2">
              <QuizoraLogo className="h-9 w-auto" />
            </SheetTitle>
            <nav className="mt-6 flex flex-col gap-2">
              {visibleNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg border-2 border-transparent px-3 py-2.5 text-sm font-bold text-[#0F3D2E] hover:border-[#0F3D2E] hover:bg-[#FFE94A] transition-all"
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 flex flex-col gap-2 border-t-2 border-dashed border-[#0F3D2E]/20 pt-6">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 bg-[#E3F9EE] border-2 border-[#0F3D2E] rounded-[10px]">
                    <Avatar className="h-9 w-9 border border-[#0F3D2E]">
                      <AvatarFallback className="bg-[#FFE94A] text-[#0F3D2E] font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="truncate">
                      <p className="text-sm font-bold text-[#0F3D2E]">{user.name}</p>
                      <p className="text-xs text-[#0F3D2E]/70 truncate font-mono">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Link href="/profile" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-2 border-2 border-[#0F3D2E] font-bold bg-[#FFFDF5]">
                      <User className="h-4 w-4" />
                      View Profile &amp; History
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="justify-start text-[#E5484D] hover:bg-[#E5484D]/10 font-bold w-full"
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full border-2 border-[#0F3D2E] bg-[#FFFDF5] font-bold shadow-[2px_2px_0_#0F3D2E]">
                      <User className="mr-2 h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-[#0F3D2E] hover:bg-[#FFE94A] hover:text-[#0F3D2E] text-[#FFFDF5] border-2 border-[#0F3D2E] font-bold shadow-[3px_3px_0_#0F3D2E]">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
