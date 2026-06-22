'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, Row, Col, Form, DatePicker, Input, Button, Table, Tag, Upload,
  Space, message, Typography, Descriptions, Divider,
} from 'antd';
import { UploadOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { requestExport, getExportHistory, downloadExport } from '@/lib/api-client';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Text, Title } = Typography;

const EXPORT_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'orange', label: '待审批' },
  APPROVED: { color: 'green', label: '已批准' },
  REJECTED: { color: 'red', label: '已驳回' },
  EXPIRED: { color: 'default', label: '已过期' },
  REVOKED: { color: 'default', label: '已撤销' },
};

export default function ExportPage() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [historyData, setHistoryData] = useState<Array<Record<string, unknown>>>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(20);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await getExportHistory({ page: historyPage, pageSize: historyPageSize });
      setHistoryData(res.list);
      setHistoryTotal(res.total);
    } catch {
      message.error('加载导出历史失败');
    } finally {
      setHistoryLoading(false);
    }
  }, [historyPage, historyPageSize]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!values.courtCaseNo) {
      message.warning('请输入法院文书编号');
      return;
    }
    if (!values.reason) {
      message.warning('请输入导出原因');
      return;
    }
    setSubmitting(true);
    try {
      const dateRange = values.dateRange as [dayjs.Dayjs, dayjs.Dayjs];
      await requestExport({
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        userId: values.userId as string,
        companyName: values.companyName as string,
        courtCaseNo: values.courtCaseNo as string,
        reason: values.reason as string,
        courtOrderUrl: values.courtOrderUrl as string || '',
      });
      message.success('导出申请已提交，等待超级管理员审批');
      form.resetFields();
      fetchHistory();
    } catch {
      message.error('提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const res = await downloadExport(id);
      window.open(res.url, '_blank');
      message.success('开始下载');
    } catch {
      message.error('下载失败');
    }
  };

  const historyColumns = [
    {
      title: '法院文书编号',
      dataIndex: 'courtCaseNo',
      key: 'courtCaseNo',
      width: 180,
      render: (text: string) => <Text code>{text}</Text>,
    },
    {
      title: '导出原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      width: 250,
    },
    {
      title: '申请时间',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      width: 170,
      render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '审批时间',
      dataIndex: 'approvedAt',
      key: 'approvedAt',
      width: 170,
      render: (t: string) => (t ? dayjs(t).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '有效期至',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      width: 170,
      render: (t: string) => {
        if (!t) return '-';
        const expired = dayjs().isAfter(dayjs(t));
        return (
          <Text type={expired ? 'danger' : 'secondary'}>
            {dayjs(t).format('YYYY-MM-DD HH:mm:ss')}
            {expired ? ' (已过期)' : ''}
          </Text>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const cfg = EXPORT_STATUS_CONFIG[status] || { color: 'default', label: status };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: Record<string, unknown>) => {
        if (record.status === 'APPROVED' && record.downloadUrl) {
          const expired = record.expiresAt ? dayjs().isAfter(dayjs(record.expiresAt as string)) : false;
          return expired ? (
            <Text type="secondary">已过期</Text>
          ) : (
            <Button
              type="link"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record.id as string)}
            >
              下载
            </Button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <div className="page-header">
        <h1>司法导出</h1>
        <p>配合司法机关进行数据导出，需上传法院调令并经过审批</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="导出申请" extra={<FileTextOutlined />}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                label="查询时间范围"
                name="dateRange"
                rules={[{ required: true, message: '请选择时间范围' }]}
              >
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item label="按用户ID筛选" name="userId">
                <Input placeholder="可选，输入用户ID" />
              </Form.Item>

              <Form.Item label="按企业名称筛选" name="companyName">
                <Input placeholder="可选，输入企业名称" />
              </Form.Item>

              <Form.Item
                label="法院文书编号"
                name="courtCaseNo"
                rules={[{ required: true, message: '请输入法院文书编号' }]}
              >
                <Input placeholder="例如：(2024)京0105民初12345号" />
              </Form.Item>

              <Form.Item
                label="导出原因"
                name="reason"
                rules={[{ required: true, message: '请输入导出原因' }]}
              >
                <TextArea rows={3} placeholder="请详细说明导出原因..." />
              </Form.Item>

              <Form.Item
                label="上传法院调令"
                name="courtOrderUrl"
                rules={[{ required: true, message: '请上传法院调令' }]}
              >
                <Upload
                  maxCount={1}
                  beforeUpload={() => false}
                  accept=".pdf,.jpg,.jpeg,.png"
                >
                  <Button icon={<UploadOutlined />}>上传法院调令文件</Button>
                </Upload>
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                block
                size="large"
              >
                提交导出申请
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="CEK 审批流程说明" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="1. 提交申请">
                上传法院调令，填写导出条件
              </Descriptions.Item>
              <Descriptions.Item label="2. 超级管理员审批">
                由 SUPER_ADMIN 审核法院调令真实性
              </Descriptions.Item>
              <Descriptions.Item label="3. 临时解密密钥">
                审批通过后生成临时解密密钥，有效期2小时
              </Descriptions.Item>
              <Descriptions.Item label="4. 下载数据">
                在有效期内下载加密数据包
              </Descriptions.Item>
              <Descriptions.Item label="5. 自动撤销">
                2小时后密钥自动失效，数据不可再次下载
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card title="导出历史">
        <Table
          rowKey="id"
          columns={historyColumns}
          dataSource={historyData}
          loading={historyLoading}
          pagination={{
            current: historyPage,
            pageSize: historyPageSize,
            total: historyTotal,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => {
              setHistoryPage(p);
              setHistoryPageSize(ps);
            },
          }}
          scroll={{ x: 1140 }}
        />
      </Card>
    </div>
  );
}