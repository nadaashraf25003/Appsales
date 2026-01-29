import React from 'react';
import { Table, Tag, Card, DatePicker, Input, Button, Space, Typography } from 'antd';
import { EyeOutlined, SearchOutlined, FilterOutlined, FileExcelOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const SalesList = () => {
  const columns = [
    { title: 'Order ID', dataIndex: 'id', key: 'id', render: (text) => <Text strong>{text}</Text> },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Customer', dataIndex: 'customer', key: 'customer' },
    { title: 'Total', dataIndex: 'total', key: 'total', render: (val) => `${val} EGP` },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Completed' ? 'green' : status === 'Pending' ? 'orange' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: () => <Button icon={<EyeOutlined />} size="small">Details</Button>,
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={3}>Sales Orders</Title>
        <Button icon={<FileExcelOutlined />} type="default">Export</Button>
      </div>

      <Card className="shadow-sm border-none rounded-xl mb-4">
        <Space wrap size="middle">
          <Input 
            placeholder="Search Order ID..." 
            prefix={<SearchOutlined />} 
            className="w-64 h-10" 
          />
          <RangePicker className="h-10" />
          <Button icon={<FilterOutlined />} className="h-10">Apply Filters</Button>
        </Space>
      </Card>

      <Card className="shadow-sm border-none rounded-xl">
        <Table columns={columns} dataSource={[]} locale={{ emptyText: 'No orders found for the selected period' }} />
      </Card>
    </div>
  );
};

export default SalesList;