"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import apiClient from "@/lib/api-client";
import { setAccessToken, setRefreshToken } from "@/lib/api-client";
import type { AuthResponse } from "@erp/shared";

export default function RegisterPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [realName, setRealName] = useState("");
  const [idCardNumber, setIdCardNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleRegister = async (e: React.FormEvent) => {
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
    if (!realName.trim()) {
      setError("请输入真实姓名");
      return;
    }
    if (!/^\d{17}[\dXx]$/.test(idCardNumber)) {
      setError("请输入正确的身份证号码");
      return;
    }
    if (password.length < 8) {
      setError("密码长度至少8位");
      return;
    }
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post<{ data: AuthResponse }>(
        "/auth/register",
        {
          phone,
          code,
          realName,
          idCardNumber,
          password,
        }
      );
      if (res.data?.accessToken) {
        setAccessToken(res.data.accessToken);
        setRefreshToken(res.data.refreshToken);
      }
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "注册失败，请重试");
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
        <h1 className="text-xl font-bold text-slate-900">注册账号</h1>
        <p className="mt-1 text-sm text-slate-500">
          完成实名认证后即可发布评价
        </p>

        {/* Legal Notice */}
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700 leading-relaxed">
          根据《中华人民共和国网络安全法》第二十四条要求，发布评价需完成实名认证。您的个人信息将严格加密存储，仅用于平台身份核验。
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-6 space-y-4">
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

          {/* Real Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              真实姓名
            </label>
            <input
              type="text"
              placeholder="请输入真实姓名"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-[#1A56DB] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]/20"
            />
          </div>

          {/* ID Card */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              身份证号码
            </label>
            <input
              type="text"
              maxLength={18}
              placeholder="请输入身份证号码"
              value={idCardNumber}
              onChange={(e) =>
                setIdCardNumber(
                  e.target.value.replace(/[^\dXx]/g, "").toUpperCase()
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-[#1A56DB] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]/20"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              设置密码
            </label>
            <input
              type="password"
              placeholder="至少8位字符"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-[#1A56DB] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]/20"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              确认密码
            </label>
            <input
              type="password"
              placeholder="请再次输入密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-[#1A56DB] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]/20"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#1A56DB] py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1550C8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "注册中..." : "注册"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          已有账号？{" "}
          <Link
            href="/login"
            className="font-medium text-[#1A56DB] hover:underline"
          >
            立即登录
          </Link>
        </div>
      </div>
    </div>
  );
}