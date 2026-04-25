import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

// Get completed courses for a user
export const useCompletedCourses = (clerkId) => {
  return useQuery({
    queryKey: ["completedCourses", clerkId],
    queryFn: async () => {
      const { data } = await axios.get(`/profile/${clerkId}/courses`);
      return data.completedCourses || [];
    },
    enabled: !!clerkId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Add a completed course
export const useAddCompletedCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clerkId, courseId, grade }) => {
      const { data } = await axios.post(`/profile/${clerkId}/courses`, {
        courseId,
        grade,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["completedCourses", variables.clerkId] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.clerkId] });
      queryClient.invalidateQueries({ queryKey: ["recommendations", variables.clerkId] });
    },
  });
};

// Remove a completed course
export const useRemoveCompletedCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clerkId, courseId }) => {
      const { data } = await axios.delete(`/profile/${clerkId}/courses/${courseId}`);
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ["completedCourses", variables.clerkId] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.clerkId] });
      queryClient.invalidateQueries({ queryKey: ["recommendations", variables.clerkId] });
      
      console.log('Course removed successfully:', data);
    },
    onError: (error, variables) => {
      console.error('Failed to remove course:', error);
      console.error('Variables:', variables);
      
      // Rethrow error so component can handle it
      throw error;
    },
  });
};
