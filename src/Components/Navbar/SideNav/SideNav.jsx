import React, { useState, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { userData } from "./SideNavItems/userData";

// UI Functional Icons
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

// Navigation Icons
import Dashboard from "@mui/icons-material/Dashboard";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Analytics from "@mui/icons-material/Analytics";
import Notifications from "@mui/icons-material/Notifications";
import PointOfSale from "@mui/icons-material/PointOfSale";
import ShoppingCart from "@mui/icons-material/ShoppingCart";
import AssignmentReturn from "@mui/icons-material/AssignmentReturn";
import People from "@mui/icons-material/People";
import Inventory from "@mui/icons-material/Inventory";
import Category from "@mui/icons-material/Category";
import LocalShipping from "@mui/icons-material/LocalShipping";
import AccountBalance from "@mui/icons-material/AccountBalance";
import Receipt from "@mui/icons-material/Receipt";
import Assessment from "@mui/icons-material/Assessment";
import BarChart from "@mui/icons-material/BarChart";
import Settings from "@mui/icons-material/Settings";
import Paid from "@mui/icons-material/Paid";
import Group from "@mui/icons-material/Group"; // Import this for Users
import Apartment from "@mui/icons-material/Apartment";
import Add from "@mui/icons-material/Add";
import Domain from "@mui/icons-material/Domain";

/**
 * iconMap connects the string values in userData.ts 
 * to the actual Material UI Icon components.
 */
const iconMap = {
  Dashboard,
  AccountCircle,
  Analytics,
  Notifications,
  PointOfSale,
  ShoppingCart,
  AssignmentReturn,
  People,
  Inventory,
  Category,
  LocalShipping,
  AccountBalance,
  Receipt,
  Assessment,
  BarChart,
  Settings,
  Paid,
  Group, // Add to map
  Apartment,
  Add,
  Domain
};

export default function SideNav({ sidebarOpen }) {
  const user = userData.admin;
  const location = useLocation();

  const [manualToggles, setManualToggles] = useState({});

  const openSections = useMemo(() => {
    const sections = { ...manualToggles };

    user.sideNav.forEach((group) => {
      // Auto-open logic
      if (manualToggles[group.section] === undefined && group.items) {
        const hasActiveChild = group.items.some((item) =>
          // modification: use startsWith to keep section open during sub-page navigation
          location.pathname.startsWith(item.url)
        );
        if (hasActiveChild) {
          sections[group.section] = true;
        }
      }
    });

    return sections;
  }, [location.pathname, manualToggles, user.sideNav]);

  const toggleSection = (section) => {
    setManualToggles((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderIcon = (iconName) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent fontSize="small" /> : null;
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 bg-white dark:bg-gray-900
      border-r border-gray-200 dark:border-gray-700 shadow
      transition-all duration-300
      ${sidebarOpen ? "w-56" : "w-20"}`}
    >
      <div className="h-14 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <span className="font-bold text-lg text-primary">
          {sidebarOpen ? "ERP Admin" : "EA"}
        </span>
      </div>

      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <img
            src={user.userTopNav.avatar}
            alt={user.userTopNav.name}
            className="w-10 h-10 rounded-full"
          />
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="font-semibold text-md dark:text-white truncate">{user.userTopNav.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-300 truncate">{user.userTopNav.role}</p>
            </div>
          )}
        </div>
      </div>

      <nav className="p-2 space-y-3 overflow-y-auto h-[calc(100vh-128px)]">
        {user.sideNav.map((group) => (
          <div key={group.section}>
            {group.section.toLowerCase() === "main" ? (
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.title}
                    to={item.url}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                      transition-colors
                      ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }
                      ${!sidebarOpen && "justify-center"}`
                    }
                  >
                    {renderIcon(item.icon)}
                    {sidebarOpen && <span>{item.title}</span>}
                  </NavLink>
                ))}
              </div>
            ) : (
              <>
                <button
                  onClick={() => toggleSection(group.section)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg
                            text-gray-600 dark:text-gray-300
                            hover:bg-gray-100 dark:hover:bg-gray-800
                            ${sidebarOpen ? "justify-between" : "justify-center"}`}
                >
                  <div className="flex items-center gap-3">
                    {renderIcon(group.icon)}
                    {sidebarOpen && (
                      <span className="uppercase text-xs font-semibold">
                        {group.section}
                      </span>
                    )}
                  </div>
                  {sidebarOpen &&
                    (openSections[group.section] ? <ExpandLess /> : <ExpandMore />)}
                </button>

                {openSections[group.section] && (
                  <div className="mt-1 space-y-1 ml-4">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.title}
                        to={item.url}
                        // modification: isActive check handles sub-routes for better highlighting
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                          transition-colors
                          ${
                            isActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }
                          ${!sidebarOpen && "justify-center"}`
                        }
                      >
                        {renderIcon(item.icon)}
                        {sidebarOpen && <span>{item.title}</span>}
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}