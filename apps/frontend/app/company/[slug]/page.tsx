"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Review {
  id: string;
  content: string;
  issues: string;
  tags: string[];
  city: string;
  sourceCount: number;
}

interface CompanyData {
  id: string;
  name: string;
  slug: string;
  city: string;
  reviewCount: number;
}

export default function CompanyDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [company, setCompany] = useState<CompanyData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        // Fetch company info
        const companyRes = await fetch(`/api/companies/${slug}`);
        if (!companyRes.ok) {
          setError("企业不存在");
          setLoading(false);
          return;
        }
        const companyData = await companyRes.json();
        setCompany(companyData);

        // Fetch reviews
        const reviewsRes = await fetch(`/api/companies/${slug}/reviews`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData.reviews || []);
        }
      } catch {
        setError("加载失败，请稍后重试");
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
                  <span className="rounded-full bg-[#1A56DB]/10 px-2.5 py-0.5 text-xs text-[#1A56DB]">
                    {company.reviewCount} 条评价
                  </span>
                </div>
              </div>
            </div>
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
                {reviews.map((review, idx) => (
                  <div
                    key={review.id || idx}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    {/* Reviewer Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A56DB]/10 text-sm font-semibold text-[#1A56DB]">
                          匿
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            匿名用户
                          </p>
                          <p className="text-xs text-slate-400">
                            {review.city || company.city} · 来源数 {review.sourceCount || 1}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {review.tags && review.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {review.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-[#1A56DB]/5 px-2.5 py-0.5 text-xs text-[#1A56DB]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Content */}
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                      {review.content}
                    </p>

                    {/* Issues */}
                    {review.issues && (
                      <div className="mt-3 rounded-lg bg-slate-50 px-4 py-3">
                        <p className="text-xs font-medium text-slate-500">
                          主要问题
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {review.issues}
                        </p>
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

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                企业信息
              </h3>
              <dl className="mt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <dt className="text-slate-500">城市</dt>
                  <dd className="text-slate-700">{company.city || "-"}</dd>
                </div>
                <div className="flex justify-between text-xs">
                  <dt className="text-slate-500">评价数</dt>
                  <dd className="text-slate-700">{company.reviewCount} 条</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}