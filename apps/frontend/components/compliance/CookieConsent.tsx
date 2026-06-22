"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const COOKIE_CONSENT_KEY = "cookie-consent";

type ConsentChoice = "all" | "necessary" | null;

export function CookieConsent() {
  const [choice, setChoice] = useState<ConsentChoice>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      setVisible(true);
    } else {
      setChoice(stored as ConsentChoice);
    }
  }, []);

  const handleConsent = (value: ConsentChoice) => {
    if (value) {
      localStorage.setItem(COOKIE_CONSENT_KEY, value);
    }
    setChoice(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        {/* Message */}
        <div className="flex-1 pr-0 sm:pr-8">
          <p className="text-sm leading-relaxed text-slate-600">
            我们使用 Cookie 来改善用户体验、分析网站流量并提供个性化内容。继续使用本网站即表示您同意我们的
            <Link
              href="/legal/privacy"
              className="mx-1 font-medium text-[#1A56DB] underline underline-offset-2 hover:text-[#1550C8]"
            >
              隐私保护政策
            </Link>
            。
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleConsent("necessary")}
            className={cn(
              "rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700",
              "transition-colors hover:bg-slate-50 active:bg-slate-100"
            )}
          >
            仅必要
          </button>
          <Link
            href="/legal/privacy"
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium text-slate-600",
              "transition-colors hover:text-slate-800"
            )}
          >
            查看隐私政策
          </Link>
          <button
            onClick={() => handleConsent("all")}
            className="rounded-lg bg-[#1A56DB] px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1550C8] active:bg-[#1349B8]"
          >
            接受全部
          </button>
        </div>
      </div>
    </div>
  );
}