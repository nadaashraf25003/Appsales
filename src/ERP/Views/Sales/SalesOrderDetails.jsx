import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Descriptions, 
  Table, 
  Tag, 
  Typography, 
  Button, 
  Divider, 
  Row, 
  Col, 
  Space, 
  Spin, 
  message 
} from 'antd';
import { PrinterOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import useSales from '@/Hooks/useSales';

const { Title, Text } = Typography;

const SalesOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  // 1. Hook Integration
  const { getOrderByIdMutation } = useSales();

  // 2. Data Fetching Logic
  useEffect(() => {
    if (id) {
      getOrderByIdMutation.mutate(Number(id), {
        onSuccess: (data) => {
          setOrder(data);
        },
        onError: (err) => {
          message.error("Failed to load order details");
          console.error(err);
        }
      });
    }
    // Added getOrderByIdMutation to dependencies to resolve ESLint warning
  }, [id, getOrderByIdMutation]);

  // 3. Table Column Mapping
  const columns = [
    { 
      title: 'Product ID', 
      dataIndex: 'productId', 
      key: 'productId',
      render: (pId) => <Text strong>#{pId}</Text>
    },
    { 
      title: 'Qty', 
      dataIndex: 'quantity', 
      key: 'quantity',
      render: (qty) => `x ${qty}`
    },
    { 
      title: 'Unit Price', 
      dataIndex: 'price', 
      key: 'price',
      render: (price) => `${price?.toLocaleString()} EGP`
    },
    { 
      title: 'Subtotal', 
      key: 'subtotal',
      align: 'right',
      render: (_, record) => (
        <Text strong>
          {(record.price * record.quantity).toLocaleString()} EGP
        </Text>
      )
    },
  ];

  if (getOrderByIdMutation.isPending) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Space direction="vertical" align="center">
          <Spin size="large" />
          <Text type="secondary">Loading Order Details...</Text>
        </Space>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-20 text-center">
        <Text type="secondary">No order data found.</Text>
        <br />
        <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <Space size="large">
          <Button 
            icon={<ArrowLeftOutlined />} 
            type="text" 
            onClick={() => navigate(-1)} 
          />
          <div>
            <Title level={3} className="m-0">Order #ORD-{order.id}</Title>
            <Text type="secondary text-xs">Branch Reference: {order.branchId}</Text>
          </div>
          <Tag 
            color={order.status === 'Paid' ? 'green' : 'orange'} 
            className="px-3 py-1 rounded-full font-bold"
          >
            {order.status?.toUpperCase() || 'PENDING'}
          </Tag>
        </Space>
        <Button icon={<PrinterOutlined />} type="primary" size="large shadow-md">
          Print Invoice
        </Button>
      </div>

      <Row gutter={24}>
        {/* Left Column: Items Table */}
        <Col xs={24} lg={16}>
          <Card 
            title={<Text strong>Order Items</Text>} 
            className="shadow-sm rounded-xl mb-6 border-none"
          >
            <Table 
              columns={columns} 
              dataSource={order.items || []} 
              pagination={false} 
              rowKey="productId"
            />
            
            <div className="mt-8 flex flex-col items-end">
              <div className="w-full max-w-xs bg-gray-50 p-5 rounded-xl border border-gray-100">
                <div className="flex justify-between py-1">
                  <Text type="secondary">Subtotal:</Text>
                  <Text strong>{order.totalAmount?.toLocaleString()} EGP</Text>
                </div>
                <div className="flex justify-between py-1">
                  <Text type="secondary">Tax (VAT 14%):</Text>
                  <Text className="text-gray-400">Included</Text>
                </div>
                <Divider className="my-3" />
                <div className="flex justify-between items-center">
                  <Title level={4} className="m-0">Total:</Title>
                  <Title level={3} className="m-0 text-blue-600">
                    {order.totalAmount?.toLocaleString()} EGP
                  </Title>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Right Column: Order & Customer Info */}
        <Col xs={24} lg={8}>
          <Card 
            title={<Text strong>Transaction Info</Text>} 
            className="shadow-sm rounded-xl mb-6 border-none"
          >
            <Descriptions column={1} labelStyle={{ color: '#8c8c8c' }}>
              <Descriptions.Item label="Payment status">
                <Tag color={order.status === 'Paid' ? 'success' : 'processing'}>
                  {order.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Tenant ID">{order.tenantId}</Descriptions.Item>
              <Descriptions.Item label="Branch ID">{order.branchId}</Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <Title level={5} className="text-gray-400 uppercase text-[10px] tracking-widest">
              Customer Details
            </Title>
            <div className="mt-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <Text strong className="block text-blue-800">Walking Customer</Text>
              <Text type="secondary" className="text-xs">
                Generic Customer Profile
              </Text>
            </div>
          </Card>
          
          <Card className="bg-gray-900 rounded-xl border-none">
             <Text className="text-white/50 text-xs">
               Internal Note: Verify payment through the branch dashboard if status remains pending for more than 10 minutes.
             </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SalesOrderDetails;