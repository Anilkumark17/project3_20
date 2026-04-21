import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

// Get all courses
export const useCourses = () => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data } = await axios.get("/courses");
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Get course by ID
export const useCourse = (id) => {
  return useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const { data } = await axios.get(`/courses/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Search courses with filters
export const useSearchCourses = (filters) => {
  return useQuery({
    queryKey: ["courses", "search", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.keyword) params.append("keyword", filters.keyword);
      if (filters.program) params.append("program", filters.program);
      if (filters.semester) params.append("semester", filters.semester);
      if (filters.minDifficulty) params.append("minDifficulty", filters.minDifficulty);
      if (filters.maxDifficulty) params.append("maxDifficulty", filters.maxDifficulty);
      if (filters.credits) params.append("credits", filters.credits);

      const { data } = await axios.get(`/courses/search?${params.toString()}`);
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
};

// Get course catalog with filters
export const useCourseCatalog = (filters) => {
  return useQuery({
    queryKey: ["courses", "catalog", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.program) params.append("program", filters.program);
      if (filters.semester) params.append("semester", filters.semester);
      if (filters.keyword) params.append("keyword", filters.keyword);

      const { data } = await axios.get(`/courses/catalog?${params.toString()}`);
      return data;
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Get courses by program
export const useCoursesByProgram = (program) => {
  return useQuery({
    queryKey: ["courses", "program", program],
    queryFn: async () => {
      const { data } = await axios.get(`/courses/program/${program}`);
      return data;
    },
    enabled: !!program,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Get courses by semester
export const useCoursesBySemester = (semester) => {
  return useQuery({
    queryKey: ["courses", "semester", semester],
    queryFn: async () => {
      const { data } = await axios.get(`/courses/semester/${semester}`);
      return data;
    },
    enabled: !!semester,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Create course mutation
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseData) => {
      const { data } = await axios.post("/courses", courseData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    retry: 1,
  });
};

// Update course mutation
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, courseData }) => {
      const { data } = await axios.put(`/courses/${id}`, courseData);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", variables.id] });
    },
    retry: 1,
  });
};

// Delete course mutation
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await axios.delete(`/courses/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    retry: 1,
  });
};
