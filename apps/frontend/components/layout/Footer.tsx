import Link from "next/link";

const LEGAL_LINKS = [
  { label: "平台免责声明", href: "/legal/disclaimer" },
  { label: "用户服务协议", href: "/legal/terms" },
  { label: "隐私保护政策", href: "/legal/privacy" },
  { label: "评价发布自律公约", href: "/legal/convention" },
  { label: "企业申诉规则", href: "/legal/appeal" },
  { label: "备案资质公示", href: "/legal/icp" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Legal Links */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-slate-500 transition-colors hover:text-slate-800"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="mt-6 border-t border-slate-200" />

        {/* Copyright */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            &copy; {currentYear} 企业点评 — 真实员工评价平台。本站内容仅供用户参考，不构成任何法律意见。
          </p>
          <p className="mt-1 text-xs text-slate-400">
            本站严格遵守《中华人民共和国网络安全法》《中华人民共和国个人信息保护法》等法律法规。
          </p>
        </div>
      </div>
    </footer>
  );
}