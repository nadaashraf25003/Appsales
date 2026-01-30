import React, { useState, useMemo } from 'react';
import { Layout, Input, Card, Col, Row, Button, List, Typography, Badge, Spin, message, Empty, Space } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, CreditCardOutlined, PlusOutlined, MinusOutlined, DeleteOutlined } from '@ant-design/icons';
import useItem from '@/Hooks/useItem';
import useSales from '@/Hooks/useSales';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const POSMain = () => {
  // 1. Hook Integration
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const tenantId = user.tenantId || 1;
  const branchId = user.branchId || 1; 
  
  const { getItemsQuery } = useItem();
  const { createOrderMutation } = useSales();
  
  const { data: products, isLoading } = getItemsQuery(tenantId);
  
  // 2. State Management
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // 3. Cart Actions
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    message.success(`${product.name} added to cart`);
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // 4. Payment Execution
  const handlePayment = () => {
    if (cart.length === 0) return message.warning("Cart is empty");

    const orderPayload = {
      tenantId,
      branchId,
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }))
    };

    createOrderMutation.mutate(orderPayload, {
      onSuccess: () => {
        message.success("Order processed successfully!");
        setCart([]); // Clear cart
      },
      onError: (err) => {
        message.error(err?.response?.data?.message || "Payment failed");
      }
    });
  };

  // 5. Filtering Logic
  const filteredProducts = useMemo(() => {
    return products?.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory && p.isActive !== false;
    });
  }, [products, search, selectedCategory]);

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  }, [cart]);

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Space direction="vertical" align="center">
        <Spin size="large" />
        <Text type="secondary">Loading POS Terminal...</Text>
      </Space>
    </div>
  );

  return (
    <Layout className="h-[calc(100vh-64px)] bg-gray-50">
      <Content className="p-4 flex flex-col overflow-hidden">
        {/* Search & Filters */}
        <div className="flex flex-col gap-3 mb-4">
          <Input 
            size="large" 
            placeholder="Search products by name or barcode..." 
            prefix={<SearchOutlined className="text-gray-400" />} 
            className="rounded-lg shadow-sm border-none h-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {["All", "Coffee", "Pastries", "Cold Drinks"].map(cat => (
              <Button 
                key={cat} 
                shape="round" 
                type={selectedCategory === cat ? "primary" : "default"}
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat ? "shadow-md" : ""}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
          {filteredProducts?.length > 0 ? (
            <Row gutter={[12, 12]}>
              {filteredProducts.map(product => (
                <Col xs={12} sm={8} md={6} lg={6} xl={4} key={product.id}>
                  <Card 
                    hoverable 
                    className="text-center shadow-sm border-none rounded-xl overflow-hidden group"
                    bodyStyle={{ padding: '12px' }}
                    onClick={() => addToCart(product)}
                  >
                    <Badge count={product.currentStock} color={product.currentStock < 5 ? '#ff4d4f' : '#52c41a'} offset={[-10, 10]}>
                       <div className="h-28 bg-blue-50/50 mb-3 rounded-lg flex items-center justify-center text-blue-400 font-black text-2xl group-hover:bg-blue-100 transition-colors">
                         {product.name.substring(0,2).toUpperCase()}
                       </div>
                    </Badge>
                    <Text strong className="block truncate mb-1">{product.name}</Text>
                    <Text className="text-primary font-bold">{product.sellingPrice.toFixed(2)} EGP</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : <Empty className="mt-20" description="No products available in this category" />}
        </div>
      </Content>

      {/* Cart Sider */}
      <Sider width={400} theme="light" className="border-l p-0 flex flex-col shadow-2xl bg-white relative">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
          <Title level={4} style={{ margin: 0 }}><ShoppingCartOutlined /> Cart</Title>
          <Badge count={cart.length} showZero color="#1890ff" />
          <Button type="link" danger onClick={() => setCart([])} disabled={cart.length === 0}>Clear All</Button>
        </div>

        <div className="flex-grow overflow-y-auto px-4 custom-scrollbar">
          <List
            dataSource={cart}
            renderItem={item => (
              <List.Item className="px-0 py-4">
                <div className="w-full">
                  <div className="flex justify-between items-start mb-1">
                    <Text strong className="text-sm w-2/3 line-clamp-2">{item.name}</Text>
                    <Text strong className="text-primary text-sm whitespace-nowrap">
                      {(item.sellingPrice * item.quantity).toFixed(2)} EGP
                    </Text>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text type="secondary" className="text-xs">{item.sellingPrice.toFixed(2)} / unit</Text>
                    <Space size="middle">
                      <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <Button size="small" type="text" icon={<MinusOutlined />} onClick={() => updateQuantity(item.id, -1)} />
                        <Text strong className="px-3 text-xs">{item.quantity}</Text>
                        <Button size="small" type="text" icon={<PlusOutlined />} onClick={() => updateQuantity(item.id, 1)} />
                      </div>
                      <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => removeFromCart(item.id)} />
                    </Space>
                  </div>
                </div>
              </List.Item>
            )}
            locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Your cart is waiting..." /> }}
          />
        </div>

        {/* Calculation Summary */}
        <div className="p-6 bg-white border-t shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-medium text-gray-800">{totalAmount.toFixed(2)} EGP</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>VAT (14%)</span>
              <span className="font-medium text-gray-800">{(totalAmount * 0.14).toFixed(2)} EGP</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <Text strong className="text-lg">Total Amount</Text>
              <Title level={2} className="m-0 text-primary">
                {(totalAmount * 1.14).toFixed(2)} EGP
              </Title>
            </div>
          </div>

          <Button 
            type="primary" 
            size="large" 
            block 
            icon={<CreditCardOutlined />} 
            className="h-14 text-lg rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
            onClick={handlePayment}
            loading={createOrderMutation.isPending}
            disabled={cart.length === 0}
          >
            {createOrderMutation.isPending ? "PROCESSING..." : "CHECKOUT NOW"}
          </Button>
        </div>
      </Sider>
    </Layout>
  );
};

export default POSMain;