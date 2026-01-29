import React from 'react';
import { Card, Descriptions, Table, Tag, Typography, Button, Divider, Row, Col } from 'antd';
import { PrinterOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Space } from 'antd';

const { Title, Text } = Typography;

const SalesOrderDetails = () => {
  const orderItems = [
    { key: '1', name: 'Premium Coffee Beans', qty: 2, price: 200, total: 400 },
    { key: '2', name: 'Milk Carton 1L', qty: 1, price: 50, total: 50 },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} type="text" />
          <Title level={3} className="m-0">Order #ORD-2024-001</Title>
          <Tag color="green">PAID</Tag>
        </Space>
        <Button icon={<PrinterOutlined />} type="primary">Print Invoice</Button>
      </div>

      <Row gutter={24}>
        <Col span={16}>
          <Card title="Order Items" className="shadow-sm rounded-xl mb-6">
            <Table 
              columns={[
                { title: 'Product', dataIndex: 'name', key: 'name' },
                { title: 'Qty', dataIndex: 'qty', key: 'qty' },
                { title: 'Price', dataIndex: 'price', key: 'price' },
                { title: 'Subtotal', dataIndex: 'total', key: 'total' },
              ]} 
              dataSource={orderItems} 
              pagination={false} 
            />
            <div className="mt-6 flex flex-col items-end">
              <div className="w-64">
                <div className="flex justify-between py-1"><Text>Subtotal:</Text><Text>450.00 EGP</Text></div>
                <div className="flex justify-between py-1"><Text>Tax (14%):</Text><Text>63.00 EGP</Text></div>
                <Divider className="my-2" />
                <div className="flex justify-between py-1"><Title level={4}>Total:</Title><Title level={4} className="text-blue-600">513.00 EGP</Title></div>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Customer Information" className="shadow-sm rounded-xl mb-6">
            <Descriptions column={1}>
              <Descriptions.Item label="Name">Ahmed Ali</Descriptions.Item>
              <Descriptions.Item label="Phone">01012345678</Descriptions.Item>
              <Descriptions.Item label="Payment">Credit Card</Descriptions.Item>
              <Descriptions.Item label="Branch">Maadi Branch</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SalesOrderDetails;