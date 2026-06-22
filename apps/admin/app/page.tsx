'use client';

import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Spin, Typography, Space } from 'antd';
import {
  AuditOutlined,
  FileProtectOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useRouter } from 'next/navigation';
import { getDashboardStats } from '@/lib/api-client';

const { Title, Text } = Typography;

interface DashboardData {
  todayAudit: { pending: number; approved: number; rejected: number };
  complaints: { pending: number; processing: number; resolved: number };
  riskAlerts: { unprocessed: number };
  reviewTrend: Array<{ date: string; count: number }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!data) return null;

  const chartOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151', fontSize: 13 },
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: data.reviewTrend.map((item) => item.date),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280', fontSize: 12 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
      axisLabel: { color: '#6b7280', fontSize: 12 },
    },
    series: [
      {
        data: data.reviewTrend.map((item) => item.count),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#1A56DB', width: 2.5 },
        itemStyle: {
          color: '#1A56DB',
          borderColor: '#fff',
          borderWidth: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(26, 86, 219, 0.15)' },
              { offset: 1, color: 'rgba(26, 86, 219, 0.01)' },
            ],
          },
        },
      },
    ],
  };

  const quickLinks = [
    { label: '审核队列', icon: <AuditOutlined />, path: '/audit' },
    { label: '投诉工单', icon: <FileProtectOutlined />, path: '/complaint' },
    { label: '风控告警', icon: <AlertOutlined />, path: '/risk' },
  ];

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <div className="page-header">
        <h1>仪表盘</h1>
        <p>欢迎回来，以下是今日平台运营概览</p>
      </div>

      {/* 快捷入口 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {quickLinks.map((link) => (
          <Col key={link.path} xs={24} sm={8}>
            <Card
              hoverable
              className="stat-card"
              onClick={() => router.push(link.path)}
              style={{ cursor: 'pointer' }}
            >
              <Space>
                <span style={{ fontSize: 20, color: '#1A56DB' }}>{link.icon}</span>
                <Text strong>{link.label}</Text>
                <ArrowRightOutlined style={{ color: '#9ca3af', marginLeft: 'auto' }} />
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card className="stat-card" title="今日审核" extra={<ClockCircleOutlined style={{ color: '#1A56DB' }} />}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="待审" value={data.todayAudit.pending} valueStyle={{ color: '#F59E0B', fontSize: 28 }} />
              </Col>
              <Col span={8}>
                <Statistic title="通过" value={data.todayAudit.approved} valueStyle={{ color: '#10B981', fontSize: 28 }} prefix={<CheckCircleOutlined />} />
              </Col>
              <Col span={8}>
                <Statistic title="驳回" value={data.todayAudit.rejected} valueStyle={{ color: '#EF4444', fontSize: 28 }} prefix={<CloseCircleOutlined />} />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="stat-card" title="投诉工单" extra={<FileProtectOutlined style={{ color: '#1A56DB' }} />}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="待处理" value={data.complaints.pending} valueStyle={{ color: '#F59E0B', fontSize: 28 }} />
              </Col>
              <Col span={8}>
                <Statistic title="处理中" value={data.complaints.processing} valueStyle={{ color: '#1A56DB', fontSize: 28 }} />
              </Col>
              <Col span={8}>
                <Statistic title="已完成" value={data.complaints.resolved} valueStyle={{ color: '#10B981', fontSize: 28 }} />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="stat-card" title="风控告警" extra={<AlertOutlined style={{ color: '#EF4444' }} />}>
            <Statistic
              title="未处理告警"
              value={data.riskAlerts.unprocessed}
              valueStyle={{ color: data.riskAlerts.unprocessed > 0 ? '#EF4444' : '#10B981', fontSize: 36 }}
            />
            {data.riskAlerts.unprocessed > 0 && (
              <Text type="danger" style={{ fontSize: 13 }}>
                需要立即处理
              </Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* 近7日趋势 */}
      <Card className="stat-card" title="近7日评价趋势">
        <ReactECharts option={chartOption} style={{ height: 320 }} />
      </Card>
    </div>
  );
}