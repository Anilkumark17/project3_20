import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

export const useRecommendations = (clerkId) => {
  return useQuery({
    queryKey: ["recommendations", clerkId],
    queryFn: async () => {
      const { data } = await axios.get(`/recommendations/${clerkId}`, { timeout: 60000 });
      return data;
    },
    enabled: !!clerkId,
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useRefreshRecommendations = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (clerkId) => {
      const { data } = await axios.post(`/recommendations/${clerkId}/refresh`, {}, { timeout: 60000 });
      return data;
    },
    onSuccess: (_, clerkId) => {
      queryClient.invalidateQueries({ queryKey: ["recommendations", clerkId] });
    },
  });
};
