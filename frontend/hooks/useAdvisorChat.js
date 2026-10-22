import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { streamSSE } from "@/lib/sse";
import { useConversation } from "@/hooks/useConversations";

let localId = 0;
const nextId = () => `local-${++localId}`;

/**
 * Chat state for the AI advisor. Streams answers over SSE, keeps citations
 * attached to each assistant message, and syncs with persisted conversations.
 *
 * Messages are derived: persisted ones come from the query cache; once the user
 * sends in this session, a local copy (tagged with the conversation ids it
 * belongs to) takes over so streamed tokens render immediately.
 */
export function useAdvisorChat({ conversationId, onConversationCreated }) {
  const queryClient = useQueryClient();
  const [local, setLocal] = useState(null); // { ids: Set<string|null>, messages: [] }
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef(null);
  const activeIdRef = useRef(conversationId);

  const { data: conversation, isLoading: isLoadingConversation } = useConversation(conversationId);

  const serverMessages = useMemo(
    () =>
      conversation && conversation.id === conversationId
        ? conversation.messages.map((m) => ({ id: m.id, role: m.role, content: m.content, citations: m.citations || [] }))
        : [],
    [conversation, conversationId]
  );

  const ownsLocal = local?.ids.has(conversationId ?? null);
  const messages = ownsLocal ? local.messages : serverMessages;

  const updateMessage = (id, patch) =>
    setLocal((l) => ({
      ...l,
      messages: l.messages.map((m) => (m.id === id ? { ...m, ...(typeof patch === "function" ? patch(m) : patch) } : m)),
    }));

  const send = useCallback(
    async (question) => {
      const text = question.trim();
      if (!text || isStreaming) return;

      const assistantId = nextId();
      setLocal({
        ids: new Set([conversationId ?? null]),
        messages: [
          ...messages,
          { id: nextId(), role: "user", content: text },
          { id: assistantId, role: "assistant", content: "", citations: [], sources: [], pending: true },
        ],
      });
      setIsStreaming(true);
      activeIdRef.current = conversationId;

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamSSE("/rag/ask/stream", {
          body: { question: text, ...(activeIdRef.current ? { conversationId: activeIdRef.current } : {}) },
          signal: controller.signal,
          onEvent: (event, data) => {
            if (event === "conversation" && data.conversationId !== activeIdRef.current) {
              activeIdRef.current = data.conversationId;
              setLocal((l) => ({ ...l, ids: new Set([...l.ids, data.conversationId]) }));
              onConversationCreated?.(data.conversationId);
            } else if (event === "sources") {
              updateMessage(assistantId, { sources: data.citations });
            } else if (event === "token") {
              updateMessage(assistantId, (m) => ({ content: m.content + data.t, pending: false }));
            } else if (event === "done") {
              updateMessage(assistantId, { citations: data.citations, pending: false, timings: data.timings });
            } else if (event === "error") {
              updateMessage(assistantId, { error: data.message, pending: false });
            }
          },
        });
      } catch (err) {
        if (err.name !== "AbortError") updateMessage(assistantId, { error: err.message, pending: false });
        else updateMessage(assistantId, { pending: false, stopped: true });
      } finally {
        abortRef.current = null;
        setIsStreaming(false);
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        if (activeIdRef.current) queryClient.invalidateQueries({ queryKey: ["conversation", activeIdRef.current] });
      }
    },
    [isStreaming, messages, conversationId, onConversationCreated, queryClient]
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  useEffect(() => () => abortRef.current?.abort(), []);

  return {
    messages,
    send,
    stop,
    isStreaming,
    isLoadingConversation: !!conversationId && !ownsLocal && isLoadingConversation,
  };
}
