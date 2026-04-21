"use client";

import { UserButton, Show, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-black/10 bg-white backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5 font-semibold text-black transition-opacity hover:opacity-70">
              <div className="rounded-xl bg-black p-2">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl tracking-tight">ICA</span>
            </Link>
            <Show when="signed-in">
              <div className="hidden gap-1 md:flex">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="font-medium text-black/70 hover:bg-black/5 hover:text-black">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button variant="ghost" size="sm" className="font-medium text-black/70 hover:bg-black/5 hover:text-black">
                    Courses
                  </Button>
                </Link>
                <Link href="/recommendations">
                  <Button variant="ghost" size="sm" className="font-medium text-black/70 hover:bg-black/5 hover:text-black">
                    Recommendations
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="font-medium text-black/70 hover:bg-black/5 hover:text-black">
                    Profile
                  </Button>
                </Link>
              </div>
            </Show>
          </div>

          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button size="sm" className="bg-black font-medium text-white hover:bg-black/90">
                  Sign In
                </Button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <UserButton afterSignOutUrl="/" />
            </Show>
          </div>
        </div>
      </div>
    </nav>
  );
}
