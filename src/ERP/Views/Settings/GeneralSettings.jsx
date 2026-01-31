import React from "react";
import { Box, TextField, Button, Typography, Paper, Grid, Avatar } from "@mui/material";

export default function GeneralSettings() {
  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>General Settings</Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} display="flex" flexDirection="column" alignItems="center">
            <Avatar sx={{ width: 100, height: 100, mb: 2 }}>LOGO</Avatar>
            <Button variant="outlined" size="small">Change Logo</Button>
          </Grid>
          <Grid item xs={12} md={8}>
            <div className="space-y-4">
              <TextField fullWidth label="Company Name" defaultValue="My ERP System" />
              <TextField fullWidth label="Contact Email" defaultValue="admin@company.com" />
              <TextField fullWidth label="Phone Number" defaultValue="+1 234 567 890" />
              <TextField fullWidth multiline rows={3} label="Address" />
              <Button variant="contained" color="primary">Save Changes</Button>
            </div>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}