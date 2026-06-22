import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "备案资质公示 - 企业点评",
  description: "企业点评平台备案资质公示，展示ICP备案、增值电信业务许可证、营业执照等资质信息",
};

export default function QualificationPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">备案资质公示</h1>
      <p className="mt-2 text-sm text-slate-500">
        以下为本平台依法取得的各项资质与备案信息，供公众监督查阅
      </p>

      <div className="mt-8 space-y-6">
        {/* ICP Filing */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            互联网信息服务备案（ICP备案）
          </h2>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">ICP备案号</span>
              <span className="font-mono font-medium text-slate-900">
                [待填写] ICP备XXXXXXXX号
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">备案主体</span>
              <span className="text-slate-900">
                [待填写] XXX科技有限公司
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">备案日期</span>
              <span className="text-slate-900">[待填写]</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">备案机关</span>
              <span className="text-slate-900">[待填写] XX省通信管理局</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">网站首页地址</span>
              <span className="text-slate-900">[待填写] www.xxx.com</span>
            </div>
          </div>
        </div>

        {/* Value-Added Telecom License */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            增值电信业务经营许可证
          </h2>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">许可证编号</span>
              <span className="font-mono font-medium text-slate-900">
                [待填写] B2-XXXXXXXX
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">持证主体</span>
              <span className="text-slate-900">
                [待填写] XXX科技有限公司
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">业务种类</span>
              <span className="text-slate-900">
                [待填写] 信息服务业务（仅限互联网信息服务）
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">覆盖范围</span>
              <span className="text-slate-900">[待填写] 全国</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">有效期</span>
              <span className="text-slate-900">[待填写]</span>
            </div>
          </div>
        </div>

        {/* Comment Service Filing */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            跟帖评论服务备案
          </h2>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">备案编号</span>
              <span className="font-mono font-medium text-slate-900">
                [待填写] 跟帖评论备XXXXXXXX号
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">备案主体</span>
              <span className="text-slate-900">
                [待填写] XXX科技有限公司
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">备案日期</span>
              <span className="text-slate-900">[待填写]</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">备案机关</span>
              <span className="text-slate-900">
                [待填写] 国家互联网信息办公室 / XX省网信办
              </span>
            </div>
          </div>
        </div>

        {/* Business License */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">营业执照信息</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">统一社会信用代码</span>
              <span className="font-mono font-medium text-slate-900">
                [待填写] 91110108XXXXXXXXXX
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">企业名称</span>
              <span className="text-slate-900">
                [待填写] XXX科技有限公司
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">法定代表人</span>
              <span className="text-slate-900">[待填写]</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">注册资本</span>
              <span className="text-slate-900">[待填写]</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">成立日期</span>
              <span className="text-slate-900">[待填写]</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">经营范围</span>
              <span className="text-right text-slate-900">
                [待填写] 互联网信息服务、软件开发、技术咨询等
              </span>
            </div>
          </div>
        </div>

        {/* Report Portal */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            网信办举报入口
          </h2>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">举报中心</span>
              <span className="text-slate-900">
                中央网信办（国家互联网信息办公室）违法和不良信息举报中心
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">举报网站</span>
              <span className="text-[#1A56DB]">www.12377.cn</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">举报电话</span>
              <span className="text-slate-900">12377</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">举报邮箱</span>
              <span className="text-slate-900">jubao@12377.cn</span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">联系方式</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">运营主体</span>
              <span className="text-slate-900">
                [待填写] XXX科技有限公司
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">联系地址</span>
              <span className="text-slate-900">
                [待填写] 北京市朝阳区XXX路XXX号
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">邮政编码</span>
              <span className="text-slate-900">[待填写] 100000</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">客服电话</span>
              <span className="text-slate-900">[待填写] 400-XXX-XXXX</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">电子邮箱</span>
              <span className="text-slate-900">[待填写] contact@xxx.com</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          以上备案信息为本平台依法取得的资质公示，其中标注"待填写"的字段将在相关资质取得后及时更新。公众可通过各主管部门官方网站查询核实本平台资质信息的真实性。本平台承诺以上信息真实有效，如有变更将及时更新公示。
        </div>
      </div>
    </div>
  );
}