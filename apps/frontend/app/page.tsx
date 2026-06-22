"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const HOT_CITIES = [
  { name: "北京", slug: "beijing" },
  { name: "上海", slug: "shanghai" },
  { name: "深圳", slug: "shenzhen" },
  { name: "广州", slug: "guangzhou" },
  { name: "杭州", slug: "hangzhou" },
  { name: "成都", slug: "chengdu" },
];

const HIGHLIGHTS = [
  {
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    title: "真实评价",
    description: "实名认证 + 人工审核双重保障",
  },
  {
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "匿名保护",
    description: "严格保护评价者隐私，杜绝信息泄露",
  },
  {
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      </svg>
    ),
    title: "全面维度",
    description: "薪资、环境、发展、文化多维度评价",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="flex flex-col">
      {/* ==================== Hero Section ==================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1A56DB]/5 via-white to-white">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 right-0 h-[600px] w-[600px] -translate-y-1/4 translate-x-1/4 rounded-full bg-[#1A56DB]/[0.03] blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] translate-y-1/3 -translate-x-1/4 rounded-full bg-[#1A56DB]/[0.04] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 pb-20 pt-20 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#1A56DB]/20 bg-[#1A56DB]/5 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-[#1A56DB] animate-pulse" />
            <span className="text-sm font-medium text-[#1A56DB]">
              已收录 50,000+ 企业评价
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            真实员工评价
            <br />
            <span className="text-[#1A56DB]">帮你做出更好的职业选择</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-500 leading-relaxed">
            查看离职与在职员工的真实评价，了解公司薪资福利、工作环境、发展前景和团队氛围，
            为你的每一次职业决策提供可靠参考。
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mx-auto mt-10 max-w-xl">
            <div className="relative">
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
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-4 pl-12 pr-32 text-base text-slate-900 shadow-sm placeholder-slate-400 transition-all focus:border-[#1A56DB] focus:outline-none focus:ring-4 focus:ring-[#1A56DB]/10"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[#1A56DB] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1550C8] active:bg-[#1349B8]"
              >
                搜索
              </button>
            </div>
          </form>

          {/* Hot Cities */}
          <div className="mt-10">
            <p className="text-sm text-slate-400">热门城市</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {HOT_CITIES.map((city) => (
                <Link
                  key={city.slug}
                  href={`/search?city=${city.slug}`}
                  className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 shadow-sm transition-all hover:border-[#1A56DB]/30 hover:bg-[#1A56DB]/5 hover:text-[#1A56DB]"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== Highlights Section ==================== */}
      <section className="border-t border-slate-100 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              为什么选择企业点评？
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-500">
              我们致力于打造一个真实、公正、受法律保护的企业评价环境
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {HIGHLIGHTS.map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-slate-200 bg-white p-8 text-center transition-all hover:border-[#1A56DB]/20 hover:shadow-lg hover:shadow-[#1A56DB]/5"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#1A56DB]/10 text-[#1A56DB] transition-colors group-hover:bg-[#1A56DB] group-hover:text-white">
                  {item.icon}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== Trust Section ==================== */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#1A56DB] to-[#1E40AF] shadow-xl">
            <div className="px-8 py-12 sm:px-12 sm:py-16 text-center">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                合规运营，值得信赖
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-blue-100 leading-relaxed">
                本站所有评价均经实名认证和人工审核，仅展示单一企业独立评价详情页，
                不提供任何形式的排行榜或黑榜，确保评价的客观性与公正性。
              </p>
              <div className="mt-10 grid gap-6 sm:grid-cols-3">
                <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
                  <div className="text-2xl font-bold text-white">50,000+</div>
                  <div className="mt-1 text-sm text-blue-200">已审核评价</div>
                </div>
                <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="mt-1 text-sm text-blue-200">实名认证率</div>
                </div>
                <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
                  <div className="text-2xl font-bold text-white">24h</div>
                  <div className="mt-1 text-sm text-blue-200">审核时效</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}