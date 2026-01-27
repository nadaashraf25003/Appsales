import React, { useState, useEffect } from "react";
import { Box, Toolbar, useMediaQuery, useTheme, Drawer } from "@mui/material";
import TopNav from "@/Components/Navbar/TopNav/TopNav";
import SideNav from "@/Components/Navbar/SideNav/SideNav";
import { useLocation } from "react-router-dom";

export default function DashboardLayout({ children }) {
  const theme = useTheme();
  const isMdDown = useMediaQuery(theme.breakpoints.down("md")); // true on md, sm, xs

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(!isMdDown);

  // Auto-close/open on resize
  useEffect(() => {
    setSidebarOpen(!isMdDown);
  }, [isMdDown]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const Location = useLocation().pathname.split("/").pop();
  // console.log(Location);
  const hiddenPaths = [
    "register",
    "login",
    "forgot-password",
    "reset-password",
    "resend-verification",
    "verify-email",
  ];
  const shouldHide = hiddenPaths.includes(Location);
  // console.log(shouldHide);

  return (
    <Box sx={{ display: "flex" }}>
      {/* Top Navigation */}
      <TopNav toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

      {/* Sidebar */}
      {isMdDown ? (
        // Mobile: temporary overlay drawer
        <Drawer
          variant="temporary"
          open={sidebarOpen}
          onClose={toggleSidebar}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": { width: 220, boxSizing: "border-box" },
          }}
        >
          <SideNav sidebarOpen={true} /> {/* always fully open in Drawer */}
        </Drawer>
      ) : (
        // Desktop: collapsible permanent drawer
        <Drawer
          variant="permanent"
          open={sidebarOpen}
          sx={{
            width: sidebarOpen ? 220 : 80,
            flexShrink: 0,
            whiteSpace: "nowrap",
            "& .MuiDrawer-paper": {
              width: sidebarOpen ? 220 : 80,
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: "hidden",
            },
          }}
        >
          <SideNav sidebarOpen={sidebarOpen} />
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 1,
          transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: isMdDown ? 0 : sidebarOpen ? "20px" : "0px",
        }}
      >
        <Toolbar /> {/* TopNav spacer */}
        {children}
      </Box>
    </Box>
  );
}
