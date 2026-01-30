import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Button, Space, Typography, Tooltip, Spin, Empty } from 'antd';
import { EyeOutlined, PlayCircleOutlined, ClockCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import useSales from '@/Hooks/useSales';

const { Title, Text } = Typography;

const POSOrderDetails = () => {
  const navigate = useNavigate();
  
  // 1. Hook Integration
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const tenantId = user.tenantId || 1;
  
  const { getOrdersByTenantQuery } = useSales();
  const { data: orders, isLoading, refetch, isFetching } = getOrdersByTenantQuery(tenantId);

  // 2. Table Column Configuration
  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Text strong>#{id}</Text>,
    },
    {
      title: 'Date/Time',
      dataIndex: 'date',
      key: 'date',
      render: (date) => (
        <span>
          <ClockCircleOutlined className="mr-2 text-gray-400" />
          {date ? new Date(date).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : 'N/A'}
        </span>
      ),
    },
    {
      title: 'Items Count',
      dataIndex: 'items',
      key: 'items',
      render: (items) => items?.length || 0,
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val) => <Text className="text-blue-600 font-bold">{val?.toLocaleString()} EGP</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'blue';
        if (status === 'Pending' || status === 'Draft') color = 'orange';
        if (status === 'Paid' || status === 'Completed') color = 'green';
        if (status === 'Cancelled') color = 'red';
        
        return (
          <Tag color={color} className="font-medium px-3 rounded-full">
            {status?.toUpperCase() || 'UNKNOWN'}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Order Details">
            <Button 
              icon={<EyeOutlined />} 
              size="small" 
              onClick={() => navigate(`/sales/pos/order/${record.id}`)}
            />
          </Tooltip>
          {record.status !== 'Paid' && record.status !== 'Cancelled' && (
            <Button 
              type="primary" 
              icon={<PlayCircleOutlined />} 
              size="small"
              className="bg-green-600 border-none hover:bg-green-700"
              onClick={() => navigate(`/sales/pos/order/${record.id}`)}
            >
              Resume Sale
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex justify-between items-start mb-6">
        <div>
          <Title level={3}>Order History & Pending Sales</Title>
          <Text type="secondary">Manage recent transactions and resume orders put on hold.</Text>
        </div>
        <Button 
          icon={<ReloadOutlined spin={isFetching} />} 
          onClick={() => refetch()}
        >
          Refresh Data
        </Button>
      </div>

      <Card className="shadow-sm border-none rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center">
            <Spin size="large" tip="Fetching orders..." />
          </div>
        ) : (
          <Table 
            columns={columns} 
            dataSource={orders || []} 
            rowKey="id"
            pagination={{ 
              pageSize: 8,
              showTotal: (total) => `Total ${total} orders`
            }}
            locale={{ 
              emptyText: <Empty description="No orders found for this tenant" /> 
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default POSOrderDetails;