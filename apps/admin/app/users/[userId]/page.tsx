'use client';

import React, { useEffect, useState } from 'react';
import {
  Card, Row, Col, Descriptions, Tag, Table, Button, Space, Modal, Input,
  Spin, message, Typography, Select, InputNumber,
} from 'antd';
import {
  ArrowLeftOutlined, StopOutlined, SoundOutlined, LockOutlined, EyeOutlined,
} from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import { getUserDetail, banUser, getRealNameInfo } from '@/lib/api-client';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { TextArea } = Input;

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  ACTIVE: { color: 'green', label: '正常' },
  MUTED: { color: 'orange', label: '已禁言' },
  BANNED: { color: 'red', label: '已封禁' },
};

const PENALTY_TYPE_LABELS: Record<string, string> = {
  WARNING: '警告',
  MUTE: '禁言',
  TEMP_BAN: '临时封禁',
  PERMANENT_BAN: '永久封禁',
};

interface UserDetailData {
  id: string;
  nickname: string;
  phone: string;
  createdAt: string;
  registerIp: string;
  realName: string;
  idCardNumber: string;
  status: string;
  reviews: Array<{ id: string; content: string; companyName: string; createdAt: string; status: string }>;
  penalties: Array<{ id: string; penaltyType: string; reason: string; operatorName: string; startTime: string; endTime: string; status: string }>;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<UserDetailData | null>(null);
  const [penaltyModal, setPenaltyModal] = useState<{
    open: boolean;
    type: 'MUTE' | 'TEMP_BAN' | 'PERMANENT_BAN';
  }>({ open: false, type: 'MUTE' });
  const [penaltyReason, setPenaltyReason] = useState('');
  const [penaltyDuration, setPenaltyDuration] = useState<number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [realNameVisible, setRealNameVisible] = useState(false);
  const [realNameInfo, setRealNameInfo] = useState<{ realName: string; idCardNumber: string } | null>(null);
  const [realNameLoading, setRealNameLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getUserDetail(userId)
      .then(setData)
      .catch(() => message.error('加载用户详情失败'))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleViewRealName = async () => {
    setRealNameLoading(true);
    try {
      const info = await getRealNameInfo(userId);
      setRealNameInfo(info);
      setRealNameVisible(true);
    } catch {
      message.error('您没有权限查看实名信息');
    } finally {
      setRealNameLoading(false);
    }
  };

  const handlePenalty = async () => {
    if (!penaltyReason) {
      message.warning('请输入处罚原因');
      return;
    }
    if (penaltyModal.type === 'TEMP_BAN' && !penaltyDuration) {
      message.warning('请输入封禁天数');
      return;
    }
    setSubmitting(true);
    try {
      await banUser({
        userId,
        penaltyType: penaltyModal.type,
        reason: penaltyReason,
        duration: penaltyModal.type === 'TEMP_BAN' ? penaltyDuration : undefined,
      });
      message.success('处罚成功');
      setPenaltyModal({ open: false, type: 'MUTE' });
      setPenaltyReason('');
      setPenaltyDuration(undefined);
      const updated = await getUserDetail(userId);
      setData(updated);
    } catch {
      message.error('处罚失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!data) return null;

  const reviewColumns = [
    { title: '评价内容', dataIndex: 'content', key: 'content', ellipsis: true, width: 300 },
    { title: '公司', dataIndex: 'companyName', key: 'companyName', width: 160 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (s: string) => {
        const m: Record<string, { color: string; label: string }> = {
          PENDING: { color: 'orange', label: '待审' },
          APPROVED: { color: 'green', label: '通过' },
          REJECTED: { color: 'red', label: '驳回' },
        };
        const cfg = m[s] || { color: 'default', label: s };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm'),
    },
  ];

  const penaltyColumns = [
    {
      title: '处罚类型',
      dataIndex: 'penaltyType',
      key: 'penaltyType',
      width: 100,
      render: (t: string) => {
        const colors: Record<string, string> = { WARNING: 'orange', MUTE: 'gold', TEMP_BAN: 'volcano', PERMANENT_BAN: 'red' };
        return <Tag color={colors[t] || 'default'}>{PENALTY_TYPE_LABELS[t] || t}</Tag>;
      },
    },
    { title: '原因', dataIndex: 'reason', key: 'reason', ellipsis: true, width: 200 },
    { title: '操作人', dataIndex: 'operatorName', key: 'operatorName', width: 100 },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 160,
      render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 160,
      render: (t: string) => (t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '永久'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (s: string) => (
        <Tag color={s === 'ACTIVE' ? 'red' : 'default'}>{s === 'ACTIVE' ? '生效中' : '已结束'}</Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} type="text">
          返回用户列表
        </Button>
      </div>

      <div className="page-header">
        <h1>用户详情</h1>
        <Space>
          <Text type="secondary">用户ID: {data.id}</Text>
          <Tag color={STATUS_CONFIG[data.status]?.color}>{STATUS_CONFIG[data.status]?.label}</Tag>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="基本信息">
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="昵称">{data.nickname || '-'}</Descriptions.Item>
              <Descriptions.Item label="手机号">
                <Text code>{data.phone}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">
                {dayjs(data.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="注册IP">
                <Text code>{data.registerIp}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="实名信息">
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="真实姓名">
                <Text code>{data.realName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="身份证号">
                <Text code>{data.idCardNumber}</Text>
              </Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 12 }}>
              <Button
                icon={<EyeOutlined />}
                onClick={handleViewRealName}
                loading={realNameLoading}
              >
                查看实名信息
              </Button>
            </div>
          </Card>

          {/* 处罚操作 */}
          <Card title="处罚操作" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button
                icon={<SoundOutlined />}
                block
                onClick={() => setPenaltyModal({ open: true, type: 'MUTE' })}
                disabled={data.status === 'BANNED'}
              >
                禁言
              </Button>
              <Button
                icon={<StopOutlined />}
                block
                onClick={() => setPenaltyModal({ open: true, type: 'TEMP_BAN' })}
                disabled={data.status === 'BANNED'}
              >
                临时封禁
              </Button>
              <Button
                danger
                icon={<LockOutlined />}
                block
                onClick={() => setPenaltyModal({ open: true, type: 'PERMANENT_BAN' })}
                disabled={data.status === 'BANNED'}
              >
                永久封禁
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 评价列表 */}
      <Card title="评价列表" style={{ marginTop: 16 }}>
        <Table
          rowKey="id"
          columns={reviewColumns}
          dataSource={data.reviews}
          size="small"
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          scroll={{ x: 700 }}
        />
      </Card>

      {/* 处罚台账 */}
      <Card title="处罚台账" style={{ marginTop: 16 }}>
        <Table
          rowKey="id"
          columns={penaltyColumns}
          dataSource={data.penalties}
          size="small"
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          scroll={{ x: 880 }}
        />
      </Card>

      {/* 实名信息弹窗 */}
      <Modal
        title="实名信息"
        open={realNameVisible}
        onCancel={() => setRealNameVisible(false)}
        footer={null}
      >
        {realNameInfo && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="真实姓名">{realNameInfo.realName}</Descriptions.Item>
            <Descriptions.Item label="身份证号">{realNameInfo.idCardNumber}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 处罚弹窗 */}
      <Modal
        title={
          penaltyModal.type === 'MUTE'
            ? '禁言'
            : penaltyModal.type === 'TEMP_BAN'
              ? '临时封禁'
              : '永久封禁'
        }
        open={penaltyModal.open}
        onOk={handlePenalty}
        onCancel={() => {
          setPenaltyModal({ open: false, type: 'MUTE' });
          setPenaltyReason('');
          setPenaltyDuration(undefined);
        }}
        confirmLoading={submitting}
        okText="确认"
        okButtonProps={{ danger: penaltyModal.type === 'PERMANENT_BAN' }}
      >
        <div style={{ marginTop: 16 }}>
          <Text strong>处罚原因</Text>
          <TextArea
            rows={4}
            value={penaltyReason}
            onChange={(e) => setPenaltyReason(e.target.value)}
            placeholder="请输入处罚原因..."
            style={{ marginTop: 8, marginBottom: 16 }}
          />
          {penaltyModal.type === 'TEMP_BAN' && (
            <>
              <Text strong>封禁天数</Text>
              <br />
              <InputNumber
                min={1}
                max={365}
                value={penaltyDuration}
                onChange={(v) => setPenaltyDuration(v || undefined)}
                placeholder="请输入封禁天数（1-365）"
                style={{ width: '100%', marginTop: 8 }}
              />
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}