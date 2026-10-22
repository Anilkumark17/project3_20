"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { Check, GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useUpdateProfile } from "@/hooks/useAuth";
import { GOALS, PROGRAMS, SEMESTERS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function OptionCard({ selected, onClick, title, description }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "relative flex w-full flex-col items-start rounded-xl border bg-card p-4 text-left transition-all hover:border-primary/40",
        selected && "border-primary bg-brand-soft ring-3 ring-primary/15"
      )}
    >
      <span className="font-medium">{title}</span>
      {description && <span className="mt-0.5 text-sm text-muted-foreground">{description}</span>}
      {selected && (
        <span className="absolute top-3 right-3 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3" />
        </span>
      )}
    </button>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const updateProfile = useUpdateProfile();
  const [form, setForm] = useState({ program: "", semester: null, goal: "" });

  const complete = form.program && form.semester && form.goal;

  const submit = async () => {
    try {
      await updateProfile.mutateAsync({ clerkId: user.id, profileData: form });
      await queryClient.invalidateQueries({ queryKey: ["dashboard", user.id] });
      toast.success("You're all set!");
      router.replace("/dashboard");
    } catch (err) {
      toast.error(err.message || "Failed to save your profile");
    }
  };

  return (
    <div className="relative flex flex-1 items-center justify-center px-4 py-12">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div className="relative w-full max-w-2xl rounded-3xl border bg-card p-6 shadow-xl sm:p-10">
        <div className="text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <GraduationCap className="size-6" />
          </span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">Set up your academic profile</h1>
          <p className="mt-2 text-muted-foreground">Three quick choices so the advisor can personalise everything.</p>
        </div>

        <div className="mt-10 space-y-8">
          <fieldset>
            <legend className="mb-3 text-sm font-semibold">1. Your program</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {PROGRAMS.map((p) => (
                <OptionCard key={p.value} title={p.short} description={p.label} selected={form.program === p.value} onClick={() => setForm({ ...form, program: p.value })} />
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-sm font-semibold">2. Current semester</legend>
            <div className="grid grid-cols-4 gap-3">
              {SEMESTERS.map((s) => (
                <OptionCard key={s.value} title={s.value} description={s.value % 2 ? "Monsoon" : "Spring"} selected={form.semester === s.value} onClick={() => setForm({ ...form, semester: s.value })} />
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-sm font-semibold">3. Primary goal</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {GOALS.map((g) => (
                <OptionCard key={g.value} title={g.label} description={g.description} selected={form.goal === g.value} onClick={() => setForm({ ...form, goal: g.value })} />
              ))}
            </div>
          </fieldset>
        </div>

        <Button onClick={submit} disabled={!complete || updateProfile.isPending} size="lg" className="mt-10 h-11 w-full text-base">
          {updateProfile.isPending ? <><Loader2 className="animate-spin" /> Saving…</> : "Continue to dashboard"}
        </Button>
      </div>
    </div>
  );
}
