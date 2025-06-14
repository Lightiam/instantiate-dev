import { Cloud, BarChart3, Folder, Rocket, Server, Settings, HelpCircle, User, Activity, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface SidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export function Sidebar({ currentSection, onSectionChange }: SidebarProps) {
  const navigationItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "projects", label: "Projects", icon: Folder, badge: "3" },
    { id: "deployments", label: "Deployments", icon: Rocket, badge: "2" },
    { id: "azure-docker", label: "Azure Docker", icon: Cloud },
    { id: "multi-cloud", label: "Multi-Cloud", icon: Globe, badge: "11" },
    { id: "infrastructure", label: "Import Infrastructure", icon: Server },
    { id: "import-wizard", label: "Import Wizard", icon: Activity },
    { id: "domains", label: "Domain Manager", icon: Globe },
    { id: "monitoring", label: "Monitoring", icon: BarChart3 },
  ];

  const settingsItems = [
    { id: "settings", label: "Settings", icon: Settings },
    { id: "help", label: "Help", icon: HelpCircle },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="text-xl font-bold text-primary font-mono">&lt;/&gt;</div>
          <span className="text-xl font-bold text-white">Instanti8.dev</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Navigation
        </div>
        
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={cn(
              "nav-link w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left",
              currentSection === item.id && "active"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto bg-primary text-xs px-2 py-1 rounded-full text-black">
                {item.badge}
              </span>
            )}
          </button>
        ))}

        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 mt-8">
          Settings
        </div>
        
        {settingsItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={cn(
              "nav-link w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left",
              currentSection === item.id && "active"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
        
        <Link href="/azure-monitor">
          <button className="nav-link w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left">
            <Activity className="w-5 h-5" />
            <span>Azure Monitor</span>
            <span className="ml-auto bg-yellow-500 text-xs px-2 py-1 rounded-full text-black">
              Live
            </span>
          </button>
        </Link>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white">John Developer</div>
            <div className="text-xs text-slate-400">john@company.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}
