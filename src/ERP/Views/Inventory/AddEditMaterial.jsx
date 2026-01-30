import React, { useEffect } from 'react';
import { 
  Form, Input, InputNumber, Button, Card, Row, Col, 
  Typography, message, Space, Divider, Spin, DatePicker, Select, Tag 
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { SaveOutlined, RollbackOutlined, ExperimentOutlined, InfoCircleOutlined } from '@ant-design/icons';
import useMaterial from '@/Hooks/useMaterial';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const AddEditMaterial = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';
  const [form] = Form.useForm();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const tenantId = user.tenantId || 1;
  const { createMaterialMutation, updateMaterialMutation, getMaterialById } = useMaterial(tenantId);
  
  const { data: existingMaterial, isLoading: isFetching } = getMaterialById(Number(id));

  useEffect(() => {
    if (isEdit && existingMaterial) {
      form.setFieldsValue({
        ...existingMaterial,
        expiryDate: existingMaterial.expiryDate ? dayjs(existingMaterial.expiryDate) : null
      });
    }
  }, [isEdit, existingMaterial, form]);

  const onFinish = (values) => {
    const payload = {
      ...values,
      tenantId, // Ensure tenant context is passed
      expiryDate: values.expiryDate ? values.expiryDate.toISOString() : null
    };

    const action = isEdit 
      ? updateMaterialMutation.mutateAsync({ id: Number(id), data: payload })
      : createMaterialMutation.mutateAsync(payload);

    action
      .then(() => {
        message.success(`Material ${isEdit ? 'updated' : 'created'} successfully`);
        navigate('/inventory/materials');
      })
      .catch((err) => message.error(err?.response?.data?.message || 'Operation failed'));
  };

  if (isEdit && isFetching) return (
    <div className="h-screen flex items-center justify-center">
      <Spin size="large" tip="Fetching material details..." />
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fadeIn">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <Button icon={<RollbackOutlined />} onClick={() => navigate('/inventory/materials')} type="link" className="p-0 mb-2 text-purple-600">
            Back to Materials Inventory
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            <ExperimentOutlined className="mr-2" /> 
            {isEdit ? `Edit: ${existingMaterial?.name}` : 'Register New Material'}
          </Title>
        </div>
        {isEdit && <Tag color="purple">ID: #MAT-{id}</Tag>}
      </div>

      <Card className="shadow-md rounded-xl border-none">
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={onFinish} 
          initialValues={{ unit: 'kg', currentQuantity: 0, minQuantity: 5 }}
        >
          <Row gutter={24}>
            <Col span={16}>
              <Form.Item 
                name="name" 
                label={<Text strong>Material Name</Text>} 
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="e.g. Whole Milk, Arabica Beans" size="large" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="unit" label={<Text strong>Unit</Text>} rules={[{ required: true }]}>
                <Select size="large">
                  <Select.Option value="kg">Kilograms (kg)</Select.Option>
                  <Select.Option value="L">Liters (L)</Select.Option>
                  <Select.Option value="g">Grams (g)</Select.Option>
                  <Select.Option value="pcs">Pieces (pcs)</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item 
                name="currentQuantity" 
                label={<Space><Text strong>Current Stock</Text> {isEdit && <InfoCircleOutlined className="text-gray-400" />}</Space>} 
                rules={[{ required: true }]}
              >
                <InputNumber 
                  className="w-full" 
                  min={0} 
                  size="large" 
                  precision={2} 
                  disabled={isEdit} // Prevent direct stock manipulation in edit mode
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="minQuantity" label={<Text strong>Low Stock Threshold</Text>} rules={[{ required: true }]}>
                <InputNumber className="w-full" min={0} size="large" placeholder="Alert level" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="costPerUnit" label={<Text strong>Cost Per Unit (EGP)</Text>}>
                <InputNumber 
                  className="w-full" 
                  min={0} 
                  precision={2} 
                  size="large" 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="expiryDate" label={<Text strong>Expiry Date</Text>}>
                <DatePicker className="w-full" size="large" placeholder="Select date (if applicable)" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="description" label={<Text strong>Notes / Supplier Info</Text>}>
                <Input.TextArea rows={3} placeholder="Storage requirements or supplier contact..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Space className="w-full justify-end">
            <Button size="large" onClick={() => navigate('/inventory/materials')}>Cancel</Button>
            <Button 
              type="primary" 
              size="large" 
              htmlType="submit" 
              icon={<SaveOutlined />} 
              loading={createMaterialMutation.isPending || updateMaterialMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700 border-none px-10 shadow-lg"
            >
              {isEdit ? 'Update Changes' : 'Save Material'}
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default AddEditMaterial;