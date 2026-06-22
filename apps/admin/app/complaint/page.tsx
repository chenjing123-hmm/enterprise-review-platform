'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Tabs, Tag, DatePicker, Button, Space, Select, message, Typography,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { getComplaintList } from '@/lib/api-client';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'orange', label: '待处理' },
  PROCESSING: { color: 'blue', label: '处理中' },
  RESOLVED: { color: 'green', label: '已完成' },
  DISMISSED: { color: 'default', label: '已驳回' },
};

const COMPLAINT_TYPE_LABELS: Record<string, string> = {
  FALSE_INFO: '虚假信息',
  MALICIOUS_DEFAMATION: '恶意诋毁',
  PERSONAL_ATTACK: '人身攻击',
  PRIVACY_LEAK: '泄露隐私',
  SPAM: '广告骚扰',
  COPYRIGHT_INFRINGEMENT: '侵权内容',
  OTHER: '其他',
};

export default function ComplaintPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('PENDING');
  const [data, setData] = useState<Array<Record<string, unknown>>>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [complaintType, setComplaintType] = useState<string | undefined>(undefined);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getComplaintList({
        status: activeTab,
        page,
        pageSize,
        startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
        complaintType,
      });
      setData(res.list);
      setTotal(res.total);
    } catch {
      message.error('加载投诉列表失败');
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, pageSize, dateRange, complaintType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setPage(1);
  };

  const renderDeadline = (deadline: string) => {
    const now = dayjs();
    const deadlineDate = dayjs(deadline);
    const diffHours = deadlineDate.diff(now, 'hour', true);

    if (diffHours < 0) {
      return <Text type="danger" strong>{deadlineDate.format('MM-DD HH:mm')} (已超期)</Text>;
    }
    if (diffHours < 2) {
      return <Text className="countdown-danger">{deadlineDate.format('MM-DD HH:mm')} ({Math.ceil(diffHours * 60)}分钟后截止)</Text>;
    }
    if (diffHours < 24) {
      return <Text type="warning">{deadlineDate.format('MM-DD HH:mm')} ({Math.ceil(diffHours)}小时后截止)</Text>;
    }
    return <Text type="secondary">{deadlineDate.format('MM-DD HH:mm')}</Text>;
  };

  const columns = [
    {
      title: '工单号',
      dataIndex: 'ticketNo',
      key: 'ticketNo',
      width: 150,
      render: (text: string) => <Text code>{text}</Text>,
    },
    {
      title: '企业名称',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 180,
    },
    {
      title: '投诉类型',
      dataIndex: 'complaintType',
      key: 'complaintType',
      width: 110,
      render: (type: string) => <Tag>{COMPLAINT_TYPE_LABELS[type] || type}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const cfg = STATUS_CONFIG[status] || { color: 'default', label: status };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: '截止时间',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 200,
      render: renderDeadline,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: Record<string, unknown>) => (
        <Button type="link" onClick={() => router.push(`/complaint/${record.id}`)}>
          处理
        </Button>
      ),
    },
  ];

  const tabItems = [
    { key: 'PENDING', label: '待处理' },
    { key: 'PROCESSING', label: '处理中' },
    { key: 'RESOLVED', label: '已完成' },
    { key: 'DISMISSED', label: '已驳回' },
  ];

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <div className="page-header">
        <h1>投诉工单</h1>
        <p>管理企业提交的投诉工单，需在24小时内处理</p>
      </div>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
          <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} />
          <Space wrap>
            <Select
              placeholder="投诉类型"
              allowClear
              style={{ width: 140 }}
              value={complaintType}
              onChange={(v) => { setComplaintType(v); setPage(1); }}
              options={Object.entries(COMPLAINT_TYPE_LABELS).map(([k, v]) => ({
                value: k,
                label: v,
              }))}
            />
            <RangePicker
              value={dateRange as [dayjs.Dayjs, dayjs.Dayjs] | null}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              placeholder={['开始日期', '结束日期']}
              allowClear
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={fetchData}>
              查询
            </Button>
          </Space>
        </Space>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
          onRow={(record) => ({
            onClick: () => router.push(`/complaint/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          scroll={{ x: 920 }}
        />
      </Card>
    </div>
  );
}