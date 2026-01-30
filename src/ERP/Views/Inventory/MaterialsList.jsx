import React, { useState, useMemo } from 'react';
import { 
  Table, Button, Input, Card, Space, Tag, 
  Typography, Spin, Popconfirm, message, Badge, Tooltip 
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  DeleteOutlined, 
  ExperimentOutlined, 
  ReloadOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useMaterial from '@/Hooks/useMaterial';

const { Title, Text } = Typography;

const MaterialsList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // 1. Hook Integration (Using tenantId from storage or default to 1)
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { materialsQuery, deleteMaterialMutation } = useMaterial(user.tenantId || 1);
  const { data: materials, isLoading, isError, refetch, isFetching } = materialsQuery;

  // 2. Delete Logic
  const handleDelete = (id) => {
    deleteMaterialMutation.mutate(id, {
      onSuccess: () => {
        message.success('Material removed from inventory');
      },
      onError: (err) => message.error(err?.response?.data?.message || 'Delete failed')
    });
  };

  // 3. Filtered Data (Matching your MaterialDto fields)
  const filteredData = useMemo(() => {
    if (!materials) return [];
    return materials.filter(m => 
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.description || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [materials, search]);

  const columns = [
    {
      title: 'Material Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" className="text-[11px]">ID: #MAT-{record.id}</Text>
        </Space>
      )
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      render: (unit) => <Tag color="purple">{unit}</Tag>
    },
    {
      title: 'Stock Level',
      dataIndex: 'currentQuantity',
      key: 'currentQuantity',
      sorter: (a, b) => a.currentQuantity - b.currentQuantity,
      render: (qty, record) => {
        const isLow = qty <= (record.minQuantity || 10);
        return (
          <Badge 
            status={qty === 0 ? 'error' : isLow ? 'warning' : 'success'} 
            text={<Text strong={isLow}>{qty} {record.unit}</Text>} 
          />
        );
      }
    },
    {
      title: 'Min. Level',
      dataIndex: 'minQuantity',
      key: 'minQuantity',
      render: (min) => <Text type="secondary">{min}</Text>
    },
    {
      title: 'Cost/Unit',
      dataIndex: 'costPerUnit',
      key: 'costPerUnit',
      render: (cost) => cost ? `${cost.toLocaleString()} EGP` : '—'
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Delete material?"
            description="Removing this will affect recipes using it."
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true, loading: deleteMaterialMutation.isPending }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  if (isError) return (
    <Card className="m-6 bg-red-50 text-center">
      <Text danger>Failed to load materials inventory.</Text>
      <Button icon={<ReloadOutlined />} onClick={() => refetch()} className="ml-4">Retry</Button>
    </Card>
  );

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="m-0"><ExperimentOutlined /> Raw Materials</Title>
          <Text type="secondary">Track ingredients and supplies used in production</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()}>Refresh</Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            onClick={() => navigate('/inventory/materials/new')}
            className="shadow-md bg-purple-600 hover:bg-purple-700 border-none"
          >
            Add Material
          </Button>
        </Space>
      </div>

      {/* Stats Quick View (Updated with correct DTO fields) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card size="small" className="rounded-xl border-none shadow-sm">
          <Text type="secondary" className="text-xs uppercase font-bold">Total Materials</Text>
          <Title level={4} className="m-0">{materials?.length || 0}</Title>
        </Card>
        <Card size="small" className="rounded-xl border-none shadow-sm">
          <Text type="secondary" className="text-xs uppercase font-bold text-orange-500">Low Stock</Text>
          <Title level={4} className="m-0 text-orange-500">
            {materials?.filter(m => m.currentQuantity <= m.minQuantity).length || 0}
          </Title>
        </Card>
        <Card size="small" className="rounded-xl border-none shadow-sm">
          <Text type="secondary" className="text-xs uppercase font-bold text-red-500">Out of Stock</Text>
          <Title level={4} className="m-0 text-red-500">
            {materials?.filter(m => m.currentQuantity === 0).length || 0}
          </Title>
        </Card>
      </div>

      <Card className="shadow-sm border-none rounded-xl overflow-hidden">
        <Input 
          prefix={<SearchOutlined className="text-gray-400" />} 
          placeholder="Search materials..." 
          className="max-w-md h-10 rounded-lg mb-6"
          allowClear
          onChange={(e) => setSearch(e.target.value)}
        />

        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey="id" 
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default MaterialsList;