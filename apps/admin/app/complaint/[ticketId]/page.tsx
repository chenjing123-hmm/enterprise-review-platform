'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Card, Row, Col, Descriptions, Tag, Button, Space, Modal, Input,
  Spin, message, Typography, Image, Statistic, Divider,
} from 'antd';
import {
  ArrowLeftOutlined, DeleteOutlined, SafetyOutlined, StopOutlined,
} from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import { getComplaintDetail, handleComplaint } from '@/lib/api-client';
import dayjs from 'dayjs';

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

const COMPLAINT_TYPE_LABELS: Record<string, string> = {
  FALSE_INFO: '虚假信息',
  MALICIOUS_DEFAMATION: '恶意诋毁',
  PERSONAL_ATTACK: '人身攻击',
  PRIVACY_LEAK: '泄露隐私',
  SPAM: '广告骚扰',
  COPYRIGHT_INFRINGEMENT: '侵权内容',
  OTHER: '其他',
};

interface ComplaintDetailData {
  id: string;
  ticketNo: string;
  companyName: string;
  complaintType: string;
  reason: string;
  description: string;
  status: string;
  deadline: string;
  reviewContent: string;
  evidenceImages: string[];
  enterpriseMaterials: Array<{ name: string; url: string }>;
  createdAt: string;
}

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.ticketId as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ComplaintDetailData | null>(null);
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    action: 'REMOVE_REVIEW' | 'KEEP_REVIEW' | 'DISMISS';
  }>({ open: false, action: 'KEEP_REVIEW' });
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    setLoading(true);
    getComplaintDetail(ticketId)
      .then(setData)
      .catch(() => message.error('加载投诉详情失败'))
      .finally(() => setLoading(false));
  }, [ticketId]);

  useEffect(() => {
    if (!data?.deadline) return;
    const timer = setInterval(() => {
      const now = dayjs();
      const end = dayjs(data.deadline);
      const diff = end.diff(now, 'second');
      if (diff <= 0) {
        setRemaining('已超期');
        clearInterval(timer);
      } else {
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;
        setRemaining(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [data?.deadline]);

  const isUrgent = useMemo(() => {
    if (!data?.deadline) return false;
    return dayjs(data.deadline).diff(dayjs(), 'hour', true) < 2;
  }, [data?.deadline]);

  const handleSubmit = async () => {
    if (!note) {
      message.warning('请输入处理备注');
      return;
    }
    setSubmitting(true);
    try {
      await handleComplaint(ticketId, {
        action: actionModal.action,
        note,
      });
      message.success('处理成功');
      setActionModal({ open: false, action: 'KEEP_REVIEW' });
      setNote('');
      const updated = await getComplaintDetail(ticketId);
      setData(updated);
    } catch {
      message.error('处理失败');
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

  const canProcess = data.status === 'PENDING' || data.status === 'PROCESSING';

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} type="text">
          返回投诉列表
        </Button>
      </div>

      <Row gutter={[16, 16]} align="top">
        {/* 投诉信息 */}
        <Col xs={24} lg={14}>
          <Card title="投诉详情">
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="工单号">
                <Text code>{data.ticketNo}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="企业名称">{data.companyName}</Descriptions.Item>
              <Descriptions.Item label="投诉类型">
                <Tag color="blue">{COMPLAINT_TYPE_LABELS[data.complaintType] || data.complaintType}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="投诉原因">
                <Paragraph>{data.reason}</Paragraph>
              </Descriptions.Item>
              {data.description && (
                <Descriptions.Item label="补充说明">
                  <Paragraph>{data.description}</Paragraph>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="提交时间">
                {dayjs(data.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag
                  color={
                    data.status === 'PENDING' ? 'orange' :
                    data.status === 'PROCESSING' ? 'blue' :
                    data.status === 'RESOLVED' ? 'green' : 'default'
                  }
                >
                  {data.status === 'PENDING' ? '待处理' :
                   data.status === 'PROCESSING' ? '处理中' :
                   data.status === 'RESOLVED' ? '已完成' : '已驳回'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 被投诉评价内容 */}
          <Card title="被投诉评价内容" style={{ marginTop: 16 }}>
            <div
              style={{
                background: '#f9fafb',
                padding: 16,
                borderRadius: 6,
                lineHeight: 1.8,
                fontSize: 14,
                whiteSpace: 'pre-wrap',
              }}
            >
              {data.reviewContent}
            </div>
          </Card>

          {/* 企业上传材料 */}
          <Card title="企业上传材料" style={{ marginTop: 16 }}>
            {data.enterpriseMaterials && data.enterpriseMaterials.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                {data.enterpriseMaterials.map((mat, idx) => (
                  <Button
                    key={idx}
                    type="link"
                    onClick={() => window.open(mat.url, '_blank')}
                    style={{ padding: 0 }}
                  >
                    {mat.name}
                  </Button>
                ))}
              </Space>
            ) : (
              <Text type="secondary">暂无上传材料</Text>
            )}
          </Card>
        </Col>

        {/* 右侧：倒计时 + 证据 + 操作 */}
        <Col xs={24} lg={10}>
          {/* 24h 倒计时 */}
          <Card>
            <Statistic
              title="处理截止倒计时"
              value={remaining || '--'}
              valueStyle={{ color: isUrgent ? '#EF4444' : '#1A56DB', fontSize: 32, fontWeight: 700 }}
            />
            {isUrgent && remaining !== '已超期' && (
              <Text type="danger" strong style={{ display: 'block', marginTop: 8 }}>
                剩余时间不足2小时，请尽快处理！
              </Text>
            )}
            {remaining === '已超期' && (
              <Text type="danger" strong style={{ display: 'block', marginTop: 8 }}>
                已超过处理时限！
              </Text>
            )}
          </Card>

          {/* 投诉证据图片 */}
          <Card title="投诉证据图片" style={{ marginTop: 16 }}>
            {data.evidenceImages && data.evidenceImages.length > 0 ? (
              <Image.PreviewGroup>
                <Row gutter={[8, 8]}>
                  {data.evidenceImages.map((url, idx) => (
                    <Col span={12} key={idx}>
                      <Image
                        src={url}
                        alt={`证据 ${idx + 1}`}
                        style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 4 }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                      />
                    </Col>
                  ))}
                </Row>
              </Image.PreviewGroup>
            ) : (
              <Text type="secondary">暂无证据图片</Text>
            )}
          </Card>

          {/* 操作按钮 */}
          {canProcess && (
            <Card style={{ marginTop: 16 }}>
              <Title level={5} style={{ marginBottom: 16 }}>处理操作</Title>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  block
                  onClick={() => setActionModal({ open: true, action: 'REMOVE_REVIEW' })}
                >
                  下架评价
                </Button>
                <Button
                  type="primary"
                  icon={<SafetyOutlined />}
                  block
                  style={{ background: '#10B981', borderColor: '#10B981' }}
                  onClick={() => setActionModal({ open: true, action: 'KEEP_REVIEW' })}
                >
                  保留评价
                </Button>
                <Button
                  icon={<StopOutlined />}
                  block
                  onClick={() => setActionModal({ open: true, action: 'DISMISS' })}
                >
                  驳回投诉
                </Button>
              </Space>
            </Card>
          )}
        </Col>
      </Row>

      {/* 处理弹窗 */}
      <Modal
        title={
          actionModal.action === 'REMOVE_REVIEW'
            ? '下架评价'
            : actionModal.action === 'KEEP_REVIEW'
              ? '保留评价'
              : '驳回投诉'
        }
        open={actionModal.open}
        onOk={handleSubmit}
        onCancel={() => {
          setActionModal({ open: false, action: 'KEEP_REVIEW' });
          setNote('');
        }}
        confirmLoading={submitting}
        okText={
          actionModal.action === 'REMOVE_REVIEW'
            ? '确认下架'
            : actionModal.action === 'KEEP_REVIEW'
              ? '确认保留'
              : '确认驳回'
        }
        okButtonProps={{
          danger: actionModal.action === 'REMOVE_REVIEW',
        }}
      >
        <div style={{ marginTop: 16 }}>
          <Text strong>处理备注</Text>
          <TextArea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="请输入处理理由..."
            style={{ marginTop: 8 }}
          />
        </div>
      </Modal>
    </div>
  );
}