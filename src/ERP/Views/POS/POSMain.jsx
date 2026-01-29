import React, { useState } from 'react';
import { Layout, Input, Card, Col, Row, Button, List, Typography, Badge, Divider } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, CreditCardOutlined } from '@ant-design/icons';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const POSMain = () => {
  const [cart, setCart] = useState([]);

  // Example Category list
  const categories = ["All", "Electronics", "Groceries", "Snacks"];

  return (
    <Layout className="h-[calc(100vh-64px)] bg-gray-50">
      <Content className="p-4 flex flex-col overflow-hidden">
        {/* Search & Categories */}
        <div className="flex flex-col gap-3 mb-4">
          <Input 
            size="large" 
            placeholder="Search products..." 
            prefix={<SearchOutlined />} 
            className="rounded-lg shadow-sm"
          />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map(cat => (
              <Button key={cat} shape="round" type={cat === "All" ? "primary" : "default"}>
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-grow overflow-y-auto pr-2">
          <Row gutter={[12, 12]}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
              <Col xs={12} sm={8} md={6} key={i}>
                <Card 
                  hoverable 
                  className="text-center shadow-sm border-none"
                  onClick={() => setCart([...cart, { id: i, name: `Product ${i}`, price: 100 }])}
                >
                  <div className="h-20 bg-gray-100 mb-2 rounded flex items-center justify-center">IMG</div>
                  <Text strong>Product {i}</Text><br/>
                  <Text type="secondary">100.00 EGP</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Content>

      {/* Cart & Payment Section */}
      <Sider width={350} theme="light" className="border-l p-4 flex flex-col shadow-lg">
        <Title level={4}><ShoppingCartOutlined /> Active Cart</Title>
        <div className="flex-grow overflow-y-auto">
          <List
            dataSource={cart}
            renderItem={item => (
              <List.Item extra={<b>{item.price} EGP</b>}>
                {item.name}
              </List.Item>
            )}
            locale={{ emptyText: 'Cart is empty' }}
          />
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between mb-4">
            <Text strong size="large">Total Amount</Text>
            <Title level={3} className="m-0 text-blue-600">
              {cart.reduce((sum, i) => sum + i.price, 0).toFixed(2)} EGP
            </Title>
          </div>
          <Button type="primary" size="large" block icon={<CreditCardOutlined />} className="h-14 text-lg">
            PAYMENT SECTION
          </Button>
        </div>
      </Sider>
    </Layout>
  );
};

export default POSMain;