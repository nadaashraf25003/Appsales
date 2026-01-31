import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Tag, Card, DatePicker, Input, Button, Space, Typography, Spin, Select } from 'antd';
import { EyeOutlined, SearchOutlined, FilterOutlined, FileExcelOutlined, ReloadOutlined } from '@ant-design/icons';
import useSales from '@/Hooks/useSales';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const SalesList = () => {
  const navigate = useNavigate();
  
  // 1. Hook Integration
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const tenantId = user.tenantId || 1;
  const { getOrdersByTenantQuery } = useSales();
  const { data: orders, isLoading, refetch, isFetching } = getOrdersByTenantQuery(tenantId);

  // 2. Filter States
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  // 3. Logic: Client-side Filtering
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    return orders.filter(order => {
      const matchesId = order.id.toString().includes(searchText);
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      
      let matchesDate = true;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const orderDate = dayjs(order.date);
        matchesDate = orderDate.isAfter(dateRange[0].startOf('day')) && 
                      orderDate.isBefore(dateRange[1].endOf('day'));
      }

      return matchesId && matchesStatus && matchesDate;
    });
  }, [orders, searchText, dateRange, statusFilter]);

  const columns = [
    { 
      title: 'Order ID', 
      dataIndex: 'id', 
      key: 'id', 
      render: (text) => <Text strong className="text-primary">#ORD-{text}</Text> 
    },
    { 
      title: 'Date', 
      dataIndex: 'date', 
      key: 'date',
      render: (date) => dayjs(date).format('DD MMM YYYY, HH:mm'),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix()
    },
    { 
      title: 'Items', 
      dataIndex: 'items', 
      key: 'items',
      render: (items) => items?.length || 0
    },
    { 
      title: 'Total', 
      dataIndex: 'totalAmount', 
      key: 'totalAmount', 
      render: (val) => <Text strong>{val?.toLocaleString()} EGP</Text>,
      sorter: (a, b) => a.totalAmount - b.totalAmount
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => {
        const config = {
          Paid: { color: 'green', label: 'COMPLETED' },
          Completed: { color: 'green', label: 'COMPLETED' },
          Pending: { color: 'orange', label: 'PENDING' },
          Draft: { color: 'blue', label: 'DRAFT' },
          Cancelled: { color: 'red', label: 'CANCELLED' }
        };
        const { color, label } = config[status] || { color: 'default', label: status };
        return <Tag color={color} className="font-medium rounded-full px-3">{label}</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          icon={<EyeOutlined />} 
          size="small" 
          onClick={() => navigate(`/sales/pos/order/${record.id}`)}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="m-0">Sales Orders</Title>
          <Text type="secondary">View and manage all transactions for Tenant #{tenantId}</Text>
        </div>
        <Space>
          <Button 
            icon={<ReloadOutlined spin={isFetching} />} 
            onClick={() => refetch()}
          >
            Refresh
          </Button>
          <Button icon={<FileExcelOutlined />} type="default" className="border-green-600 text-green-600">
            Export Excel
          </Button>
        </Space>
      </div>

      <Card className="shadow-sm border-none rounded-xl mb-4">
        <Space wrap size="middle">
          <Input 
            placeholder="Search Order ID..." 
            prefix={<SearchOutlined className="text-gray-400" />} 
            className="w-64 h-10 rounded-lg" 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Select
            className="w-40 h-10"
            placeholder="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'All Statuses', value: 'All' },
              { label: 'Pending', value: 'Pending' },
              { label: 'Completed', value: 'Paid' },
              { label: 'Cancelled', value: 'Cancelled' },
            ]}
          />
          <RangePicker 
            className="h-10 rounded-lg" 
            onChange={(values) => setDateRange(values)}
          />
          <Button 
            type="primary" 
            icon={<FilterOutlined />} 
            className="h-10 rounded-lg"
            onClick={() => refetch()}
          >
            Apply Filters
          </Button>
        </Space>
      </Card>

      <Card className="shadow-sm border-none rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center"><Spin tip="Loading orders..." /></div>
        ) : (
          <Table 
            columns={columns} 
            dataSource={filteredOrders} 
            rowKey="id"
            pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} orders` }}
            locale={{ emptyText: 'No orders found for the selected criteria' }} 
          />
        )}
      </Card>
    </div>
  );
};

export default SalesList;