import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Tabs, Table, Tag, Row, Col, Statistic, Typography, Spin } from 'antd';
import { ShoppingOutlined, WalletOutlined, HistoryOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import useCustomers from '@/Hooks/useCustomers';

const { Title } = Typography;

const CustomerDetails = () => {
  const { id } = useParams();
  const { getCustomerByIdMutation, getCustomerStatementMutation } = useCustomers();
  const [customer, setCustomer] = useState(null);
  const [statement, setStatement] = useState([]);

  useEffect(() => {
    if (id) {
      getCustomerByIdMutation.mutate(+id, {
        onSuccess: (data) => setCustomer(data),
      });
      getCustomerStatementMutation.mutate(+id, {
        onSuccess: (data) => setStatement(data || []),
      });
    }
  }, [id]);

  if (!customer) return <Spin size="large" className="m-6" />;

  const tabItems = [
    {
      key: '1',
      label: (<span><ShoppingOutlined /> Recent Orders</span>),
      children: <Table 
        columns={[
          { title: 'Order ID', dataIndex: 'id' },
          { title: 'Date', dataIndex: 'date' },
          { title: 'Total', dataIndex: 'total' },
        ]} 
        dataSource={statement.orders || []} 
        rowKey="id"
        locale={{ emptyText: 'No orders found' }}
      />,
    },
    {
      key: '2',
      label: (<span><HistoryOutlined /> Account Statement</span>),
      children: <Table
        columns={[
          { title: 'Date', dataIndex: 'date' },
          { title: 'Description', dataIndex: 'description' },
          { title: 'Amount', dataIndex: 'amount' },
        ]}
        dataSource={statement.transactions || []}
        rowKey={(record) => record.id || Math.random()}
        locale={{ emptyText: 'No transactions found' }}
      />,
    },
  ];

  return (
    <div className="p-6">
      <Row gutter={16} className="mb-6">
        <Col span={16}>
          <Card className="shadow-sm rounded-xl h-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                {customer.name?.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <Title level={3} className="m-0">{customer.name}</Title>
                <Tag color={customer.type === 'premium' ? 'gold' : 'blue'}>
                  {customer.type || 'Regular Member'}
                </Tag>
              </div>
            </div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Phone">{customer.phone}</Descriptions.Item>
              <Descriptions.Item label="Email">{customer.email}</Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>{customer.billingAddress || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="shadow-sm rounded-xl">
            <Statistic 
              title="Total Spent" 
              value={statement.totalSpent || 0} 
              suffix="EGP" 
              prefix={<WalletOutlined />} 
              valueStyle={{ color: '#3f8600' }} 
            />
          </Card>
          <Card className="shadow-sm rounded-xl mt-4">
            <Statistic 
              title="Unpaid Balance" 
              value={statement.unpaidBalance || 0} 
              suffix="EGP" 
            />
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm rounded-xl">
        <Tabs defaultActiveKey="1" items={tabItems} />
      </Card>
    </div>
  );
};

export default CustomerDetails;
