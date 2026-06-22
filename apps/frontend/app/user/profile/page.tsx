"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import apiClient, { clearTokens } from "@/lib/api-client";
import type { UserProfile } from "@erp/shared";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await apiClient.get<{ data: UserProfile }>("/users/profile");
        setProfile(res.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "确认注销") return;
    setDeleting(true);
    try {
      await apiClient.post("/users/delete-account");
      clearTokens();
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "注销失败");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleLogout = () => {
    clearTokens();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1A56DB]/30 border-t-[#1A56DB]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-xl font-bold text-slate-900">个人中心</h1>

      <div className="mt-6 space-y-6">
        {/* Profile Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#1A56DB]/10 to-[#1A56DB]/5 text-xl font-bold text-[#1A56DB]">
              {(profile.nickname || profile.realName || "用").charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {profile.nickname || "用户"}
              </h2>
              <p className="text-sm text-slate-400">
                注册于 {new Date(profile.createdAt).toLocaleDateString("zh-CN")}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">手机号码</span>
              <span className="text-sm font-medium text-slate-900">
                {profile.phone}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">实名认证</span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                  profile.realName
                    ? "border-green-200 bg-green-100 text-green-700"
                    : "border-amber-200 bg-amber-100 text-amber-700"
                )}
              >
                {profile.realName ? "已认证" : "未认证"}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">真实姓名</span>
              <span className="text-sm font-medium text-slate-900">
                {profile.realName || "未设置"}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">账号状态</span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                  profile.status === "ACTIVE"
                    ? "border-green-200 bg-green-100 text-green-700"
                    : profile.status === "MUTED"
                    ? "border-amber-200 bg-amber-100 text-amber-700"
                    : "border-red-200 bg-red-100 text-red-700"
                )}
              >
                {profile.status === "ACTIVE"
                  ? "正常"
                  : profile.status === "MUTED"
                  ? "禁言中"
                  : "已封禁"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">我的评价</span>
              <span className="text-sm font-medium text-slate-900">
                {profile.reviewCount} 条
              </span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">快捷操作</h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link
              href="/review/history"
              className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 transition-colors hover:border-[#1A56DB]/30 hover:bg-[#1A56DB]/5"
            >
              <svg
                className="h-5 w-5 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
              </svg>
              我的评价记录
            </Link>
            <Link
              href="/search"
              className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 transition-colors hover:border-[#1A56DB]/30 hover:bg-[#1A56DB]/5"
            >
              <svg
                className="h-5 w-5 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              搜索企业
            </Link>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-red-600">危险操作</h3>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-700">注销账号</p>
              <p className="text-xs text-slate-400">
                注销后您的个人信息将被删除，评价内容将匿名化处理
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              注销账号
            </button>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-5 w-5 text-red-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  确认注销账号
                </h2>
                <p className="text-sm text-slate-500">
                  此操作不可撤销，请谨慎操作
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700 leading-relaxed">
              <p className="font-semibold">注销账号后，以下事项请您知悉：</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>您的账号将被永久注销，无法恢复。</li>
                <li>
                  注销后有7天冷静期，在此期间如重新登录，注销申请将自动取消。
                </li>
                <li>
                  您的实名认证信息（姓名、身份证号、手机号）将被永久删除。
                </li>
                <li>
                  您发布的评价内容将进行匿名化处理（隐藏发布者身份信息），但评价内容本身将保留供其他用户参考。
                </li>
                <li>
                  您的设备信息、日志信息将在数据保留期限届满后删除。
                </li>
                <li>
                  如您有未处理的投诉或纠纷，请先处理后申请注销。
                </li>
              </ul>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                请输入"确认注销"以继续
              </label>
              <input
                type="text"
                placeholder="确认注销"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmText("");
                }}
                className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "确认注销" || deleting}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "处理中..." : "确认注销"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}