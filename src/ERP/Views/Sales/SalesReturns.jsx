import React from 'react';
import { Card, Input, Button, Typography, Space, Alert, Form, Empty } from 'antd';
import { SearchOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const SalesReturns = () => {
  return (
    <div className="p-6">
      <Title level={3}>Returns & Refunds</Title>
      <Text type="secondary">Process customer returns and manage refunds effectively.</Text>

      <div className="mt-8 max-w-3xl mx-auto">
        <Card className="shadow-md rounded-xl text-center p-6 border-orange-100 bg-orange-50/20">
          <Title level={4}>Find Original Transaction</Title>
          <Text className="block mb-6">Scan receipt barcode or enter the Order ID manually to begin.</Text>
          
          <Form layout="inline" className="flex justify-center mb-4">
            <Form.Item name="orderId" className="w-80">
              <Input size="large" placeholder="Enter Order ID (e.g. ORD-123)" prefix={<SearchOutlined />} />
            </Form.Item>
            <Button type="primary" size="large" icon={<SearchOutlined />} className="bg-orange-500 border-none">
              Search
            </Button>
          </Form>

          <Alert 
            icon={<InfoCircleOutlined />}
            message="Refund Policy"
            description="Items must be in original condition. Refunds will be issued back to the original payment method unless specified otherwise."
            type="info"
            showIcon
            className="text-left mt-10"
          />
        </Card>

        <div className="mt-8">
          <Empty description="Enter an Order ID above to see returnable items." />
        </div>
      </div>
    </div>
  );
};

export default SalesReturns;