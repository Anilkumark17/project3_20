import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { streamSSE } from "@/lib/sse";

/**
 * Progressive recommendations over SSE:
 *   retrieval phase → candidate courses (fast) → ranking phase → AI-ranked picks.
 */
export function useStreamingRecommendations(clerkId) {
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState("idle"); // idle | retrieval | ranking | complete | error
  const [message, setMessage] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const start = useCallback(async () => {
    if (!clerkId) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setPhase("retrieval");
    setMessage("Connecting…");
    setError(null);
    setCandidates([]);

    try {
      await streamSSE(`/recommendations/${clerkId}/stream`, {
        signal: controller.signal,
        onEvent: (event, data) => {
          if (event === "phase") {
            setPhase(data.phase);
            setMessage(data.message);
          } else if (event === "candidates") {
            setCandidates(data.recommendations);
          } else if (event === "complete") {
            setRecommendations(data.recommendations);
            setPhase("complete");
            queryClient.invalidateQueries({ queryKey: ["recommendations", clerkId] });
            queryClient.invalidateQueries({ queryKey: ["dashboard", clerkId] });
          } else if (event === "error") {
            setError(data.message);
            setPhase("error");
          }
        },
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message);
        setPhase("error");
      }
    }
  }, [clerkId, queryClient]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const isRunning = phase === "retrieval" || phase === "ranking";
  const progress = { idle: 0, retrieval: 30, ranking: 70, complete: 100, error: 100 }[phase] ?? 0;

  return { phase, message, candidates, recommendations, error, isRunning, progress, start };
}

export default useStreamingRecommendations;
