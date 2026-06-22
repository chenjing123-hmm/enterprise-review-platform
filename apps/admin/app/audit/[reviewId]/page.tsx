'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Card, Row, Col, Descriptions, Tag, Button, Space, Modal, Input, Timeline,
  Spin, message, Typography, Image, Table, Empty, Rate,
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, EditOutlined, ArrowLeftOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import { getAuditDetail, submitAudit } from '@/lib/api-client';
import dayjs from 'dayjs';

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

const RATING_LABELS: Record<string, string> = {
  overall: '综合评分',
  salary: '薪资福利',
  environment: '工作环境',
  growth: '发展前景',
  management: '管理风格',
  workLifeBalance: '工作生活平衡',
};

interface AuditDetailData {
  id: string;
  content: string;
  sensitiveWords: Array<{ word: string; start: number; end: number }>;
  rating: Record<string, number>;
  companyName: string;
  userNickname: string;
  isAnonymous: boolean;
  evidenceUrls: string[];
  ocrResults: string[];
  userHistory: Array<{ id: string; content: string; status: string; createdAt: string }>;
  auditHistory: Array<{ id: string; action: string; remark: string; auditorName: string; createdAt: string }>;
  status: string;
  createdAt: string;
}

function highlightSensitiveWords(content: string, words: Array<{ word: string; start: number; end: number }>) {
  if (!words || words.length === 0) return content;

  const sorted = [...words].sort((a, b) => a.start - b.start);
  const parts: React.ReactNode[] = [];
  let lastEnd = 0;

  sorted.forEach((sw, idx) => {
    if (sw.start > lastEnd) {
      parts.push(content.slice(lastEnd, sw.start));
    }
    parts.push(
      <span key={idx} className="sensitive-highlight">
        {content.slice(sw.start, sw.end)}
      </span>,
    );
    lastEnd = sw.end;
  });

  if (lastEnd < content.length) {
    parts.push(content.slice(lastEnd));
  }

  return parts;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  APPROVE: { label: '审核通过', color: 'green' },
  REJECT: { label: '审核驳回', color: 'red' },
  REQUEST_MODIFY: { label: '要求修改', color: 'orange' },
};

export default function AuditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reviewId = params.reviewId as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AuditDetailData | null>(null);
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    action: 'APPROVE' | 'REJECT' | 'REQUEST_MODIFY';
  }>({ open: false, action: 'APPROVE' });
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAuditDetail(reviewId)
      .then(setData)
      .catch(() => message.error('加载审核详情失败'))
      .finally(() => setLoading(false));
  }, [reviewId]);

  const handleSubmit = async () => {
    if (!reason && actionModal.action !== 'APPROVE') {
      message.warning('请输入审核理由');
      return;
    }
    setSubmitting(true);
    try {
      await submitAudit(reviewId, {
        action: actionModal.action,
        reason,
      });
      message.success('操作成功');
      setActionModal({ open: false, action: 'APPROVE' });
      setReason('');
      const updated = await getAuditDetail(reviewId);
      setData(updated);
    } catch {
      message.error('操作失败');
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

  const highlightedContent = highlightSensitiveWords(data.content, data.sensitiveWords);

  const userHistoryColumns = [
    { title: '评价内容', dataIndex: 'content', key: 'content', ellipsis: true, width: 300 },
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

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} type="text">
          返回审核队列
        </Button>
      </div>

      <div className="page-header">
        <h1>审核详情</h1>
        <Space>
          <Text type="secondary">评价ID: {data.id}</Text>
          <Tag color={data.status === 'PENDING' ? 'orange' : data.status === 'APPROVED' ? 'green' : 'red'}>
            {data.status === 'PENDING' ? '待审核' : data.status === 'APPROVED' ? '已通过' : '已驳回'}
          </Tag>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* 左侧：评价内容 */}
        <Col xs={24} lg={12}>
          <Card title="评价内容" style={{ height: '100%' }}>
            <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="公司">{data.companyName}</Descriptions.Item>
              <Descriptions.Item label="用户">
                {data.isAnonymous ? '匿名用户' : data.userNickname}
              </Descriptions.Item>
              <Descriptions.Item label="提交时间">
                {dayjs(data.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>

            {/* 评分 */}
            <Card size="small" style={{ marginBottom: 16, background: '#f8fafc' }}>
              <Row gutter={[8, 8]}>
                {Object.entries(data.rating).map(([key, value]) => (
                  <Col span={8} key={key}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {RATING_LABELS[key] || key}
                    </Text>
                    <br />
                    <Rate disabled value={value} style={{ fontSize: 14 }} />
                  </Col>
                ))}
              </Row>
            </Card>

            {/* 评价正文（敏感词高亮） */}
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
              {highlightedContent}
            </div>

            {data.sensitiveWords.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <Text type="danger">
                  <ExclamationCircleOutlined /> 检测到 {data.sensitiveWords.length} 个敏感词：
                </Text>
                {data.sensitiveWords.map((sw, i) => (
                  <Tag key={i} color="red" style={{ marginLeft: 4, marginTop: 4 }}>
                    {sw.word}
                  </Tag>
                ))}
              </div>
            )}
          </Card>
        </Col>

        {/* 右侧：证明材料 + OCR + 用户历史 */}
        <Col xs={24} lg={12}>
          {/* 证明材料 */}
          <Card title="证明材料" style={{ marginBottom: 16 }}>
            {data.evidenceUrls.length > 0 ? (
              <Image.PreviewGroup>
                <Row gutter={[8, 8]}>
                  {data.evidenceUrls.map((url, idx) => (
                    <Col span={8} key={idx}>
                      <Image
                        src={url}
                        alt={`证据 ${idx + 1}`}
                        style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 4 }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                      />
                    </Col>
                  ))}
                </Row>
              </Image.PreviewGroup>
            ) : (
              <Empty description="暂无证明材料" />
            )}
          </Card>

          {/* OCR 识别结果 */}
          <Card title="OCR 识别结果" style={{ marginBottom: 16 }}>
            {data.ocrResults && data.ocrResults.length > 0 ? (
              data.ocrResults.map((txt, idx) => (
                <Paragraph key={idx} style={{ background: '#f8fafc', padding: 8, borderRadius: 4, marginBottom: 8 }}>
                  {txt}
                </Paragraph>
              ))
            ) : (
              <Empty description="暂无 OCR 结果" />
            )}
          </Card>

          {/* 用户历史评价 */}
          <Card title="该用户历史评价">
            {data.userHistory && data.userHistory.length > 0 ? (
              <Table
                rowKey="id"
                columns={userHistoryColumns}
                dataSource={data.userHistory}
                size="small"
                pagination={false}
                scroll={{ x: 540 }}
              />
            ) : (
              <Empty description="暂无历史评价" />
            )}
          </Card>
        </Col>
      </Row>

      {/* 审核历史时间线 */}
      <Card title="审核历史" style={{ marginTop: 16 }}>
        {data.auditHistory && data.auditHistory.length > 0 ? (
          <Timeline
            items={data.auditHistory.map((item) => ({
              color: item.action === 'APPROVE' ? 'green' : item.action === 'REJECT' ? 'red' : 'orange',
              children: (
                <div>
                  <Space>
                    <Tag color={ACTION_LABELS[item.action]?.color || 'default'}>
                      {ACTION_LABELS[item.action]?.label || item.action}
                    </Tag>
                    <Text type="secondary">{item.auditorName}</Text>
                    <Text type="secondary">{dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
                  </Space>
                  {item.remark && <Paragraph style={{ marginTop: 4, color: '#6b7280' }}>{item.remark}</Paragraph>}
                </div>
              ),
            }))}
          />
        ) : (
          <Empty description="暂无审核记录" />
        )}
      </Card>

      {/* 底部操作按钮 */}
      {data.status === 'PENDING' && (
        <Card style={{ marginTop: 16, textAlign: 'center' }}>
          <Space size="middle">
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              style={{ background: '#10B981', borderColor: '#10B981' }}
              onClick={() => setActionModal({ open: true, action: 'APPROVE' })}
            >
              审核通过
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={() => setActionModal({ open: true, action: 'REQUEST_MODIFY' })}
            >
              要求修改
            </Button>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => setActionModal({ open: true, action: 'REJECT' })}
            >
              驳回
            </Button>
          </Space>
        </Card>
      )}

      {/* 操作弹窗 */}
      <Modal
        title={
          actionModal.action === 'APPROVE'
            ? '确认通过'
            : actionModal.action === 'REJECT'
              ? '确认驳回'
              : '要求修改'
        }
        open={actionModal.open}
        onOk={handleSubmit}
        onCancel={() => {
          setActionModal({ open: false, action: 'APPROVE' });
          setReason('');
        }}
        confirmLoading={submitting}
        okText={actionModal.action === 'APPROVE' ? '通过' : actionModal.action === 'REJECT' ? '驳回' : '发送修改要求'}
        okButtonProps={{
          danger: actionModal.action === 'REJECT',
        }}
      >
        {actionModal.action !== 'APPROVE' && (
          <div style={{ marginTop: 16 }}>
            <Text strong>审核理由</Text>
            <TextArea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                actionModal.action === 'REJECT'
                  ? '请输入驳回原因...'
                  : '请输入需要修改的内容...'
              }
              style={{ marginTop: 8 }}
            />
          </div>
        )}
        {actionModal.action === 'APPROVE' && (
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">确认通过该评价？通过后评价将立即公开展示。</Text>
            <TextArea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="审核备注（可选）"
              style={{ marginTop: 8 }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}