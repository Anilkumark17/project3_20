"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { GraduationCap, LayoutDashboard, BookOpen, Sparkles, MessageSquareText, UserRound, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/advisor", label: "AI Advisor", icon: MessageSquareText },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/recommendations", label: "Recommendations", icon: Sparkles },
  { href: "/profile", label: "Profile", icon: UserRound },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight transition-opacity hover:opacity-80">
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/30">
        <GraduationCap className="size-4.5" />
      </span>
      <span className="text-[1.05rem]">
        ICA<span className="ml-1.5 hidden font-normal text-muted-foreground sm:inline">Course Advisor</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) return null;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <Show when="signed-in">
            <nav className="hidden items-center gap-1 md:flex">
              {NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                    isActive(href) && "text-foreground after:absolute after:inset-x-3 after:-bottom-[13px] after:h-0.5 after:rounded-full after:bg-primary"
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </Show>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost" size="lg">Sign in</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="lg" className="hidden sm:inline-flex">Get started</Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton appearance={{ elements: { avatarBox: "size-8" } }} />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon-lg" className="md:hidden" aria-label="Open menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="border-b p-4">
                  <SheetTitle asChild>
                    <div><Logo /></div>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 p-3">
                  {NAV.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                        isActive(href) && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                      {label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </Show>
        </div>
      </div>
    </header>
  );
}
