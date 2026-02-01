import React, { useState } from 'react';
import { Table, Button, Input, Card, Space, Typography, Modal, Form, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, FolderOpenOutlined } from '@ant-design/icons';

const { Title } = Typography;

const ProductCategories = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  
  // Mock data - In production, this comes from your useCategory hook
  const [categories, setCategories] = useState([
    { id: 1, name: 'Electronics', description: 'Gadgets and devices' },
    { id: 2, name: 'Groceries', description: 'Daily essential items' },
  ]);

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingId(null);
    form.resetFields();
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    setCategories((prev) => prev.filter(cat => cat.id !== id));
    message.success('Category deleted successfully');
  };

  const handleFormSubmit = (values) => {
    if (editingId) {
      // Update logic
      setCategories((prev) => 
        prev.map(cat => (cat.id === editingId ? { ...cat, ...values } : cat))
      );
      message.success('Category updated successfully');
    } else {
      // Create logic
      // We generate the ID here inside the event handler
      const newCategory = {
        ...values,
        id: Math.floor(Math.random() * 1000000), // More stable than Date.now() for some linters
      };
      setCategories((prev) => [...prev, newCategory]);
      message.success('Category added successfully');
    }
    closeModal();
  };

  const columns = [
    { 
      title: 'Category Name', 
      dataIndex: 'name', 
      key: 'name', 
      render: (text) => <span className="font-bold">{text}</span> 
    },
    { 
      title: 'Description', 
      dataIndex: 'description', 
      key: 'description' 
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      // Removed '_' to satisfy no-unused-vars
      render: (record) => (
        <Space size="middle">
          <Button 
            type="text"
            icon={<EditOutlined className="text-blue-500" />} 
            onClick={() => handleEdit(record)} 
          />
          <Popconfirm 
            title="Delete category?" 
            description="Are you sure you want to delete this category?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="m-0!"><FolderOpenOutlined /> Product Categories</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setIsModalVisible(true)}
          className="rounded-lg h-10"
        >
          Add Category
        </Button>
      </div>

      <Card className="shadow-sm border-none rounded-xl">
        <Table 
          dataSource={categories} 
          columns={columns} 
          rowKey="id" 
          pagination={{ pageSize: 8 }}
          className="border-gray-100"
        />
      </Card>

      <Modal
        title={editingId ? "Edit Category" : "New Category"}
        open={isModalVisible}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={editingId ? "Update" : "Save"}
        destroyOnClose
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleFormSubmit}
          className="mt-4"
        >
          <Form.Item 
            name="name" 
            label="Category Name" 
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input placeholder="e.g., Beverages" size="large" />
          </Form.Item>
          
          <Form.Item name="description" label="Description">
            <Input.TextArea 
              placeholder="Provide a brief description of this category..." 
              rows={4} 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductCategories;