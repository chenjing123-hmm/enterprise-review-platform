'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Input, Button, Space, Tag, message, Typography, Modal,
} from 'antd';
import { SearchOutlined, EyeOutlined, StopOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { getUserList, banUser } from '@/lib/api-client';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Search } = Input;

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  ACTIVE: { color: 'green', label: '正常' },
  MUTED: { color: 'orange', label: '已禁言' },
  BANNED: { color: 'red', label: '已封禁' },
};

export default function UsersPage() {
  const router = useRouter();
  const [data, setData] = useState<Array<Record<string, unknown>>>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [banModal, setBanModal] = useState<{ open: boolean; userId: string }>({
    open: false,
    userId: '',
  });
  const [banReason, setBanReason] = useState('');
  const [banning, setBanning] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUserList({ keyword: keyword || undefined, page, pageSize });
      setData(res.list);
      setTotal(res.total);
    } catch {
      message.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  }, [keyword, page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (value: string) => {
    setKeyword(value);
    setPage(1);
  };

  const handleBan = async () => {
    if (!banReason) {
      message.warning('请输入封禁原因');
      return;
    }
    setBanning(true);
    try {
      await banUser({
        userId: banModal.userId,
        penaltyType: 'PERMANENT_BAN',
        reason: banReason,
      });
      message.success('封禁成功');
      setBanModal({ open: false, userId: '' });
      setBanReason('');
      fetchData();
    } catch {
      message.error('封禁失败');
    } finally {
      setBanning(false);
    }
  };

  const columns = [
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (text: string) => <Text code>{text}</Text>,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 150,
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '注册IP',
      dataIndex: 'registerIp',
      key: 'registerIp',
      width: 140,
      render: (text: string) => <Text code>{text}</Text>,
    },
    {
      title: '发帖数',
      dataIndex: 'reviewCount',
      key: 'reviewCount',
      width: 80,
      align: 'center' as const,
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
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: Record<string, unknown>) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/users/${record.id}`);
            }}
          >
            查看详情
          </Button>
          {record.status === 'ACTIVE' && (
            <Button
              type="link"
              danger
              icon={<StopOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                setBanModal({ open: true, userId: record.id as string });
              }}
            >
              封禁
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <div className="page-header">
        <h1>用户管理</h1>
        <p>管理平台注册用户，支持搜索和封禁操作</p>
      </div>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Search
            placeholder="搜索手机号或昵称"
            allowClear
            onSearch={handleSearch}
            style={{ width: 320 }}
            prefix={<SearchOutlined />}
          />
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
          onRow={(record) => ({
            onClick: () => router.push(`/users/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          scroll={{ x: 970 }}
        />
      </Card>

      <Modal
        title="封禁用户"
        open={banModal.open}
        onOk={handleBan}
        onCancel={() => {
          setBanModal({ open: false, userId: '' });
          setBanReason('');
        }}
        confirmLoading={banning}
        okText="确认封禁"
        okButtonProps={{ danger: true }}
      >
        <div style={{ marginTop: 16 }}>
          <Text strong>封禁原因</Text>
          <Input.TextArea
            rows={4}
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder="请输入封禁原因..."
            style={{ marginTop: 8 }}
          />
        </div>
      </Modal>
    </div>
  );
}