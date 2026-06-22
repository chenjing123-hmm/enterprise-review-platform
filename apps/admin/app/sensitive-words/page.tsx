'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Tag, Button, Modal, Input, Select, Space, message, Typography, Upload,
} from 'antd';
import { PlusOutlined, UploadOutlined, ExperimentOutlined } from '@ant-design/icons';
import {
  getSensitiveWords, addSensitiveWord, batchImportSensitiveWords, testSensitiveWords, updateSensitiveWordStatus,
} from '@/lib/api-client';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const CATEGORY_LABELS: Record<string, string> = {
  POLITICAL: '政治敏感',
  PORNOGRAPHIC: '色情低俗',
  VIOLENCE: '暴力恐怖',
  ADVERTISEMENT: '广告骚扰',
  ILLEGAL: '违法信息',
  HATE_SPEECH: '辱骂歧视',
  OTHER: '其他违规',
};

const SEVERITY_LABELS: Record<string, { label: string; color: string }> = {
  LOW: { label: '轻微', color: 'default' },
  MEDIUM: { label: '中等', color: 'orange' },
  HIGH: { label: '严重', color: 'volcano' },
  CRITICAL: { label: '极严重', color: 'red' },
};

export default function SensitiveWordsPage() {
  const [data, setData] = useState<Array<Record<string, unknown>>>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [category, setCategory] = useState<string | undefined>(undefined);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newCategory, setNewCategory] = useState('OTHER');
  const [newSeverity, setNewSeverity] = useState('MEDIUM');
  const [adding, setAdding] = useState(false);

  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [importing, setImporting] = useState(false);

  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testText, setTestText] = useState('');
  const [testResults, setTestResults] = useState<Array<{ word: string; category: string }>>([]);
  const [testing, setTesting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSensitiveWords({ category, page, pageSize });
      setData(res.list);
      setTotal(res.total);
    } catch {
      message.error('加载敏感词列表失败');
    } finally {
      setLoading(false);
    }
  }, [category, page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async () => {
    if (!newWord.trim()) {
      message.warning('请输入敏感词');
      return;
    }
    setAdding(true);
    try {
      await addSensitiveWord({ word: newWord.trim(), category: newCategory, severity: newSeverity });
      message.success('添加成功');
      setAddModalOpen(false);
      setNewWord('');
      setNewCategory('OTHER');
      setNewSeverity('MEDIUM');
      fetchData();
    } catch {
      message.error('添加失败');
    } finally {
      setAdding(false);
    }
  };

  const handleBatchImport = async () => {
    const words = batchText
      .split('\n')
      .map((w) => w.trim())
      .filter(Boolean);
    if (words.length === 0) {
      message.warning('请输入至少一个敏感词');
      return;
    }
    setImporting(true);
    try {
      await batchImportSensitiveWords(words);
      message.success(`成功导入 ${words.length} 个敏感词`);
      setBatchModalOpen(false);
      setBatchText('');
      fetchData();
    } catch {
      message.error('批量导入失败');
    } finally {
      setImporting(false);
    }
  };

  const handleTest = async () => {
    if (!testText.trim()) {
      message.warning('请输入测试文本');
      return;
    }
    setTesting(true);
    try {
      const res = await testSensitiveWords(testText);
      setTestResults(res.hits);
    } catch {
      message.error('检测失败');
    } finally {
      setTesting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ENABLED' ? 'DISABLED' : 'ENABLED';
    try {
      await updateSensitiveWordStatus(id, newStatus);
      message.success(newStatus === 'ENABLED' ? '已启用' : '已禁用');
      fetchData();
    } catch {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '敏感词',
      dataIndex: 'word',
      key: 'word',
      width: 200,
      render: (text: string) => <Text strong style={{ color: '#dc2626' }}>{text}</Text>,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (cat: string) => <Tag>{CATEGORY_LABELS[cat] || cat}</Tag>,
    },
    {
      title: '严重等级',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (sev: string) => {
        const cfg = SEVERITY_LABELS[sev] || { label: sev, color: 'default' };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'ENABLED' ? 'green' : 'default'}>
          {status === 'ENABLED' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: Record<string, unknown>) => (
        <Button
          type="link"
          onClick={() => handleToggleStatus(record.id as string, record.status as string)}
        >
          {record.status === 'ENABLED' ? '禁用' : '启用'}
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <div className="page-header">
        <h1>敏感词管理</h1>
        <p>管理平台敏感词库，支持添加、批量导入和测试</p>
      </div>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
          <Space>
            <Select
              placeholder="分类筛选"
              allowClear
              style={{ width: 140 }}
              value={category}
              onChange={(v) => { setCategory(v); setPage(1); }}
              options={Object.entries(CATEGORY_LABELS).map(([k, v]) => ({
                value: k,
                label: v,
              }))}
            />
          </Space>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddModalOpen(true)}
            >
              添加敏感词
            </Button>
            <Button
              icon={<UploadOutlined />}
              onClick={() => setBatchModalOpen(true)}
            >
              批量导入
            </Button>
            <Button
              icon={<ExperimentOutlined />}
              onClick={() => setTestModalOpen(true)}
            >
              测试工具
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
          scroll={{ x: 600 }}
        />
      </Card>

      {/* 添加敏感词弹窗 */}
      <Modal
        title="添加敏感词"
        open={addModalOpen}
        onOk={handleAdd}
        onCancel={() => { setAddModalOpen(false); setNewWord(''); }}
        confirmLoading={adding}
        okText="添加"
      >
        <div style={{ marginTop: 16 }}>
          <Text strong>敏感词</Text>
          <Input
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="请输入敏感词"
            style={{ marginTop: 8, marginBottom: 16 }}
          />
          <Text strong>分类</Text>
          <Select
            value={newCategory}
            onChange={setNewCategory}
            style={{ width: '100%', marginTop: 8, marginBottom: 16 }}
            options={Object.entries(CATEGORY_LABELS).map(([k, v]) => ({ value: k, label: v }))}
          />
          <Text strong>严重等级</Text>
          <Select
            value={newSeverity}
            onChange={setNewSeverity}
            style={{ width: '100%', marginTop: 8 }}
            options={Object.entries(SEVERITY_LABELS).map(([k, v]) => ({
              value: k,
              label: v.label,
            }))}
          />
        </div>
      </Modal>

      {/* 批量导入弹窗 */}
      <Modal
        title="批量导入敏感词"
        open={batchModalOpen}
        onOk={handleBatchImport}
        onCancel={() => { setBatchModalOpen(false); setBatchText(''); }}
        confirmLoading={importing}
        okText="导入"
      >
        <div style={{ marginTop: 16 }}>
          <Text strong>每行一个敏感词，或上传文件</Text>
          <TextArea
            rows={10}
            value={batchText}
            onChange={(e) => setBatchText(e.target.value)}
            placeholder="每行输入一个敏感词..."
            style={{ marginTop: 8 }}
          />
        </div>
      </Modal>

      {/* 测试工具弹窗 */}
      <Modal
        title="敏感词测试工具"
        open={testModalOpen}
        onCancel={() => { setTestModalOpen(false); setTestText(''); setTestResults([]); }}
        footer={null}
        width={600}
      >
        <div style={{ marginTop: 16 }}>
          <Text strong>输入测试文本</Text>
          <TextArea
            rows={5}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="请输入要检测的文本内容..."
            style={{ marginTop: 8, marginBottom: 16 }}
          />
          <Button
            type="primary"
            icon={<ExperimentOutlined />}
            onClick={handleTest}
            loading={testing}
            block
          >
            开始检测
          </Button>

          {testResults.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Text strong>检测结果：命中 {testResults.length} 个敏感词</Text>
              <div style={{ marginTop: 8 }}>
                {testResults.map((r, i) => (
                  <Tag key={i} color="red" style={{ marginBottom: 4 }}>
                    {r.word} ({CATEGORY_LABELS[r.category] || r.category})
                  </Tag>
                ))}
              </div>
            </div>
          )}
          {testResults.length === 0 && testText && !testing && (
            <div style={{ marginTop: 16 }}>
              <Text type="success">未命中任何敏感词</Text>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}