import React, { useState, useEffect } from "react";
import { Box, Toolbar, useMediaQuery, useTheme, Drawer } from "@mui/material";
import TopNav from "@/Components/Navbar/TopNav/TopNav";
import SideNav from "@/Components/Navbar/SideNav/SideNav";
import { useLocation } from "react-router-dom";

export default function NavbarLayout({ children }) {
  const theme = useTheme();
  const isMdDown = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();

  // Sidebar state - Auto-initialize based on screen size
  const [sidebarOpen, setSidebarOpen] = useState(!isMdDown);

  // Sync sidebar state when screen size changes
  useEffect(() => {
    setSidebarOpen(!isMdDown);
  }, [isMdDown]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // Logic to hide Navbars on Auth pages
  const currentPath = location.pathname.split("/").pop();
  const hiddenPaths = [
    "login",
    "register",
    "forgot-password",
    "reset-password",
    "resend-verification",
    "verify-email",
    "auth",
  ];
  
  // Check if the current route or any parent route matches a hidden path
  const shouldHide = hiddenPaths.some((path) => 
    location.pathname.includes(path) || currentPath === path
  );

  // If Auth page, just render the content without navbars
  if (shouldHide) {
    return (
      <Box component="main" sx={{ minHeight: "100vh", width: "100%" }}>
        {children}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Top Navigation */}
      <TopNav toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

      {/* Sidebar Navigation */}
      <Box component="nav">
        {isMdDown ? (
          /* Mobile Drawer: Temporary overlay */
          <Drawer
            variant="temporary"
            open={sidebarOpen}
            onClose={toggleSidebar}
            ModalProps={{ keepMounted: true }} // Better mobile performance
            sx={{
              "& .MuiDrawer-paper": { width: 240, boxSizing: "border-box" },
            }}
          >
            <SideNav sidebarOpen={true} />
          </Drawer>
        ) : (
          /* Desktop Drawer: Collapsible permanent */
          <Drawer
            variant="permanent"
            sx={{
              width: sidebarOpen ? 240 : 80,
              flexShrink: 0,
              whiteSpace: "nowrap",
              "& .MuiDrawer-paper": {
                width: sidebarOpen ? 240 : 80,
                transition: theme.transitions.create("width", {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
                overflowX: "hidden",
                borderRight: "1px solid",
                borderColor: "divider",
              },
            }}
          >
            <SideNav sidebarOpen={sidebarOpen} />
          </Drawer>
        )}
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3, // Standard padding for ERP dashboards
          width: { xs: "100%", md: `calc(100% - ${sidebarOpen ? 240 : 80}px)` },
          backgroundColor: "background.default",
          minHeight: "100vh",
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar /> {/* Vertical spacer to push content below fixed TopNav */}
        {children}
      </Box>
    </Box>
  );
}