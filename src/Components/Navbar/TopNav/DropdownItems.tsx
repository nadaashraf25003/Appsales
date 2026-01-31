import InboxIcon from "@mui/icons-material/Inbox";
import SendIcon from "@mui/icons-material/Send";
import DraftsIcon from "@mui/icons-material/Drafts";
import CommentIcon from "@mui/icons-material/Comment";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

// Mail dropdown items
export const mailItems = [
  { label: "Inbox", icon: InboxIcon, badge: 3 },
  { label: "Sent", icon: SendIcon },
  { label: "Drafts", icon: DraftsIcon },
];

// Notifications dropdown items
export const notificationItems = [
  { label: "New comment", icon: CommentIcon, badge: 2 },
  { label: "New like", icon: ThumbUpIcon },
];

// Profile dropdown
// Note: Logout variant "danger" can be used for red text in the UI
export const profileItems = [
  { 
    label: "Profile", 
    icon: PersonIcon, 
    url: "/erp/profile" 
  },
  { 
    label: "Settings", 
    icon: SettingsIcon, 
    url: "/erp/settings/general" // Updated to match your new settings route
  },
  { 
    label: "Logout", 
    icon: LogoutIcon, 
    variant: "danger" 
  },
];