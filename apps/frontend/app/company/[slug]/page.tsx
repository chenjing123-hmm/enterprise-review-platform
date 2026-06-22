"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api-client";
import type {
  CompanyResponse,
  ReviewResponse,
  RatingDimensions,
} from "@erp/shared";
import { RATING_DIMENSION_LABELS, EMPLOYMENT_TYPE_LABELS } from "@erp/shared";

const RATING_DIMENSIONS: (keyof RatingDimensions)[] = [
  "overall",
  "salary",
  "environment",
  "growth",
  "management",
  "workLifeBalance",
];

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <svg
          key={i}
          className={cn(
            "h-4 w-4",
            i < Math.round(value) ? "text-amber-400" : "text-slate-200"
          )}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function RatingBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-sm text-slate-600">{label}</span>
      <div className="flex flex-1 items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#1A56DB] transition-all"
            style={{ width: `${(value / 5) * 100}%` }}
          />
        </div>
        <span className="w-8 text-right text-sm font-medium text-slate-700">
          {value.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

export default function CompanyDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [company, setCompany] = useState<CompanyResponse | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const [companyRes, reviewsRes] = await Promise.all([
          apiClient.get<{ data: CompanyResponse }>(`/companies/${slug}`),
          apiClient.get<{ data: ReviewResponse[] }>(
            `/companies/${slug}/reviews`,
            {
              params: {
                publishStatus: "PUBLISHED",
                sortBy: "createdAt",
                sortOrder: "desc",
              },
            }
          ),
        ]);
        setCompany(companyRes.data);
        setReviews(reviewsRes.data || []);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "加载失败，请稍后重试"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1A56DB]/30 border-t-[#1A56DB]" />
        <span className="ml-3 text-sm text-slate-500">加载中...</span>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-slate-700">
          {error || "企业不存在"}
        </h2>
        <Link
          href="/search"
          className="mt-4 inline-block text-sm text-[#1A56DB] hover:underline"
        >
          返回搜索
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="lg:flex lg:gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Company Header */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1A56DB]/10 to-[#1A56DB]/5 text-2xl font-bold text-[#1A56DB]">
                {company.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-slate-900">
                  {company.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {company.city && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                      {company.city}
                    </span>
                  )}
                  {company.industry && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                      {company.industry}
                    </span>
                  )}
                  {company.scale && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                      {company.scale}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-bold text-[#1A56DB]">
                      {company.avgRating.toFixed(1)}
                    </span>
                    <StarRating value={company.avgRating} />
                  </div>
                  <span className="text-sm text-slate-400">
                    {company.reviewCount} 条评价
                  </span>
                </div>
              </div>
            </div>
            {company.description && (
              <p className="mt-5 text-sm leading-relaxed text-slate-600">
                {company.description}
              </p>
            )}
          </div>

          {/* Compliance Note */}
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
            以上评价均为用户个人观点，不代表本平台立场。本平台仅提供信息展示服务，不对评价内容的真实性、准确性负责。
          </div>

          {/* Reviews List */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-slate-900">
              员工评价
              <span className="ml-2 text-sm font-normal text-slate-400">
                （共 {reviews.length} 条）
              </span>
            </h2>

            {reviews.length === 0 ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-white py-12 text-center">
                <p className="text-sm text-slate-400">暂无评价</p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    {/* Reviewer Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A56DB]/10 text-sm font-semibold text-[#1A56DB]">
                          {review.isAnonymous
                            ? "匿"
                            : review.userNickname.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {review.isAnonymous
                              ? "匿名用户"
                              : review.userNickname}
                          </p>
                          <p className="text-xs text-slate-400">
                            {review.jobTitle}
                            {" · "}
                            {review.employmentType
                              ? EMPLOYMENT_TYPE_LABELS[review.employmentType] ||
                                review.employmentType
                              : ""}
                            {" · "}
                            {review.startDate}
                            {review.endDate ? ` - ${review.endDate}` : " - 至今"}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(review.createdAt).toLocaleDateString("zh-CN")}
                      </span>
                    </div>

                    {/* Rating Bars */}
                    <div className="mt-4 space-y-1.5">
                      {RATING_DIMENSIONS.map((dim) => (
                        <RatingBar
                          key={dim}
                          label={
                            RATING_DIMENSION_LABELS[dim] || dim
                          }
                          value={review.rating[dim] || 0}
                        />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="mt-4 text-sm leading-relaxed text-slate-700">
                      {review.content}
                    </p>

                    {/* Evidence Indicator */}
                    {review.evidenceIds && review.evidenceIds.length > 0 && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-green-600">
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        已上传证明材料
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="mt-6 lg:mt-0 lg:w-72">
          <div className="sticky top-24 space-y-4">
            {/* Complaint CTA */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                企业申诉
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                如果您是该企业负责人，可对不实评价进行申诉
              </p>
              <Link
                href="/complaint"
                className="mt-3 block w-full rounded-lg border border-[#1A56DB] py-2 text-center text-sm font-medium text-[#1A56DB] transition-colors hover:bg-[#1A56DB]/5"
              >
                发起申诉
              </Link>
            </div>

            {/* Company Stats */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                企业信息
              </h3>
              <dl className="mt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <dt className="text-slate-500">行业</dt>
                  <dd className="text-slate-700">
                    {company.industry || "-"}
                  </dd>
                </div>
                <div className="flex justify-between text-xs">
                  <dt className="text-slate-500">规模</dt>
                  <dd className="text-slate-700">
                    {company.scale || "-"}
                  </dd>
                </div>
                <div className="flex justify-between text-xs">
                  <dt className="text-slate-500">城市</dt>
                  <dd className="text-slate-700">
                    {company.city || "-"}
                  </dd>
                </div>
                {company.establishedDate && (
                  <div className="flex justify-between text-xs">
                    <dt className="text-slate-500">成立日期</dt>
                    <dd className="text-slate-700">
                      {company.establishedDate}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}