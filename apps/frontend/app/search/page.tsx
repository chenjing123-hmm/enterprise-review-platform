"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const CITIES = [
  { label: "全部", value: "" },
  { label: "深圳", value: "深圳" },
  { label: "广州", value: "广州" },
  { label: "上海", value: "上海" },
  { label: "北京", value: "北京" },
  { label: "杭州", value: "杭州" },
  { label: "东莞", value: "东莞" },
  { label: "长沙", value: "长沙" },
  { label: "佛山", value: "佛山" },
  { label: "厦门", value: "厦门" },
  { label: "郑州", value: "郑州" },
];

interface Company {
  id: string;
  name: string;
  slug: string;
  city: string;
  reviewCount: number;
  summary: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQ = searchParams.get("q") || "";
  const initialCity = searchParams.get("city") || "";

  const [searchInput, setSearchInput] = useState(initialQ);
  const [activeCity, setActiveCity] = useState(initialCity);
  const [results, setResults] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const doSearch = useCallback(
    async (q: string, city: string, p: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(p));
        params.set("limit", String(pageSize));
        if (q) params.set("q", q);
        if (city) params.set("city", city);

        const res = await fetch(`/api/companies?${params.toString()}`);
        const data = await res.json();
        setResults(data.companies || []);
        setTotal(data.total || 0);
      } catch {
        setResults([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const city = searchParams.get("city") || "";
    setSearchInput(q);
    setActiveCity(city);
    setPage(1);
    doSearch(q, city, 1);
  }, [searchParams, doSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    const params = new URLSearchParams();
    if (trimmed) params.set("q", trimmed);
    if (activeCity) params.set("city", activeCity);
    router.push(`/search?${params.toString()}`);
  };

  const handleCityChange = (city: string) => {
    setActiveCity(city);
    setPage(1);
    const params = new URLSearchParams();
    const q = searchParams.get("q") || "";
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    router.push(`/search?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const q = searchParams.get("q") || "";
    const city = searchParams.get("city") || "";
    doSearch(q, city, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">企业搜索</h1>
        <p className="mt-1 text-sm text-slate-500">
          共收录 {total > 0 ? total.toLocaleString() : "11,725"} 家企业，输入名称查看真实员工评价
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-2xl">
          <svg
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
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
          <input
            type="text"
            placeholder="输入企业名称，查看真实评价..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-28 text-base text-slate-900 shadow-sm placeholder-slate-400 transition-all focus:border-[#1A56DB] focus:outline-none focus:ring-4 focus:ring-[#1A56DB]/10"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[#1A56DB] px-6 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1550C8]"
          >
            搜索
          </button>
        </div>
      </form>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-600">城市：</span>
        {CITIES.map((city) => (
          <button
            key={city.value}
            onClick={() => handleCityChange(city.value)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
              activeCity === city.value
                ? "border-[#1A56DB] bg-[#1A56DB]/10 text-[#1A56DB]"
                : "border-slate-200 bg-white text-slate-600 hover:border-[#1A56DB]/30 hover:bg-[#1A56DB]/5 hover:text-[#1A56DB]"
            )}
          >
            {city.label}
          </button>
        ))}
      </div>

      {!loading && total > 0 && (
        <p className="mb-6 text-sm text-slate-500">
          共找到 <span className="font-semibold text-slate-900">{total.toLocaleString()}</span>{" "}
          家公司
        </p>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1A56DB]/30 border-t-[#1A56DB]" />
          <span className="ml-3 text-sm text-slate-500">搜索中...</span>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((company) => (
            <Link
              key={company.id}
              href={`/company/${company.slug}`}
              className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-[#1A56DB]/30 hover:shadow-md hover:shadow-[#1A56DB]/5"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#1A56DB]/10 to-[#1A56DB]/5 text-lg font-bold text-[#1A56DB]">
                  {company.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold text-slate-900 group-hover:text-[#1A56DB]">
                    {company.name}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    {company.city && (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5">
                        {company.city}
                      </span>
                    )}
                    {company.summary && (
                      <span className="truncate text-slate-400">
                        {company.summary.length > 30
                          ? company.summary.slice(0, 30) + "..."
                          : company.summary}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-400">
                  {company.reviewCount} 条评价
                </span>
                <span className="text-xs font-medium text-[#1A56DB] group-hover:underline">
                  查看详情 →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && total === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg
            className="h-16 w-16 text-slate-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <h3 className="mt-4 text-base font-medium text-slate-600">
            未找到相关企业
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            请尝试其他关键词或筛选条件
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            上一页
          </button>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
            const start = Math.max(1, page - 4);
            const end = Math.min(totalPages, start + 9);
            const p = start + i;
            if (p > end) return null;
            return (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                  p === page
                    ? "border-[#1A56DB] bg-[#1A56DB] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}