import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Button, Card, Row, Col, Typography, message, Switch, Space, Divider, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { SaveOutlined, RollbackOutlined, InfoCircleOutlined } from '@ant-design/icons';
import useItem from '@/Hooks/useItem';

const { Title, Text } = Typography;

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';
  const [form] = Form.useForm();

  // 1. Hook Integration 
  const { createItemMutation, updateItemMutation, getItemQuery } = useItem();
  
  // Only fetch if we are in Edit mode AND id is a valid number
  const { data: existingProduct, isLoading: isFetching } = getItemQuery(Number(id), {
    enabled: isEdit && !isNaN(Number(id))
  });

  // 2. Pre-fill form when data arrives 
  useEffect(() => {
    if (isEdit && existingProduct) {
      form.setFieldsValue(existingProduct);
    }
  }, [isEdit, existingProduct, form]);

  // 3. Submit Logic 
  const onFinish = (values) => {
    // Ensure tenantId is included if required by your backend
    const payload = { ...values };

    if (isEdit) {
      updateItemMutation.mutate({ id: Number(id), data: payload }, {
        onSuccess: () => {
          message.success('Product updated successfully');
          navigate('/inventory/items');
        },
        onError: (err) => message.error(err?.response?.data?.message || 'Update failed')
      });
    } else {
      createItemMutation.mutate(payload, {
        onSuccess: () => {
          message.success('Product created successfully');
          navigate('/inventory/items');
        },
        onError: (err) => message.error(err?.response?.data?.message || 'Creation failed')
      });
    }
  };

  if (isEdit && isFetching) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Space direction="vertical" align="center">
          <Spin size="large" />
          <Text type="secondary">Loading product details...</Text>
        </Space>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Navigation Header */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <Button 
            icon={<RollbackOutlined />} 
            onClick={() => navigate('/inventory/items')} 
            type="link" 
            className="p-0 mb-2"
          >
            Back to Inventory
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            {isEdit ? `Edit Product: ${existingProduct?.name}` : 'Create New Product'}
          </Title>
        </div>
        {isEdit && (
          <Text type="secondary" className="text-xs">
            Product ID: <Tag>#{id}</Tag>
          </Text>
        )}
      </div>

      <Card className="shadow-md rounded-xl border-none">
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={onFinish} 
          autoComplete="off"
          initialValues={{ isActive: true, currentStock: 0, minStockLevel: 5 }}
        >
          <Row gutter={24}>
            {/* Basic Info */}
            <Col span={16}>
              <Form.Item 
                name="name" 
                label={<Text strong>Product Name</Text>} 
                rules={[{ required: true, message: 'Please enter product name' }]}
              >
                <Input placeholder="e.g. Arabica Coffee Beans" size="large" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isActive" label={<Text strong>Status</Text>} valuePropName="checked">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>

            {/* Pricing & SKU */}
            <Col span={12}>
              <Form.Item 
                name="sellingPrice" 
                label={<Text strong>Selling Price (EGP)</Text>} 
                rules={[{ required: true, message: 'Price is required' }]}
              >
                <InputNumber 
                  className="w-full" 
                  min={0} 
                  precision={2} 
                  size="large" 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sku" label={<Text strong>SKU / Barcode</Text>}>
                <Input placeholder="Internal SKU or Barcode number" size="large" />
              </Form.Item>
            </Col>

            {/* Stock Levels */}
            <Col span={12}>
              <Form.Item 
                name="currentStock" 
                label={
                  <Space>
                    <Text strong>Opening Stock Quantity</Text>
                    {isEdit && <Tooltip title="Stock should be adjusted via Inventory Logs for accuracy"><InfoCircleOutlined className="text-blue-500" /></Tooltip>}
                  </Space>
                } 
                rules={[{ required: true, message: 'Stock quantity is required' }]}
              >
                <InputNumber 
                  className="w-full" 
                  min={0} 
                  size="large" 
                  disabled={isEdit} 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="minStockLevel" label={<Text strong>Low Stock Warning Level</Text>}>
                <InputNumber className="w-full" min={0} size="large" placeholder="5" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="description" label={<Text strong>Product Description</Text>}>
                <Input.TextArea rows={4} placeholder="Enter detailed product specifications, ingredients, or notes..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <div className="flex justify-between items-center">
            <Text type="secondary" className="italic">
              * Required fields must be filled before saving.
            </Text>
            <Space>
              <Button size="large" onClick={() => navigate('/inventory/items')}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                size="large" 
                htmlType="submit" 
                icon={<SaveOutlined />} 
                loading={createItemMutation.isPending || updateItemMutation.isPending}
                className="px-8 shadow-md"
              >
                {isEdit ? 'Update Product' : 'Create Product'}
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddEditProduct;