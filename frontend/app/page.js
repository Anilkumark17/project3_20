import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, BookOpenCheck, FileSearch, MessageSquareText, Quote, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: MessageSquareText,
    title: "AI advisor that cites its sources",
    body: "Ask anything about courses, instructors, grading or workload. Every answer links back to the exact syllabus section it came from.",
  },
  {
    icon: Sparkles,
    title: "Recommendations that know you",
    body: "Your program, goal and completed courses drive a retrieval-ranked shortlist, explained course by course.",
  },
  {
    icon: TrendingUp,
    title: "Progress at a glance",
    body: "Track credits toward graduation, log grades, and keep your semester workload balanced.",
  },
];

const STEPS = [
  { n: "01", title: "Tell us your goal", body: "Program, semester and whether you are aiming for placement, research or skills." },
  { n: "02", title: "Log what you have taken", body: "Add completed courses with grades. Credits update automatically." },
  { n: "03", title: "Plan with the advisor", body: "Compare electives, check prerequisites and grading, then build your next semester." },
];

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

      <section className="relative mx-auto max-w-6xl px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border bg-card/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-xs backdrop-blur">
          <span className="size-1.5 rounded-full bg-success" />
          Grounded in the official Monsoon &amp; Spring syllabi
        </div>
        <h1 className="mx-auto max-w-4xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
          Plan your MTech with an <span className="text-gradient">advisor that reads every syllabus</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-muted-foreground">
          ICA combines retrieval over 900+ syllabus passages with a fast LLM to answer course questions accurately,
          recommend electives for your goals, and keep your degree on track.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-11 px-6 text-base shadow-lg shadow-primary/25">
            <Link href="/sign-up">
              Get started free <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-11 px-6 text-base">
            <Link href="/sign-in">I already have an account</Link>
          </Button>
        </div>

        {/* Product preview */}
        <div className="relative mx-auto mt-16 max-w-3xl rounded-2xl border bg-card/80 p-2 text-left shadow-2xl shadow-primary/10 backdrop-blur">
          <div className="rounded-xl border bg-background p-5 sm:p-6">
            <div className="flex justify-end">
              <div className="rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                Who teaches Compilers and how is it graded?
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </div>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>
                  <strong>Compilers (CS1.403)</strong> is taught by Venkatesh Choppella in Spring
                  <span className="mx-1 rounded bg-primary/12 px-1 font-mono text-[0.7rem] font-semibold text-primary">1</span>.
                  Grading is project-heavy: Semester Project 40%, End Sem 30%, Assignments 15%, Quizzes 15%
                  <span className="mx-1 rounded bg-primary/12 px-1 font-mono text-[0.7rem] font-semibold text-primary">2</span>.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["CS1.403 · Overview", "CS1.403 · Assessment"].map((s, i) => (
                    <span key={s} className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1 text-xs text-muted-foreground">
                      <FileSearch className="size-3.5 text-primary" /> [{i + 1}] {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border bg-card p-6 shadow-xs transition-shadow hover:shadow-md">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">From sign-up to a semester plan in minutes</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="relative rounded-2xl border bg-card/60 p-6">
              <span className="font-mono text-sm font-semibold text-primary">{s.n}</span>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 pt-8 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
          <div className="bg-grid absolute inset-0 opacity-20" />
          <Quote className="mx-auto size-8 opacity-60" />
          <h2 className="relative mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-balance">
            Stop scrolling PDFs. Ask, compare and decide with confidence.
          </h2>
          <Button asChild size="lg" variant="secondary" className="relative mt-8 h-11 px-6 text-base">
            <Link href="/sign-up">
              <BookOpenCheck /> Create your plan
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
