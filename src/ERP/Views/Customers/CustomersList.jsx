import React, { useState } from 'react';
import { Table, Button, Input, Card, Space, Tag, Typography, Spin } from 'antd';
import { UserAddOutlined, SearchOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useCustomers from '@/Hooks/useCustomers';

const { Title, Text } = Typography;

const CustomersList = () => {
  const navigate = useNavigate();
  const { getAllCustomersQuery } = useCustomers();
  const { data: customers, isLoading, isError } = getAllCustomersQuery();

  const [search, setSearch] = useState('');

  const filteredData = customers?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: 'Customer Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Type', 
      dataIndex: 'type', 
      render: (type) => <Tag color={type === 'Premium' ? 'gold' : 'blue'}>{type || 'Regular'}</Tag> 
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/erp/sales/customers/${record.id}`)} 
          />
          <Button 
            type="primary" 
            ghost 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/erp/sales/customers/${record.id}/edit`)} 
          />
        </Space>
      ),
    },
  ];

  if (isLoading) return <Spin size="large" className="m-6" />;
  if (isError) return <div className="text-red-500 p-6">Failed to load customers.</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={3}>Customer Directory</Title>
        <Button 
          type="primary" 
          icon={<UserAddOutlined />} 
          className="h-10"
          onClick={() => navigate('/erp/sales/customers/new')}
        >
          Add New Customer
        </Button>
      </div>

      <Card className="shadow-sm border-none rounded-xl">
        <div className="mb-6 flex gap-4">
          <Input 
            prefix={<SearchOutlined />} 
            placeholder="Search by name, phone or email..." 
            className="max-w-md h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button className="h-10">Filters</Button>
        </div>
        <Table 
          columns={columns} 
          dataSource={filteredData || []} 
          rowKey="id"
          locale={{ emptyText: 'No customers found' }} 
        />
      </Card>
    </div>
  );
};

export default CustomersList;
