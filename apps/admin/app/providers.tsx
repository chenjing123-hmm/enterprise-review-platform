'use client';

import React, { useState } from 'react';
import { ConfigProvider, App as AntApp } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorPrimary: '#1A56DB',
            borderRadius: 6,
            fontFamily: 'Inter, PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif',
            colorSuccess: '#10B981',
            colorWarning: '#F59E0B',
            colorError: '#EF4444',
            colorInfo: '#1A56DB',
            fontSize: 14,
            colorBgContainer: '#ffffff',
            colorBorder: '#e5e7eb',
          },
          components: {
            Button: {
              borderRadius: 6,
              controlHeight: 36,
              paddingContentHorizontal: 16,
            },
            Card: {
              borderRadiusLG: 8,
            },
            Table: {
              borderRadius: 8,
              headerBg: '#f8fafc',
              headerColor: '#374151',
              rowHoverBg: '#f0f5ff',
            },
            Input: {
              borderRadius: 6,
              controlHeight: 36,
            },
            Select: {
              borderRadius: 6,
              controlHeight: 36,
            },
            DatePicker: {
              borderRadius: 6,
              controlHeight: 36,
            },
            Tabs: {
              inkBarColor: '#1A56DB',
              itemActiveColor: '#1A56DB',
              itemHoverColor: '#1A56DB',
            },
            Tag: {
              borderRadiusSM: 4,
            },
            Menu: {
              itemSelectedBg: '#eff6ff',
              itemSelectedColor: '#1A56DB',
              itemHoverBg: '#f0f5ff',
            },
            Descriptions: {
              titleMarginBottom: 16,
            },
            Timeline: {
              dotBg: 'transparent',
            },
          },
        }}
      >
        <AntApp>{children}</AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}