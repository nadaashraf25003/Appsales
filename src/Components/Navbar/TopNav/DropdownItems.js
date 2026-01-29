// Direct path imports for maximum performance
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
  { label: "Inbox", icon: InboxIcon, badge: 3, onClick: () => console.log("Inbox clicked") },
  { label: "Sent", icon: SendIcon, onClick: () => console.log("Sent clicked") },
  { label: "Drafts", icon: DraftsIcon, onClick: () => console.log("Drafts clicked") },
];

// Notifications dropdown items
export const notificationItems = [
  { label: "New comment", icon: CommentIcon, badge: 2, onClick: () => console.log("Comment") },
  { label: "New like", icon: ThumbUpIcon, onClick: () => console.log("Like") },
];

// Profile dropdown items
export const profileItems = [
  { label: "Profile", icon: PersonIcon, onClick: () => console.log("Profile clicked") },
  { label: "Settings", icon: SettingsIcon, onClick: () => console.log("Settings clicked") },
  { label: "Logout", icon: LogoutIcon, onClick: () => console.log("Logout clicked"), variant: "danger" },
];