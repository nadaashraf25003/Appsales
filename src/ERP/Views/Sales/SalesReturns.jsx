import React, { useState } from 'react';
import { Card, Input, Button, Typography, Space, Alert, Form, Empty, Table, Divider, Tag, Modal, message, Spin } from 'antd';
import { SearchOutlined, InfoCircleOutlined, UndoOutlined, CheckCircleOutlined } from '@ant-design/icons';
import useSales from '@/Hooks/useSales';

const { Title, Text } = Typography;

const SalesReturns = () => {
  const [form] = Form.useForm();
  const [order, setOrder] = useState(null);

  // 1. Hook Integration
  const { getOrderByIdMutation, cancelOrderMutation } = useSales();

  // 2. Search Logic
  const handleSearch = (values) => {
    const numericId = values.orderId.replace(/\D/g, ''); // Extract numbers if user typed "ORD-123"
    
    getOrderByIdMutation.mutate(Number(numericId), {
      onSuccess: (data) => {
        if (data.status !== 'Paid' && data.status !== 'Completed') {
          message.warning("Only completed/paid orders can be returned.");
          setOrder(null);
        } else {
          setOrder(data);
        }
      },
      onError: () => {
        message.error("Order not found. Please check the ID.");
        setOrder(null);
      }
    });
  };

  // 3. Refund Logic
  const handleProcessRefund = () => {
    Modal.confirm({
      title: 'Process Full Refund?',
      icon: <UndoOutlined className="text-red-500" />,
      content: `This will cancel Order #ORD-${order.id} and revert the total of ${order.totalAmount} EGP.`,
      okText: 'Confirm Refund',
      okType: 'danger',
      onOk: () => {
        cancelOrderMutation.mutate({ id: order.id, reason: "Customer Return" }, {
          onSuccess: () => {
            message.success("Refund processed successfully.");
            setOrder(null);
            form.resetFields();
          }
        });
      }
    });
  };

  const columns = [
    { title: 'Item ID', dataIndex: 'productId', key: 'productId' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Unit Price', dataIndex: 'price', key: 'price', render: (p) => `${p} EGP` },
    { 
      title: 'Total', 
      key: 'total', 
      align: 'right',
      render: (_, record) => <Text strong>{record.price * record.quantity} EGP</Text> 
    },
  ];

  return (
    <div className="p-6 animate-fadeIn">
      <Title level={3}>Returns & Refunds</Title>
      <Text type="secondary">Process customer returns and manage refunds effectively.</Text>

      <div className="mt-8 max-w-4xl mx-auto">
        <Card className="shadow-md rounded-xl text-center p-6 border-orange-100 bg-orange-50/20">
          <Title level={4}>Find Original Transaction</Title>
          <Text className="block mb-6 text-gray-500">Scan receipt barcode or enter the Order ID manually to begin.</Text>
          
          <Form form={form} layout="inline" className="flex justify-center mb-4" onFinish={handleSearch}>
            <Form.Item name="orderId" className="w-80" rules={[{ required: true, message: 'Please enter an ID' }]}>
              <Input size="large" placeholder="Enter Order ID (e.g. 101)" prefix={<SearchOutlined />} />
            </Form.Item>
            <Button 
              type="primary" 
              size="large" 
              htmlType="submit"
              icon={<SearchOutlined />} 
              loading={getOrderByIdMutation.isPending}
              className="bg-orange-500 border-none hover:bg-orange-600"
            >
              Search
            </Button>
          </Form>

          <Alert 
            icon={<InfoCircleOutlined />}
            message="Refund Policy"
            description="Items must be in original condition. Refunds will be issued back to the original payment method."
            type="info"
            showIcon
            className="text-left mt-6"
          />
        </Card>

        {/* Order Details Display */}
        <div className="mt-8">
          {order ? (
            <Card className="shadow-sm rounded-xl border-none animate-slideUp">
              <div className="flex justify-between items-center mb-4">
                <Space>
                  <Title level={5} className="m-0">Order #ORD-{order.id}</Title>
                  <Tag color="green" icon={<CheckCircleOutlined />}>{order.status.toUpperCase()}</Tag>
                </Space>
                <Text type="secondary">{new Date(order.date).toLocaleDateString()}</Text>
              </div>
              
              <Table 
                dataSource={order.items} 
                columns={columns} 
                pagination={false} 
                rowKey="productId" 
                size="small"
              />

              <Divider />
              
              <div className="flex justify-between items-end">
                <div className="text-left">
                  <Text type="secondary">Refund Total</Text>
                  <Title level={3} className="m-0 text-orange-600">{order.totalAmount?.toLocaleString()} EGP</Title>
                </div>
                <Space>
                  <Button onClick={() => setOrder(null)}>Cancel</Button>
                  <Button 
                    type="primary" 
                    danger 
                    size="large" 
                    icon={<UndoOutlined />}
                    onClick={handleProcessRefund}
                    loading={cancelOrderMutation.isPending}
                  >
                    Process Refund
                  </Button>
                </Space>
              </div>
            </Card>
          ) : (
            <div className="py-12 bg-white rounded-xl border border-dashed border-gray-200">
               {getOrderByIdMutation.isPending ? <Spin tip="Fetching order..." /> : <Empty description="Enter an Order ID above to see returnable items." />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesReturns;