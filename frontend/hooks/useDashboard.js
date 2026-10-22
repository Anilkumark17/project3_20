import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

export function useDashboard(clerkId) {
  return useQuery({
    queryKey: ["dashboard", clerkId],
    queryFn: async () => {
      const { data } = await axios.get(`/dashboard/${clerkId}`);
      return data.data;
    },
    enabled: !!clerkId,
    staleTime: 60 * 1000,
    refetchOnMount: true,
  });
}
