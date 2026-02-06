import InboxIcon from "@mui/icons-material/Inbox";
import SendIcon from "@mui/icons-material/Send";
import DraftsIcon from "@mui/icons-material/Drafts";
import CommentIcon from "@mui/icons-material/Comment";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { HomeIcon } from "lucide-react";

// Get user role from localStorage
const user = localStorage.getItem("user");
const role = user ? JSON.parse(user).role : null;

// Mail dropdown
export const mailItems = [
  { label: "Inbox", icon: InboxIcon, badge: 3 },
  { label: "Sent", icon: SendIcon },
  { label: "Drafts", icon: DraftsIcon },
];

// Notifications dropdown
export const notificationItems = [
  { label: "New comment", icon: CommentIcon, badge: 2 },
  { label: "New like", icon: ThumbUpIcon },
];

// Profile dropdown - attach logout in TopNav dynamically
export const profileItems = [
  { label: "Profile", icon: PersonIcon, url: "/erp/profile" },
  {
    label: "Dashboard",
    icon: SettingsIcon,
    url: role === "Cashier" ? "/erp/profile" : "/erp/dashboard/home",
  },
  { label: "Home", icon: HomeIcon, url: "/" },
  { label: "Logout", icon: LogoutIcon, variant: "danger" }, // onClick added in TopNav
];
