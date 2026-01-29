import React from 'react';
import { Card, Descriptions, Tabs, Table, Tag, Row, Col, Statistic, Typography } from 'antd';
import { ShoppingOutlined, WalletOutlined, HistoryOutlined } from '@ant-design/icons';
import { Button, Space, Divider } from 'antd';

const { Title } = Typography;

const CustomerDetails = () => {
  const tabItems = [
    {
      key: '1',
      label: (<span><ShoppingOutlined /> Recent Orders</span>),
      children: <Table columns={[{ title: 'Order ID', dataIndex: 'id' }, { title: 'Date', dataIndex: 'date' }, { title: 'Total', dataIndex: 'total' }]} dataSource={[]} />,
    },
    {
      key: '2',
      label: (<span><HistoryOutlined /> Account Statement</span>),
      children: <div className="p-10 text-center text-gray-400">Transaction history will appear here.</div>,
    },
  ];

  return (
    <div className="p-6">
      <Row gutter={16} className="mb-6">
        <Col span={16}>
          <Card className="shadow-sm rounded-xl h-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                JD
              </div>
              <div>
                <Title level={3} className="m-0">John Doe</Title>
                <Tag color="gold">Premium Member</Tag>
              </div>
            </div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Phone">01012345678</Descriptions.Item>
              <Descriptions.Item label="Email">john@example.com</Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>123 Street, Maadi, Cairo</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col span={8}>
          <Space direction="vertical" className="w-full" size="middle">
            <Card className="shadow-sm rounded-xl">
              <Statistic title="Total Spent" value={15750} suffix="EGP" prefix={<WalletOutlined />} valueStyle={{ color: '#3f8600' }} />
            </Card>
            <Card className="shadow-sm rounded-xl">
              <Statistic title="Unpaid Balance" value={0} suffix="EGP" />
            </Card>
          </Space>
        </Col>
      </Row>

      <Card className="shadow-sm rounded-xl">
        <Tabs defaultActiveKey="1" items={tabItems} />
      </Card>
    </div>
  );
};

export default CustomerDetails;