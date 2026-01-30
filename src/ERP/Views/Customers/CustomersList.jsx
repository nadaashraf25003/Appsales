import React, { useState } from 'react';
import { Table, Button, Input, Card, Space, Tag, Typography, Spin, Popconfirm, message } from 'antd';
import { UserAddOutlined, SearchOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useCustomers from '@/Hooks/useCustomers'; // 1. Hook imported

const { Title, Text } = Typography;

const CustomersList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // 2. Initialize the Bridge (Queries & Mutations)
  const { getAllCustomersQuery, deleteCustomerMutation } = useCustomers();
  const { data: customers, isLoading, isError, refetch } = getAllCustomersQuery();

  // 3. Handle Delete Link
  const handleDelete = (id) => {
    deleteCustomerMutation.mutate(id, {
      onSuccess: () => {
        message.success('Customer deleted successfully');
        refetch(); // Refresh list after deletion
      },
      onError: (err) => {
        message.error(err?.response?.data?.message || 'Failed to delete customer');
      }
    });
  };

  // 4. Data Filter Logic (Matches your Hook's Customer Type)
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
      key: 'type',
      render: (type) => (
        <Tag color={type === 'Premium' ? 'gold' : 'blue'}>
          {type || 'Regular'}
        </Tag>
      ) 
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          {/* View Details Link */}
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/erp/sales/customers/${record.id}`)} 
          />
          
          {/* Edit Link */}
          <Button 
            type="primary" 
            ghost 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/erp/sales/customers/${record.id}/edit`)} 
          />

          {/* Delete Link (Using Popconfirm for Safety) */}
          <Popconfirm
            title="Delete Customer"
            description="Are you sure to delete this customer?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ loading: deleteCustomerMutation.isPending, danger: true }}
          >
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              disabled={deleteCustomerMutation.isPending}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 5. Handling Loading & Error States
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Loading Customer Directory..." />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="m-6 text-center border-red-200 bg-red-50">
        <Text type="danger">Failed to connect to the Customer API. Please check your connection.</Text>
        <br />
        <Button onClick={() => refetch()} className="mt-4">Try Again</Button>
      </Card>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <Title level={3} style={{ margin: 0 }}>Customer Directory</Title>
          <Text type="secondary">Manage your client relationships and contact data</Text>
        </div>
        <Button 
          type="primary" 
          icon={<UserAddOutlined />} 
          size="large"
          className="rounded-lg shadow-md"
          onClick={() => navigate('/erp/sales/customers/new')}
        >
          Add New Customer
        </Button>
      </div>

      <Card className="shadow-sm border-none rounded-xl overflow-hidden">
        <div className="mb-6 flex flex-wrap gap-4">
          <Input 
            prefix={<SearchOutlined className="text-gray-400" />} 
            placeholder="Search by name, phone or email..." 
            className="max-w-md h-11 rounded-lg"
            value={search}
            allowClear
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button className="h-11 px-6 rounded-lg">Filters</Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredData || []} 
          rowKey="id"
          pagination={{ pageSize: 8 }}
          className="border-t border-gray-50"
          locale={{ emptyText: 'No customers found in your database' }} 
        />
      </Card>
    </div>
  );
};

export default CustomersList;