"use client";

import { formatDistanceToNowStrict } from "date-fns";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConversations, useDeleteConversation } from "@/hooks/useConversations";
import { cn } from "@/lib/utils";

export default function ConversationList({ activeId, onSelect, onNew }) {
  const { data: conversations = [], isLoading } = useConversations();
  const deleteMutation = useDeleteConversation();

  const remove = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteMutation.mutateAsync(id);
      if (id === activeId) onNew();
      toast.success("Conversation deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <Button onClick={onNew} variant="outline" size="lg" className="w-full justify-start gap-2">
          <Plus /> New conversation
        </Button>
      </div>
      <div className="px-4 pb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">History</div>
      <div className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
        {isLoading ? (
          Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="mx-2 my-2 h-9" />)
        ) : conversations.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">Your conversations will appear here.</p>
        ) : (
          conversations.map((c) => (
            <div
              key={c.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(c.id)}
              onKeyDown={(e) => e.key === "Enter" && onSelect(c.id)}
              className={cn(
                "group flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                c.id === activeId && "bg-accent text-accent-foreground hover:bg-accent"
              )}
            >
              <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{c.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNowStrict(new Date(c.updatedAt), { addSuffix: true })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-destructive"
                onClick={(e) => remove(e, c.id)}
                aria-label="Delete conversation"
              >
                <Trash2 />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
