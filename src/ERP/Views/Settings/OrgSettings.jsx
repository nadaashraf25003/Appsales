import React from "react";
import { Box, Typography, Paper, Switch, FormControlLabel, Divider, Button } from "@mui/material";

export default function OrgSettings() {
  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Organization Preferences</Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <div className="space-y-4">
          <FormControlLabel control={<Switch defaultChecked />} label="Enable Multi-Branch Mode" />
          <Divider />
          <FormControlLabel control={<Switch />} label="Allow Inter-branch Stock Transfers" />
          <Divider />
          <FormControlLabel control={<Switch defaultChecked />} label="Public Organization Profile" />
          <div className="pt-4">
            <Button variant="contained">Save Preferences</Button>
          </div>
        </div>
      </Paper>
    </Box>
  );
}