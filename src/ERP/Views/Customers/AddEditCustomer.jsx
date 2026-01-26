import React from 'react';
import { Card, Form, Input, Button, Row, Col, Divider, Select, Typography } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const AddEditCustomer = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate(-1)} className="mb-4">
        Back
      </Button>
      
      <Card className="shadow-md rounded-xl">
        <Title level={4} className="mb-6">Customer Profile Management</Title>
        <Form layout="vertical">
          <Divider orientation="left">Personal & Contact Info</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Full Name" required><Input placeholder="John Doe" /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phone Number" required><Input placeholder="01XXXXXXXXX" /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Email Address"><Input placeholder="example@mail.com" /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Customer Type">
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
              <Form.Item label="Credit Limit"><Input suffix="EGP" placeholder="0.00" /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tax ID / National ID"><Input placeholder="Optional" /></Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Billing Address"><Input.TextArea rows={3} /></Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-6">
            <Button size="large" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="primary" size="large" icon={<SaveOutlined />} className="bg-blue-600">
              Save Customer Profile
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddEditCustomer;