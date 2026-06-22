'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Tag, Select, Space, Button, message, Typography, Modal, Popconfirm,
} from 'antd';
import { CheckCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { getRiskAlerts, handleRiskAlert } from '@/lib/api-client';
import dayjs from 'dayjs';

const { Text } = Typography;

const ALERT_TYPE_LABELS: Record<string, string> = {
  BATCH_NEGATIVE: '批量差评',
  BATCH_EXPORT: '批量导出',
  PAID_DELETION: '疑似有偿删帖',
  ABNORMAL_IP: '异常IP',
};

const SEVERITY_CONFIG: Record<string, { color: string; label: string }> = {
  LOW: { color: 'blue', label: '低' },
  MEDIUM: { color: 'orange', label: '中' },
  HIGH: { color: 'volcano', label: '高' },
  CRITICAL: { color: 'red', label: '严重' },
};

export default function RiskPage() {
  const [data, setData] = useState<Array<Record<string, unknown>>>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [alertType, setAlertType] = useState<string | undefined>(undefined);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRiskAlerts({ type: alertType, page, pageSize });
      setData(res.list);
      setTotal(res.total);
    } catch {
      message.error('加载风控告警失败');
    } finally {
      setLoading(false);
    }
  }, [alertType, page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAlert = async (id: string, action: 'PROCESSED' | 'IGNORED') => {
    try {
      await handleRiskAlert(id, action);
      message.success(action === 'PROCESSED' ? '已标记处理' : '已忽略');
      fetchData();
    } catch {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '告警类型',
      dataIndex: 'alertType',
      key: 'alertType',
      width: 140,
      render: (type: string) => (
        <Tag color="volcano">{ALERT_TYPE_LABELS[type] || type}</Tag>
      ),
    },
    {
      title: '严重等级',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (sev: string) => {
        const cfg = SEVERITY_CONFIG[sev] || { color: 'default', label: sev };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: '详情',
      dataIndex: 'detail',
      key: 'detail',
      ellipsis: true,
      render: (text: string) => (
        <Text ellipsis style={{ maxWidth: 400 }}>{text}</Text>
      ),
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'UNPROCESSED' ? 'red' : status === 'PROCESSED' ? 'green' : 'default'}>
          {status === 'UNPROCESSED' ? '未处理' : status === 'PROCESSED' ? '已处理' : '已忽略'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: Record<string, unknown>) => {
        if (record.status !== 'UNPROCESSED') return null;
        return (
          <Space>
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              style={{ color: '#10B981' }}
              onClick={() => handleAlert(record.id as string, 'PROCESSED')}
            >
              标记处理
            </Button>
            <Button
              type="link"
              icon={<MinusCircleOutlined />}
              danger
              onClick={() => handleAlert(record.id as string, 'IGNORED')}
            >
              忽略
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <div className="page-header">
        <h1>风控告警</h1>
        <p>监控平台异常行为，及时发现和处理风险</p>
      </div>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Select
              placeholder="告警类型"
              allowClear
              style={{ width: 160 }}
              value={alertType}
              onChange={(v) => { setAlertType(v); setPage(1); }}
              options={Object.entries(ALERT_TYPE_LABELS).map(([k, v]) => ({
                value: k,
                label: v,
              }))}
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
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
}