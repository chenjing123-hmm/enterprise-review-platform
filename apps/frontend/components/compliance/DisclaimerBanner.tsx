import { cn } from "@/lib/utils";

interface DisclaimerBannerProps {
  className?: string;
}

export function DisclaimerBanner({ className }: DisclaimerBannerProps) {
  return (
    <div
      className={cn(
        "w-full border-b border-amber-300/60 bg-amber-50 px-4 py-2.5",
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 text-sm text-amber-800">
        {/* Warning Icon */}
        <svg
          className="h-4 w-4 shrink-0 text-[#D97706]"
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
        <span>
          本站所有评价均经实名认证和人工审核，仅展示单一企业独立评价详情页，不提供任何形式的排行榜或黑榜
        </span>
      </div>
    </div>
  );
}