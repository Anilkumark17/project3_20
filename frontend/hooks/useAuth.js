import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/authService";

export function useSyncUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.syncUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useUser(clerkId) {
  return useQuery({
    queryKey: ["user", clerkId],
    queryFn: () => authService.getUser(clerkId),
    enabled: !!clerkId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useProfile(clerkId) {
  return useQuery({
    queryKey: ["profile", clerkId],
    queryFn: () => authService.getProfile(clerkId),
    enabled: !!clerkId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useUpdateProfile(clerkId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData) => authService.updateProfile(clerkId, profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", clerkId] });
      queryClient.invalidateQueries({ queryKey: ["user", clerkId] });
    },
  });
}
