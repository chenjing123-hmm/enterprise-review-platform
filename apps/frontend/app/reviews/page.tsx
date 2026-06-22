"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api-client";
import { AUDIT_STATUS_LABELS, type ReviewResponse } from "@erp/shared";

const STATUS_BADGE_CLASSES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  APPROVED: "bg-green-100 text-green-700 border-green-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
  HIDDEN: "bg-gray-100 text-gray-500 border-gray-200",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "待审核",
  APPROVED: "已通过",
  REJECTED: "已驳回",
  HIDDEN: "已下架",
};

export default function ReviewHistoryPage() {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      try {
        const res = await apiClient.get<{ data: ReviewResponse[] }>(
          "/reviews/my"
        );
        setReviews(res.data || []);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "加载失败，请稍后重试"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1A56DB]/30 border-t-[#1A56DB]" />
          <span className="ml-3 text-sm text-slate-500">加载中...</span>
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-900">我的评价</h1>
        <p className="mt-1 text-sm text-slate-500">
          您发布的所有评价记录
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-center">
          <svg
            className="h-16 w-16 text-slate-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <p className="mt-4 text-sm text-slate-500">暂无评价记录</p>
          <Link
            href="/search"
            className="mt-3 rounded-lg bg-[#1A56DB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1550C8]"
          >
            去搜索企业
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/company/${review.companyId}`}
                      className="truncate text-base font-semibold text-slate-900 hover:text-[#1A56DB]"
                    >
                      {review.companyName}
                    </Link>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        STATUS_BADGE_CLASSES[review.publishStatus] ||
                          STATUS_BADGE_CLASSES.PENDING
                      )}
                    >
                      {STATUS_LABELS[review.publishStatus] ||
                        AUDIT_STATUS_LABELS[review.auditStatus] ||
                        review.publishStatus}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {review.jobTitle} · {new Date(review.createdAt).toLocaleDateString("zh-CN")}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
                    {review.content}
                  </p>
                  {review.auditRemark && (
                    <p className="mt-2 rounded bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
                      审核备注：{review.auditRemark}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}