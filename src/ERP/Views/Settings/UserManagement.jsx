import React from "react";
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";

export default function UserManagement() {
  const navigate = useNavigate();
  const users = [
    { id: 1, name: "Admin User", role: "Super Admin", status: "Active" },
    { id: 2, name: "Sales Agent", role: "Sales", status: "Active" },
  ];

  return (
    <Box p={3}>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h5" fontWeight="bold">Users & Permissions</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("new")}>
          Add User
        </Button>
      </div>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell><Chip label={user.status} color="success" size="small" /></TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => navigate(`${user.id}/edit`)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}