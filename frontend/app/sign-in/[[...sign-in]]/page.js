import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { GraduationCap } from "lucide-react";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div className="pointer-events-none absolute top-0 left-1/2 h-72 w-[640px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
      <Link href="/" className="relative mb-8 flex items-center gap-2.5 font-semibold">
        <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
          <GraduationCap className="size-5" />
        </span>
        ICA Course Advisor
      </Link>
      <div className="relative mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to continue planning your semester.</p>
      </div>
      <div className="relative">
        <SignIn />
      </div>
    </div>
  );
}
