import React from "react";
import { Box, Paper, TextField, Button, MenuItem, Typography } from "@mui/material";

export default function UserEdit() {
  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>User Details</Typography>
      <Paper sx={{ p: 3, maxWidth: 500 }}>
        <div className="space-y-4">
          <TextField fullWidth label="Full Name" />
          <TextField fullWidth label="Email Address" />
          <TextField select fullWidth label="Assign Role" defaultValue="Sales">
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Sales">Sales Agent</MenuItem>
            <MenuItem value="Inventory">Inventory Manager</MenuItem>
          </TextField>
          <Button variant="contained">Update User</Button>
        </div>
      </Paper>
    </Box>
  );
}