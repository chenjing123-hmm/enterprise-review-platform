"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";

/**
 * 全局客户端 Provider 层
 * - React Query：服务端状态管理、缓存、请求去重
 * - Zustand Store：全局客户端状态（后续通过 store 目录注入）
 * - Sonner Toast：全局提示通知
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 分钟内数据视为新鲜
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: "0.875rem",
          },
        }}
      />
    </QueryClientProvider>
  );
}