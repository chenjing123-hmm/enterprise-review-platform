"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import apiClient from "@/lib/api-client";
import { setAccessToken, setRefreshToken } from "@/lib/api-client";
import type { AuthResponse } from "@erp/shared";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError("请输入正确的手机号码");
      return;
    }
    setSending(true);
    setError("");
    try {
      await apiClient.post("/auth/send-code", { phone });
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "验证码发送失败");
    } finally {
      setSending(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError("请输入正确的手机号码");
      return;
    }
    if (!code || code.length < 4) {
      setError("请输入验证码");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post<{ data: AuthResponse }>(
        "/auth/login",
        { phone, code }
      );
      if (res.data?.accessToken) {
        setAccessToken(res.data.accessToken);
        setRefreshToken(res.data.refreshToken);
      }
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-2xl font-bold text-[#1A56DB]"
        >
          <svg
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          企业点评
        </Link>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">登录</h1>
        <p className="mt-1 text-sm text-slate-500">
          欢迎回来，请使用手机号登录
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-5">
          {/* Phone */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              手机号码
            </label>
            <input
              type="tel"
              maxLength={11}
              placeholder="请输入手机号码"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-[#1A56DB] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]/20"
            />
          </div>

          {/* SMS Code */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              验证码
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                maxLength={6}
                placeholder="请输入验证码"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-[#1A56DB] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]/20"
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={countdown > 0 || sending}
                className="shrink-0 rounded-lg border border-[#1A56DB] px-4 py-3 text-sm font-medium text-[#1A56DB] transition-colors hover:bg-[#1A56DB]/5 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
              >
                {countdown > 0 ? `${countdown}s` : sending ? "发送中..." : "发送验证码"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#1A56DB] py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1550C8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          还没有账号？{" "}
          <Link
            href="/register"
            className="font-medium text-[#1A56DB] hover:underline"
          >
            立即注册
          </Link>
        </div>
      </div>
    </div>
  );
}