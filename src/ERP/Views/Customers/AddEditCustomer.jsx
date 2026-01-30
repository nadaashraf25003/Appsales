import React, { useEffect } from 'react';
import { Card, Form, Input, Button, Row, Col, Divider, Select, Typography, message, Spin } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import useCustomers from '@/Hooks/useCustomers';

const { Title } = Typography;

const AddEditCustomer = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // customer id for edit
  const [form] = Form.useForm();
  const { createCustomerMutation, updateCustomerMutation, getCustomerByIdMutation } = useCustomers();

  // Load customer data if editing
  useEffect(() => {
    if (id) {
      getCustomerByIdMutation.mutate(id, {
        onSuccess: (data) => {
          form.setFieldsValue(data);
        },
      });
    }
  }, [id]);

  const handleFinish = (values) => {
    if (id) {
      updateCustomerMutation.mutate({ id: +id, ...values }, {
        onSuccess: () => {
          message.success('Customer updated successfully');
          navigate('/erp/sales/customers');
        },
      });
    } else {
      createCustomerMutation.mutate(values, {
        onSuccess: () => {
          message.success('Customer created successfully');
          navigate('/erp/sales/customers');
        },
      });
    }
  };

  if (id && getCustomerByIdMutation.isLoading) return <Spin size="large" className="m-6" />;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate(-1)} className="mb-4">
        Back
      </Button>
      
      <Card className="shadow-md rounded-xl">
        <Title level={4} className="mb-6">{id ? 'Edit Customer Profile' : 'Add Customer Profile'}</Title>
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Divider orientation="left">Personal & Contact Info</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Name is required' }]}>
                <Input placeholder="John Doe" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Phone Number" rules={[{ required: true, message: 'Phone is required' }]}>
                <Input placeholder="01XXXXXXXXX" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email Address" rules={[{ type: 'email', message: 'Enter a valid email' }]}>
                <Input placeholder="example@mail.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="Customer Type">
                <Select defaultValue="regular">
                  <Select.Option value="regular">Regular</Select.Option>
                  <Select.Option value="premium">Premium / VIP</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" className="mt-8">Financial & Billing Info</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="creditLimit" label="Credit Limit"><Input suffix="EGP" placeholder="0.00" /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="taxId" label="Tax ID / National ID"><Input placeholder="Optional" /></Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="billingAddress" label="Billing Address"><Input.TextArea rows={3} /></Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-6">
            <Button size="large" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="primary" size="large" icon={<SaveOutlined />} className="bg-blue-600" htmlType="submit">
              {id ? 'Update Customer Profile' : 'Save Customer Profile'}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddEditCustomer;
