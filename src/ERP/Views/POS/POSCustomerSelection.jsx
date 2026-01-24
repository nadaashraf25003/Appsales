import React from 'react';
import { Card, Input, List, Button, Avatar, Typography, Space, Tag, Divider } from 'antd';
import { UserAddOutlined, SearchOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const POSCustomerSelection = () => {
  const customers = [
    { id: 1, name: 'Ahmed Ali', phone: '01012345678', email: 'ahmed@example.com', type: 'Regular' },
    { id: 2, name: 'Sara Mahmoud', phone: '01287654321', email: 'sara@web.com', type: 'Premium' },
    { id: 3, name: 'Walking Customer', phone: 'N/A', email: 'N/A', type: 'Guest' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2}>Customer Selection</Title>
          <Text type="secondary">Link a customer to the current transaction.</Text>
        </div>
        <Button 
          type="primary" 
          size="large" 
          icon={<UserAddOutlined />} 
          className="bg-blue-600 rounded-lg h-12"
        >
          Add New Customer
        </Button>
      </div>

      <Card className="shadow-md border-none rounded-xl">
        <Input 
          size="large" 
          placeholder="Search by name, phone, or email..." 
          prefix={<SearchOutlined className="text-gray-400" />} 
          className="rounded-lg mb-6 h-12"
        />

        <List
          itemLayout="horizontal"
          dataSource={customers}
          renderItem={(item) => (
            <List.Item 
              className="cursor-pointer hover:bg-blue-50 p-4 rounded-xl transition-all mb-3 border border-gray-100"
              onClick={() => console.log('Selected:', item)}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    size={54} 
                    className={item.type === 'Premium' ? 'bg-amber-500' : 'bg-blue-500'}
                  >
                    {item.name[0]}
                  </Avatar>
                }
                title={
                  <Space>
                    <Text strong className="text-lg">{item.name}</Text>
                    <Tag color={item.type === 'Premium' ? 'gold' : 'blue'}>{item.type}</Tag>
                  </Space>
                }
                description={
                  <Space split={<Divider type="vertical" />} className="mt-1">
                    <span><PhoneOutlined className="mr-1" /> {item.phone}</span>
                    <span><MailOutlined className="mr-1" /> {item.email}</span>
                  </Space>
                }
              />
              <Button type="link" className="font-bold">SELECT</Button>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default POSCustomerSelection;