import React from 'react';
import { Table, Button, Input, Card, Space, Typography, Tag } from 'antd';
import { UserOutlined, PlusOutlined, SearchOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const SuppliersList = () => {
  // Logic for search and fetching would go here (e.g., useSuppliers hook)
  const columns = [
    { 
      title: 'Supplier Name', 
      dataIndex: 'name', 
      key: 'name', 
      render: (text) => <Text strong>{text}</Text> 
    },
    { 
      title: 'Contact Person', 
      dataIndex: 'contact', 
      key: 'contact' 
    },
    { 
      title: 'Email/Phone', 
      key: 'info',
      render: (_, record) => (
        <div className="text-xs text-gray-500">
          <div><MailOutlined /> {record.email}</div>
          <div><PhoneOutlined /> {record.phone}</div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'gold'}>{status}</Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button icon={<EditOutlined />} />
          <Button danger icon={<DeleteOutlined />} />
        </Space>
      )
    }
  ];

  const data = [
    { id: 1, name: 'Global Tech Ltd', contact: 'John Doe', email: 'john@global.com', phone: '+20 123 456 789', status: 'Active' },
    { id: 2, name: 'Fresh Farms Co', contact: 'Sarah Smith', email: 'sarah@fresh.com', phone: '+20 987 654 321', status: 'Active' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={3}><UserOutlined /> Suppliers List</Title>
        <Button type="primary" icon={<PlusOutlined />}>New Supplier</Button>
      </div>

      <Card className="shadow-sm border-none rounded-xl">
        <div className="flex gap-4 mb-6">
          <Input 
            prefix={<SearchOutlined />} 
            placeholder="Search suppliers by name or contact..." 
            className="max-w-md h-10" 
          />
        </div>
        <Table columns={columns} dataSource={data} rowKey="id" />
      </Card>
    </div>
  );
};

export default SuppliersList;