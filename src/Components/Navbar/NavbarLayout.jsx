import React, { useState, useMemo } from "react";
import { Box, Toolbar, useMediaQuery, useTheme, Drawer } from "@mui/material";
import TopNav from "@/Components/Navbar/TopNav/TopNav";
import SideNav from "@/Components/Navbar/SideNav/SideNav";
import { useLocation } from "react-router-dom";

export default function DashboardLayout({ children }) {
  const theme = useTheme();
  const isMdDown = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();

  // 1. Logic: Only track if the user MANUALLY toggled the sidebar.
  // We initialize it to false so it doesn't conflict with mobile views.
  const [userToggledClosed, setUserToggledClosed] = useState(false);

  // 2. Computed State (Derived): No useEffect needed!
  // If it's a mobile screen, use the toggle state directly.
  // If it's desktop, it's open UNLESS the user manually closed it.
  const sidebarOpen = isMdDown ? !userToggledClosed : !userToggledClosed;

  // Manual override toggle
  const toggleSidebar = () => setUserToggledClosed((prev) => !prev);

  // 3. Path Logic
  const shouldHide = useMemo(() => {
    const path = location.pathname.split("/").pop();
    const hiddenPaths = [
      "register", "login", "forgot-password", 
      "reset-password", "resend-verification", 
      "verify-email", "auth"
    ];
    return hiddenPaths.includes(path);
  }, [location.pathname]);

  return (
    <Box sx={{ display: "flex" }}>
      {!shouldHide && (
        <TopNav toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      )}

      {!shouldHide &&
        (isMdDown ? (
          <Drawer
            variant="temporary"
            open={sidebarOpen}
            onClose={toggleSidebar}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": { width: 220, boxSizing: "border-box" },
            }}
          >
            <SideNav sidebarOpen={true} />
          </Drawer>
        ) : (
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
        ))}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 1,
          transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          // Adjusted logic for cleaner desktop spacing
          marginLeft: 0, 
        }}
      >
        {!shouldHide && <Toolbar />}
        {children}
      </Box>
    </Box>
  );
}