'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api-client';

const COMPLAINT_TYPES = [
  { value: 'FALSE_INFO', label: '虚假信息' },
  { value: 'MALICIOUS_DEFAMATION', label: '恶意诋毁' },
  { value: 'PERSONAL_ATTACK', label: '人身攻击' },
  { value: 'PRIVACY_LEAK', label: '隐私泄露' },
  { value: 'SPAM', label: '垃圾广告' },
  { value: 'COPYRIGHT_INFRINGEMENT', label: '侵权内容' },
  { value: 'OTHER', label: '其他' },
];

export default function ComplaintPage() {
  const [form, setForm] = useState({
    companyName: '',
    complainantName: '',
    complainantPhone: '',
    complainantPosition: '',
    complaintType: '',
    targetUrl: '',
    reason: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNo, setTicketNo] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.companyName || !form.complainantName || !form.complaintType || !form.reason) {
      setError('请填写所有必填项');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiClient.post<{ data: { ticketNo: string } }>('/complaints', form);
      setTicketNo(res.data.ticketNo);
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">申诉已提交</h2>
        <p className="mt-2 text-sm text-slate-500">工单号：{ticketNo}</p>
        <p className="mt-4 text-sm text-slate-600">我们将在 24 小时内处理您的申诉，请保存工单号以便查询进度。</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">企业侵权申诉</h1>
      <p className="mt-2 text-sm text-slate-500">
        如果您认为平台上的评价内容侵犯了您的合法权益，请通过此表单提交申诉。我们承诺在收到完整材料后 24 小时内完成核查处置。
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700">企业名称 <span className="text-red-500">*</span></label>
          <input type="text" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1A56DB] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]" placeholder="请输入被评价的企业名称" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">申诉人姓名 <span className="text-red-500">*</span></label>
            <input type="text" value={form.complainantName} onChange={e => setForm({ ...form, complainantName: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1A56DB] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">联系电话 <span className="text-red-500">*</span></label>
            <input type="tel" value={form.complainantPhone} onChange={e => setForm({ ...form, complainantPhone: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1A56DB] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">您的职位</label>
          <input type="text" value={form.complainantPosition} onChange={e => setForm({ ...form, complainantPosition: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1A56DB] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]" placeholder="如：HR经理、法务负责人" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">投诉类型 <span className="text-red-500">*</span></label>
          <select value={form.complaintType} onChange={e => setForm({ ...form, complaintType: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1A56DB] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]">
            <option value="">请选择投诉类型</option>
            {COMPLAINT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">相关评价链接</label>
          <input type="url" value={form.targetUrl} onChange={e => setForm({ ...form, targetUrl: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1A56DB] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]" placeholder="请粘贴相关评价的页面链接" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">申诉理由 <span className="text-red-500">*</span></label>
          <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={4} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1A56DB] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]" placeholder="请详细说明申诉理由，包括哪些内容不实、为什么构成侵权等" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">补充说明</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1A56DB] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]" placeholder="其他需要补充的信息" />
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          <strong>提示：</strong>请准备好以下材料以便后续上传：营业执照副本、侵权页面截图、不实内容证明材料。虚假申诉将承担相应法律责任。
        </div>

        <button type="submit" disabled={submitting} className={cn("w-full rounded-lg py-2.5 text-sm font-medium text-white transition-colors", submitting ? "bg-slate-400 cursor-not-allowed" : "bg-[#1A56DB] hover:bg-[#1E40AF]")}>
          {submitting ? '提交中...' : '提交申诉'}
        </button>
      </form>
    </div>
  );
}