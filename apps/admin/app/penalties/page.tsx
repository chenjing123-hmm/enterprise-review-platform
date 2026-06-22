'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Tag, Select, Space, Button, message, Typography,
} from 'antd';
import { getPenalties } from '@/lib/api-client';
import dayjs from 'dayjs';

const { Text } = Typography;

const PENALTY_TYPE_LABELS: Record<string, string> = {
  WARNING: '警告',
  MUTE: '禁言',
  TEMP_BAN: '临时封禁',
  PERMANENT_BAN: '永久封禁',
};

const PENALTY_TYPE_COLORS: Record<string, string> = {
  WARNING: 'orange',
  MUTE: 'gold',
  TEMP_BAN: 'volcano',
  PERMANENT_BAN: 'red',
};

export default function PenaltiesPage() {
  const [data, setData] = useState<Array<Record<string, unknown>>>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [penaltyType, setPenaltyType] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPenalties({ penaltyType, status, page, pageSize });
      setData(res.list);
      setTotal(res.total);
    } catch {
      message.error('加载处罚台账失败');
    } finally {
      setLoading(false);
    }
  }, [penaltyType, status, page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = [
    {
      title: '用户',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
    },
    {
      title: '处罚类型',
      dataIndex: 'penaltyType',
      key: 'penaltyType',
      width: 120,
      render: (type: string) => (
        <Tag color={PENALTY_TYPE_COLORS[type] || 'default'}>
          {PENALTY_TYPE_LABELS[type] || type}
        </Tag>
      ),
    },
    {
      title: '原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      width: 300,
    },
    {
      title: '操作人',
      dataIndex: 'operatorName',
      key: 'operatorName',
      width: 120,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 170,
      render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 170,
      render: (t: string) => (t ? dayjs(t).format('YYYY-MM-DD HH:mm:ss') : '永久'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: string) => (
        <Tag color={s === 'ACTIVE' ? 'red' : 'default'}>
          {s === 'ACTIVE' ? '生效中' : '已结束'}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <div className="page-header">
        <h1>处罚台账</h1>
        <p>查看所有用户处罚记录，支持按类型和状态筛选</p>
      </div>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
          <Space>
            <Select
              placeholder="处罚类型"
              allowClear
              style={{ width: 140 }}
              value={penaltyType}
              onChange={(v) => { setPenaltyType(v); setPage(1); }}
              options={Object.entries(PENALTY_TYPE_LABELS).map(([k, v]) => ({
                value: k,
                label: v,
              }))}
            />
            <Select
              placeholder="状态"
              allowClear
              style={{ width: 120 }}
              value={status}
              onChange={(v) => { setStatus(v); setPage(1); }}
              options={[
                { value: 'ACTIVE', label: '生效中' },
                { value: 'EXPIRED', label: '已结束' },
              ]}
            />
          </Space>
          <Button type="primary" onClick={fetchData}>
            刷新
          </Button>
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
          scroll={{ x: 1100 }}
        />
      </Card>
    </div>
  );
}