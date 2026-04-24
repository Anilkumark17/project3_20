"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,   // 5 min default — serves cache first, revalidates silently
            gcTime: 15 * 60 * 1000,      // keep unused data 15 min before garbage collecting
            refetchOnWindowFocus: false,
            refetchOnMount: false,        // show cached data instantly on revisit
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
