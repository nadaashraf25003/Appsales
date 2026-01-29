import React from 'react';
import { Card, Table, Tag, Button, Space, Typography, Tooltip } from 'antd';
import { EyeOutlined, PlayCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const POSOrderDetails = () => {
  // Mock data for pending/saved orders
  const dataSource = [
    {
      key: '1',
      id: 'PND-7721',
      time: '10:15 AM',
      customer: 'Walking Customer',
      items: 4,
      total: '450.00',
      status: 'Pending',
    },
    {
      key: '2',
      id: 'SAV-8832',
      time: '09:45 AM',
      customer: 'Ahmed Ali',
      items: 2,
      total: '1,200.00',
      status: 'Saved',
    },
  ];

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      render: (text) => <span><ClockCircleOutlined className="mr-2" />{text}</span>,
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
    },
    {
      title: 'Total Amount',
      dataIndex: 'total',
      key: 'total',
      render: (val) => <Text className="text-blue-600 font-bold">{val} EGP</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Pending' ? 'orange' : 'blue'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Tooltip title="View Items">
            <Button icon={<EyeOutlined />} size="small" />
          </Tooltip>
          <Button 
            type="primary" 
            icon={<PlayCircleOutlined />} 
            size="small"
            className="bg-green-600 border-none"
          >
            Resume Sale
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={3}>Saved & Pending Orders</Title>
        <Text type="secondary">Continue working on orders that were put on hold.</Text>
      </div>

      <Card className="shadow-sm border-none rounded-xl">
        <Table 
          columns={columns} 
          dataSource={dataSource} 
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default POSOrderDetails;