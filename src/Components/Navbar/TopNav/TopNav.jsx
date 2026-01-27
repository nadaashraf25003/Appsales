import React from "react";
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
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Mail as MailIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

// Styled Search Components
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '12px',
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '40ch',
      '&:focus': {
        width: '50ch',
      },
    },
  },
}));

export default function TopNav({ toggleSidebar, sidebarOpen }) {
  return (
    <AppBar
      position="fixed"
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'white',
        color: 'rgb(55, 65, 81)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
      className="dark:bg-gray-900 dark:text-light"
    >
      <Toolbar className="justify-between">
        {/* Left Side */}
        <div className="flex items-center">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleSidebar}
            className="mr-4"
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            className="hidden md:block font-bold text-gray-800 dark:text-light"
          >
           AppSales
          </Typography>
        </div>

        {/* Search Bar - Center */}
        <Box className="flex-1 max-w-2xl mx-4">
          <Search className="bg-gray-100 dark:bg-gray-800">
            <SearchIconWrapper>
              <SearchIcon className="text-gray-500" />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search here..."
              inputProps={{ 'aria-label': 'search' }}
              className="text-gray-800 dark:text-light"
            />
          </Search>
        </Box>

        {/* Right Side - Icons */}
        <Box className="flex items-center space-x-2">
          <IconButton color="inherit" className="text-gray-600 dark:text-gray-300">
            <Badge badgeContent={4} color="error">
              <MailIcon />
            </Badge>
          </IconButton>
          
          <IconButton color="inherit" className="text-gray-600 dark:text-gray-300">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <IconButton color="inherit" className="text-gray-600 dark:text-gray-300">
            <PersonIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
