'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Tabs, Tag, Input, DatePicker, Button, Space, message, Typography, Tooltip,
} from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { getAuditList } from '@/lib/api-client';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'orange', label: '待审核' },
  APPROVED: { color: 'green', label: '已通过' },
  REJECTED: { color: 'red', label: '已驳回' },
};

export default function AuditQueuePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('PENDING');
  const [data, setData] = useState<Array<Record<string, unknown>>>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAuditList({
        status: activeTab,
        page,
        pageSize,
        startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
      });
      setData(res.list);
      setTotal(res.total);
    } catch {
      message.error('加载审核列表失败');
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, pageSize, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setPage(1);
  };

  const columns = [
    {
      title: '评价内容',
      dataIndex: 'content',
      key: 'content',
      width: 300,
      render: (text: string) => (
        <Tooltip title={text}>
          <Text ellipsis style={{ maxWidth: 280 }}>
            {text}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: '公司',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 160,
    },
    {
      title: '用户',
      dataIndex: 'userNickname',
      key: 'userNickname',
      width: 120,
      render: (text: string, record: Record<string, unknown>) =>
        record.isAnonymous ? '匿名用户' : text,
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 170,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const config = STATUS_MAP[status] || { color: 'default', label: status };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: Record<string, unknown>) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => router.push(`/audit/${record.id}`)}
        >
          查看
        </Button>
      ),
    },
  ];

  const tabItems = [
    { key: 'PENDING', label: '待审核' },
    { key: 'APPROVED', label: '已通过' },
    { key: 'REJECTED', label: '已驳回' },
  ];

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <div className="page-header">
        <h1>审核队列</h1>
        <p>管理所有用户评价的审核工作</p>
      </div>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
          <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} />
          <Space>
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
            onClick: () => router.push(`/audit/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          scroll={{ x: 950 }}
        />
      </Card>
    </div>
  );
}