"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { BookMarked, History, Scale, ShieldCheck, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import Composer from "@/components/advisor/Composer";
import ConversationList from "@/components/advisor/ConversationList";
import { AssistantMessage, UserMessage } from "@/components/advisor/ChatMessage";
import { useAdvisorChat } from "@/hooks/useAdvisorChat";
import { useProfile } from "@/hooks/useAuth";

function suggestionsFor(profile) {
  const program = profile?.program || "MTech";
  const goal = profile?.goal || "Skills";
  return [
    { icon: Target, text: `Which ${program} electives best fit a ${goal.toLowerCase()} goal?` },
    { icon: Scale, text: "Compare Distributed Systems and Advanced Computer Networks: workload and grading" },
    { icon: ShieldCheck, text: "What security courses are offered in Spring and who teaches them?" },
    { icon: BookMarked, text: "What are the learning outcomes of Compilers?" },
  ];
}

function EmptyState({ name, profile, onPick }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <Sparkles className="size-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Hi{name ? ` ${name}` : ""}, what would you like to plan?
        </h1>
        <p className="mt-2 text-muted-foreground">
          Answers come from the official Monsoon &amp; Spring syllabi, with every claim cited.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {suggestionsFor(profile).map(({ icon: Icon, text }) => (
          <button
            key={text}
            onClick={() => onPick(text)}
            className="group flex items-start gap-3 rounded-xl border bg-card p-4 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="size-4" />
            </span>
            <span className="leading-snug">{text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatPane({ conversationId, initialQuestion, onConversationCreated, composerRef }) {
  const { user } = useUser();
  const { data: profileData } = useProfile(user?.id);
  const bottomRef = useRef(null);
  const sentInitial = useRef(false);
  const { messages, send, stop, isStreaming, isLoadingConversation } = useAdvisorChat({ conversationId, onConversationCreated });

  // Deep link from the dashboard: /advisor?q=...
  useEffect(() => {
    if (initialQuestion && !sentInitial.current) {
      sentInitial.current = true;
      send(initialQuestion);
    }
  }, [initialQuestion, send]);

  const lastContent = messages.at(-1)?.content;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: isStreaming ? "auto" : "smooth", block: "end" });
  }, [messages.length, lastContent, isStreaming]);

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 sm:px-6">
          {isLoadingConversation ? (
            <div className="space-y-6 py-10">
              <Skeleton className="ml-auto h-10 w-2/3 rounded-2xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
            </div>
          ) : messages.length === 0 ? (
            <EmptyState name={user?.firstName} profile={profileData?.profile} onPick={send} />
          ) : (
            <div className="space-y-8 py-8">
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <UserMessage key={m.id} message={m} />
                ) : (
                  <AssistantMessage key={m.id} message={m} isLast={i === messages.length - 1} isStreaming={isStreaming} />
                )
              )}
            </div>
          )}
          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      <div className="bg-gradient-to-t from-background via-background to-transparent px-4 pt-2 pb-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Composer
            ref={composerRef}
            onSend={send}
            onStop={stop}
            isStreaming={isStreaming}
            placeholder="Ask about courses, prerequisites, grading, instructors…"
          />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            ICA can make mistakes. Check the cited syllabus sections before registering.
          </p>
        </div>
      </div>
    </>
  );
}

function AdvisorChat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("c");
  const initialQuestion = searchParams.get("q");
  const composerRef = useRef(null);
  // Bumped on user navigation so the chat pane remounts (aborting any in-flight stream);
  // the URL update after a new conversation is created does not remount it.
  const [session, setSession] = useState(0);

  const onConversationCreated = useCallback((id) => router.replace(`/advisor?c=${id}`, { scroll: false }), [router]);

  const selectConversation = (id) => {
    if (id === conversationId) return;
    setSession((s) => s + 1);
    router.push(`/advisor?c=${id}`);
  };
  const newConversation = () => {
    setSession((s) => s + 1);
    router.push("/advisor");
    setTimeout(() => composerRef.current?.focus(), 50);
  };

  const sidebar = <ConversationList activeId={conversationId} onSelect={selectConversation} onNew={newConversation} />;

  return (
    <div className="flex h-[calc(100dvh-4rem)] overflow-hidden">
      <aside className="hidden w-72 shrink-0 border-r bg-sidebar lg:block">{sidebar}</aside>

      <section className="relative flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b px-4 py-2 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="lg" className="gap-2">
                <History /> History
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="border-b">
                <SheetTitle>Conversations</SheetTitle>
              </SheetHeader>
              {sidebar}
            </SheetContent>
          </Sheet>
          <Button variant="ghost" size="lg" onClick={newConversation}>New chat</Button>
        </div>

        <ChatPane
          key={session}
          conversationId={conversationId}
          initialQuestion={initialQuestion}
          onConversationCreated={onConversationCreated}
          composerRef={composerRef}
        />
      </section>
    </div>
  );
}

export default function AdvisorPage() {
  return (
    <Suspense fallback={null}>
      <AdvisorChat />
    </Suspense>
  );
}
