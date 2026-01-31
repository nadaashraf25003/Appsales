import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  InputBase,
  alpha,
  styled,
  Badge,
} from "@mui/material";

// Direct path imports for icons
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MailIcon from "@mui/icons-material/Mail";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";

// Import Dropdown component and items
import Dropdown from "@/Components/Global/Dropdown";
import { mailItems, notificationItems, profileItems } from "./DropdownItems";
import { clearToken } from "@/API/token";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";

// Styled Search Components
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: "12px",
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "40ch",
      "&:focus": {
        width: "50ch",
      },
    },
  },
}));

export default function TopNav({ toggleSidebar, sidebarOpen }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Toggle dropdown menus
  const handleToggleDropdown = (type) => {
    setOpenDropdown(openDropdown === type ? null : type);
  };
  const handleSearch = () => {
    if (searchTerm.trim()) {
      // Navigate to products page with search as query param
      navigate(
        `/erp/inventory/items`,
      );
      setSearchTerm(""); // optional: clear input
    }
  };
  // Logout handler
  const handleLogout = () => {
    clearToken(); // Remove accessToken from localStorage
    localStorage.removeItem("user"); // Remove user data
    setOpenDropdown(null); // Close dropdown
    window.dispatchEvent(new Event("storage")); // Notify other components
    navigate("/"); // Redirect to login
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "white",
        color: "rgb(55, 65, 81)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      }}
      className="dark:bg-gray-900 dark:text-light"
    >
      <Toolbar className="justify-between">
        {/* Left Side: Menu & Brand */}
        <div className="flex items-center">
          <IconButton
            edge="start"
            aria-label="menu"
            onClick={toggleSidebar}
            className="mr-4 p-2 rounded-lg bg-gray-900 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <MenuOpenIcon
              className="text-gray-800 dark:text-white"
              fontSize="medium"
            />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            className="hidden md:block font-bold text-gray-800 dark:text-light pl-3"
          >
            AppSales
          </Typography>
        </div>

        {/* Search Bar */}
        <Box className="flex-1 max-w-2xl mx-4">
          <Search className="bg-gray-100 dark:bg-gray-800">
            <SearchIconWrapper>
              <SearchIcon className="text-gray-500" />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              inputProps={{ "aria-label": "search" }}
            />
          </Search>
        </Box>

        {/* Right Side Icons */}
        <Box className="flex items-center space-x-2 relative">
          {/* Mail */}
          {/* <div className="relative">
            <IconButton
              color="inherit"
              className="text-gray-600 dark:text-gray-300"
              onClick={() => handleToggleDropdown("mail")}
            >
              <Badge badgeContent={mailItems[0]?.badge} color="error">
                <MailIcon />
              </Badge>
            </IconButton>
            <Dropdown
              isOpen={openDropdown === "mail"}
              onClose={() => setOpenDropdown(null)}
              items={mailItems}
            />
          </div> */}

          {/* Notifications */}
          {/* <div className="relative">
            <IconButton
              color="inherit"
              className="text-gray-600 dark:text-gray-300"
              onClick={() => handleToggleDropdown("notifications")}
            >
              <Badge badgeContent={notificationItems[0]?.badge} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Dropdown
              isOpen={openDropdown === "notifications"}
              onClose={() => setOpenDropdown(null)}
              items={notificationItems}
            />
          </div> */}
          {/* Right Side Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
  {/* Add Order Button */}
  <button
    onClick={() => navigate("/erp/orders/new")}
    className="btn-primary flex items-center justify-center gap-2 px-4 py-2.5 sm:px-2 sm:py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
  >
    <svg
      className="w-4 h-4 sm:w-5 sm:h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
    <span className="text-sm sm:text-base font-medium">Add Order</span>
  </button>

  {/* Add Customer Button */}
  <button
    onClick={() => navigate("/erp/customers/new")}
    className="btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 sm:px-2 sm:py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
  >
    <svg
      className="w-4 h-4 sm:w-5 sm:h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18 9a3 3 0 11-6 0 3 3 0 016 0zm-9 3v6a3 3 0 003 3h6a3 3 0 003-3v-6"
      />
    </svg>
    <span className="text-sm sm:text-base font-medium">Add Customer</span>
  </button>
</div>
          {/* Profile */}
          <div className="relative">
            <IconButton
              color="inherit"
              className="text-gray-600 dark:text-gray-300"
              onClick={() => handleToggleDropdown("profile")}
            >
              <PersonIcon />
            </IconButton>
            <Dropdown
              isOpen={openDropdown === "profile"}
              onClose={() => setOpenDropdown(null)}
              items={profileItems.map((item) => {
                if (item.label === "Logout") {
                  return { ...item, onClick: handleLogout }; // keep logout handler
                } else if (
                  item.label === "Profile" ||
                  item.label === "Dashboard" ||
                  (item.label === "Home" && item.url)
                ) {
                  return {
                    ...item,
                    onClick: () => {
                      setOpenDropdown(null); // close dropdown
                      navigate(item.url); // redirect to profile page
                    },
                  };
                }
                return item;
              })}
            />
          </div>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
