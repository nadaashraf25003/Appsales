import React from "react";
import { Box, Typography, Paper, MenuItem, TextField, Button, Divider } from "@mui/material";

export default function FinancialSettings() {
  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Financial Configuration</Typography>
      <Paper sx={{ p: 3, mt: 2, maxWidth: 600 }}>
        <div className="space-y-6">
          <TextField select fullWidth label="Default Currency" defaultValue="USD">
            <MenuItem value="USD">USD - US Dollar</MenuItem>
            <MenuItem value="EUR">EUR - Euro</MenuItem>
            <MenuItem value="EGP">EGP - Egyptian Pound</MenuItem>
          </TextField>
          <TextField fullWidth label="Default Tax Rate (%)" type="number" defaultValue="14" />
          <TextField select fullWidth label="Fiscal Year Start" defaultValue="1">
            <MenuItem value="1">January</MenuItem>
            <MenuItem value="7">July</MenuItem>
          </TextField>
          <Divider />
          <Button variant="contained">Update Financials</Button>
        </div>
      </Paper>
    </Box>
  );
}