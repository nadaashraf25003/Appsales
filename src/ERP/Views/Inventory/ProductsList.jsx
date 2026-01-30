import React, { useState, useMemo } from 'react';
import { Table, Button, Input, Card, Space, Tag, Typography, Spin, Popconfirm, message, Badge, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ShoppingOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useItem from '@/Hooks/useItem';

const { Title, Text } = Typography;

const ProductsList = () => {
  const navigate = useNavigate();
  
  // 1. Dynamic Tenant ID (Fallback to 1 if not found)
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const tenantId = user.tenantId || 1; 

  const [search, setSearch] = useState('');

  // 2. Hook Integration 
  const { getItemsQuery, deleteItemMutation } = useItem();
  const { data: products, isLoading, isError, refetch, isFetching } = getItemsQuery(tenantId);

  // 3. Delete Action 
  const handleDelete = (id) => {
    deleteItemMutation.mutate(id, {
      onSuccess: () => {
        message.success('Product deleted successfully');
        // No need for manual refetch() if useItem.ts uses queryClient.invalidateQueries
      },
      onError: (err) => message.error(err?.response?.data?.message || 'Delete failed')
    });
  };

  // 4. Optimized Filtering Logic
  const filteredData = useMemo(() => {
    if (!products) return [];
    const query = search.toLowerCase();
    return products.filter((item) =>
      item.name.toLowerCase().includes(query) ||
      (item.sku || '').toLowerCase().includes(query)
    );
  }, [products, search]);

  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" className="text-xs">{record.sku || 'No SKU'}</Text>
        </Space>
      ),
    },
    { 
      title: 'Price', 
      dataIndex: 'sellingPrice', 
      sorter: (a, b) => a.sellingPrice - b.sellingPrice,
      render: (price) => <Text className="text-blue-600 font-medium">{price.toLocaleString()} EGP</Text> 
    },
    { 
      title: 'Stock', 
      dataIndex: 'currentStock', 
      sorter: (a, b) => a.currentStock - b.currentStock,
      render: (stock, record) => {
        const isLow = stock <= (record.minStockLevel || 5);
        return (
          <Badge 
            status={stock === 0 ? 'error' : isLow ? 'warning' : 'success'} 
            text={<Text strong={isLow}>{stock} units</Text>} 
          />
        );
      } 
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (active) => (
        <Tag color={active ? 'green' : 'red'} className="rounded-full">
          {active ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Product">
            <Button 
              icon={<EditOutlined />} 
              onClick={() => navigate(`/inventory/items/${record.id}/edit`)} 
            />
          </Tooltip>
          <Popconfirm 
            title="Delete product?" 
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true, loading: deleteItemMutation.isPending }}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (isError) return (
    <Card className="m-6 bg-red-50">
      <Space direction="vertical">
        <Text danger strong>Error Loading Inventory</Text>
        <Button icon={<ReloadOutlined />} onClick={() => refetch()}>Try Again</Button>
      </Space>
    </Card>
  );

  return (
    <div className="p-6 animate-fadeIn">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="m-0"><ShoppingOutlined /> Products Inventory</Title>
          <Text type="secondary">Manage your product catalog and real-time stock levels</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()}>Refresh</Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            onClick={() => navigate('/inventory/items/new')}
            className="shadow-md"
          >
            Add Product
          </Button>
        </Space>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-sm border-none rounded-xl overflow-hidden">
        <div className="mb-6 flex justify-between items-center">
          <Input 
            prefix={<SearchOutlined className="text-gray-400" />} 
            placeholder="Search by name or SKU..." 
            className="max-w-md h-10 rounded-lg"
            value={search}
            allowClear
            onChange={(e) => setSearch(e.target.value)}
          />
          <Text type="secondary">Total: {filteredData.length} items</Text>
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey="id" 
          loading={isLoading}
          pagination={{ 
            pageSize: 10,
            showTotal: (total) => `Total ${total} products` 
          }}
          locale={{ emptyText: 'No products found' }}
        />
      </Card>
    </div>
  );
};

export default ProductsList;