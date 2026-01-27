import {
  Inbox as InboxIcon,
  Send as SendIcon,
  Drafts as DraftsIcon,
  Comment as CommentIcon,
  ThumbUp as ThumbUpIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

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
