
import { Home, Settings, Zap, MessageSquare, DollarSign, User } from "lucide-react";
import LandingPage from "./pages/landing";
import DashboardPage from "./pages/dashboard";
import DeploymentConfigPage from "./pages/deployment-config";
import { ChatWorkspace } from "./pages/chat-workspace";
import { Pricing } from "./pages/pricing";
import { Auth } from "./pages/auth";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <Home className="h-4 w-4" />,
    page: <LandingPage />,
  },
  {
    title: "Dashboard", 
    to: "/dashboard",
    icon: <Settings className="h-4 w-4" />,
    page: <DashboardPage />,
  },
  {
    title: "Deploy",
    to: "/deployment-config", 
    icon: <Zap className="h-4 w-4" />,
    page: <DeploymentConfigPage />,
  },
  {
    title: "Chat",
    to: "/chat",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <ChatWorkspace />,
  },
  {
    title: "Pricing",
    to: "/pricing",
    icon: <DollarSign className="h-4 w-4" />,
    page: <Pricing />,
  },
  {
    title: "Auth",
    to: "/auth",
    icon: <User className="h-4 w-4" />,
    page: <Auth />,
  },
];
