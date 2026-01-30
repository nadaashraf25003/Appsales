// src/ERP/Views/Dashboard/Activities.jsx
import { useEffect, useState } from "react";
import { Box, Typography, Paper, List, ListItem, ListItemText } from "@mui/material";

// Hooks
import useSales from "@/Hooks/useSales";
import useCustomers from "@/Hooks/useCustomers";
import useExpenses from "@/Hooks/useExpenses";

const Activities = () => {
  const [activities, setActivities] = useState([]);

  // Tenant ID (replace with dynamic tenantId from auth context if available)
  const tenantId = 1;

  // Hooks
  const { getOrdersByTenantMutation } = useSales();
  const { getAllCustomersMutation } = useCustomers();
  const { getAllExpensesMutation } = useExpenses();

  useEffect(() => {
    // Fetch Orders
    getOrdersByTenantMutation.mutate(tenantId, {
      onSuccess: (res) => {
        const orders = res.data || [];
        const orderActivities = orders.slice(-5).map((o) => ({
          id: `order-${o.id}`,
          activity: `Order #${o.id} ${o.status}`,
          time: new Date(o.createdAt).toLocaleTimeString(),
        }));
        setActivities((prev) => [...prev, ...orderActivities]);
      },
    });

    // Fetch Customers
    getAllCustomersMutation.mutate(undefined, {
      onSuccess: (res) => {
        const customers = res.data || [];
        const customerActivities = customers.slice(-5).map((c) => ({
          id: `customer-${c.id}`,
          activity: `New customer registered: ${c.name}`,
          time: new Date().toLocaleTimeString(),
        }));
        setActivities((prev) => [...prev, ...customerActivities]);
      },
    });

    // Fetch Expenses
    getAllExpensesMutation.mutate({ tenantId }, {
      onSuccess: (res) => {
        const expenses = res.data || [];
        const expenseActivities = expenses.slice(-5).map((e) => ({
          id: `expense-${e.id}`,
          activity: `Expense added: ${e.description} ($${e.amount})`,
          time: new Date(e.date).toLocaleTimeString(),
        }));
        setActivities((prev) => [...prev, ...expenseActivities]);
      },
    });
  }, []);

  // Sort activities by time (latest first)
  const sortedActivities = [...activities].sort((a, b) => new Date(b.time) - new Date(a.time));

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Activities
      </Typography>

      <Paper sx={{ p: 3 }}>
        <List>
          {sortedActivities.map((item) => (
            <ListItem key={item.id}>
              <ListItemText primary={item.activity} secondary={item.time} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Activities;
