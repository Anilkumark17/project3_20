import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

export function useConversations(enabled = true) {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data } = await axios.get("/rag/conversations");
      return data.conversations;
    },
    enabled,
    staleTime: 30 * 1000,
    refetchOnMount: true,
  });
}

export function useConversation(id) {
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: async () => {
      const { data } = await axios.get(`/rag/conversations/${id}`);
      return data.conversation;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => axios.delete(`/rag/conversations/${id}`),
    onSuccess: (_, id) => {
      queryClient.setQueryData(["conversations"], (prev) => prev?.filter((c) => c.id !== id));
      queryClient.removeQueries({ queryKey: ["conversation", id] });
    },
  });
}

export function useRenameConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, title }) => (await axios.patch(`/rag/conversations/${id}`, { title })).data.conversation,
    onSuccess: (conversation) => {
      queryClient.setQueryData(["conversations"], (prev) => prev?.map((c) => (c.id === conversation.id ? conversation : c)));
    },
  });
}
