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

  const handleToggleDropdown = (type) => {
    setOpenDropdown(openDropdown === type ? null : type);
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
        {/* Left Side: Toggle & Logo */}
        <div className="flex items-center">
          <IconButton
            edge="start"
            aria-label="menu"
            onClick={toggleSidebar}
            className="mr-4 p-2 rounded-lg bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
          >
            {sidebarOpen ? (
              <MenuOpenIcon className="text-white" fontSize="medium" />
            ) : (
              <MenuIcon className="text-white" fontSize="medium" />
            )}
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
          <Search className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <SearchIconWrapper>
              <SearchIcon className="text-gray-500" />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search here..."
              inputProps={{ "aria-label": "search" }}
              className="text-gray-800 dark:text-light w-full"
            />
          </Search>
        </Box>

        {/* Right Side: Action Icons */}
        <Box className="flex items-center space-x-2 relative">
          {/* Mail */}
          <div className="relative">
            <IconButton
              color="inherit"
              className="text-gray-600 dark:text-gray-300"
              onClick={() => handleToggleDropdown("mail")}
            >
              <Badge badgeContent={mailItems[0]?.badge || 0} color="error">
                <MailIcon />
              </Badge>
            </IconButton>
            <Dropdown
              isOpen={openDropdown === "mail"}
              onClose={() => setOpenDropdown(null)}
              items={mailItems}
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <IconButton
              color="inherit"
              className="text-gray-600 dark:text-gray-300"
              onClick={() => handleToggleDropdown("notifications")}
            >
              <Badge badgeContent={notificationItems[0]?.badge || 0} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Dropdown
              isOpen={openDropdown === "notifications"}
              onClose={() => setOpenDropdown(null)}
              items={notificationItems}
            />
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
              items={profileItems}
            />
          </div>
        </Box>
      </Toolbar>
    </AppBar>
  );
}